import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthenticatedUser, identifyAccountType } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const VALID_STATUSES = ['Pending', 'Confirmed', 'Rejected', 'Cancelled', 'Completed'];

// GET — Fetch wellness appointments (role-aware)
export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    // Admin can see all appointments
    if (role === 'admin') {
      const accountInfo = authUser.accountInfo || (await identifyAccountType(authUser.id));
      if (accountInfo?.accountType !== 'admin') {
        return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
      }
      const result = await query(
        `SELECT wa.*, u.name as customer_name, u.email as customer_email
         FROM wellness_appointments wa
         LEFT JOIN users u ON wa.user_id = u.id
         ORDER BY wa.created_at DESC`
      );
      return NextResponse.json({ success: true, appointments: result.rows });
    }

    // Provider can see appointments linked to their listings
    if (role === 'provider') {
      const result = await query(
        `SELECT wa.*, u.name as customer_name, u.email as customer_email
         FROM wellness_appointments wa
         LEFT JOIN users u ON wa.user_id = u.id
         LEFT JOIN bookings b ON b.user_id = wa.user_id
           AND b.type = 'wellness'
           AND b.provider_id = $1
         WHERE b.provider_id IS NOT NULL
         ORDER BY wa.created_at DESC`,
        [authUser.id]
      );
      return NextResponse.json({ success: true, appointments: result.rows });
    }

    // Customer sees their own
    const result = await query(
      `SELECT * FROM wellness_appointments WHERE user_id = $1 ORDER BY created_at DESC`,
      [authUser.id]
    );

    return NextResponse.json({ success: true, appointments: result.rows });
  } catch (error) {
    console.error('Fetch wellness error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST — Create a new wellness appointment
export async function POST(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      practitionerName, specialization, date, timeSlot,
      consultationMode, duration, price, patientName, patientEmail, patientPhone, notes,
      providerId, listingId
    } = body;

    if (!practitionerName || !date || !timeSlot) {
      return NextResponse.json(
        { success: false, error: 'Practitioner, date, and time slot are required.' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO wellness_appointments (
        user_id, practitioner_name, specialization, date, time_slot,
        consultation_mode, duration, price, patient_name, patient_email, patient_phone, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'Pending')
      RETURNING *`,
      [
        authUser.id,
        practitionerName,
        specialization || null,
        date,
        timeSlot,
        consultationMode || 'Online',
        duration || '45 mins',
        price || 0,
        patientName || authUser.name,
        patientEmail || authUser.email || null,
        patientPhone || null,
        notes || null,
      ]
    );

    const appointment = result.rows[0];

    // Notify provider if linked to a provider listing
    if (providerId) {
      try {
        await query(
          `INSERT INTO notifications (user_id, type, title, message, data)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            providerId,
            'new_booking',
            'New Wellness Appointment Request!',
            `New appointment request from ${authUser.name || 'A patient'} with ${practitionerName} (${specialization || 'General'}) on ${date} at ${timeSlot}. Awaiting your approval.`,
            JSON.stringify({
              appointmentId: appointment.id,
              practitionerName,
              date,
              timeSlot,
              customerName: authUser.name,
              price,
            }),
          ]
        );
      } catch (notifErr) {
        console.error('Wellness notification error:', notifErr.message);
      }
    }

    // Notify customer
    try {
      await query(
        `INSERT INTO notifications (user_id, type, title, message, data)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          authUser.id,
          'booking_pending',
          'Appointment Submitted!',
          `Your appointment with ${practitionerName} on ${date} at ${timeSlot} has been submitted and is awaiting confirmation.`,
          JSON.stringify({
            appointmentId: appointment.id,
            practitionerName,
            date,
            timeSlot,
          }),
        ]
      );
    } catch (notifErr) {
      console.error('Customer notification error:', notifErr.message);
    }

    return NextResponse.json({ success: true, appointment }, { status: 201 });
  } catch (error) {
    console.error('Create wellness error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH — Update appointment status (with authorization + notifications)
export async function PATCH(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { appointmentId, status, notes } = await request.json();

    if (!appointmentId || !status) {
      return NextResponse.json({ success: false, error: 'Appointment ID and status required.' }, { status: 400 });
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Fetch appointment first
    const existing = await query(
      `SELECT * FROM wellness_appointments WHERE id = $1`,
      [appointmentId]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Appointment not found.' }, { status: 404 });
    }

    const appointment = existing.rows[0];

    // Authorization: only the patient (customer) or a provider/admin can update
    const accountInfo = authUser.accountInfo || (await identifyAccountType(authUser.id));
    const isAdmin = accountInfo?.accountType === 'admin';
    const isProvider = accountInfo?.accountType === 'provider';
    const isOwner = appointment.user_id === authUser.id;

    if (!isOwner && !isProvider && !isAdmin) {
      return NextResponse.json({ success: false, error: 'Not authorized to update this appointment.' }, { status: 403 });
    }

    // Customers can only cancel their own appointments
    if (isOwner && !isProvider && !isAdmin && status !== 'Cancelled') {
      return NextResponse.json({ success: false, error: 'Customers can only cancel appointments.' }, { status: 403 });
    }

    const oldStatus = appointment.status;

    const result = await query(
      `UPDATE wellness_appointments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, appointmentId]
    );

    const updated = result.rows[0];

    // Also update linked booking if exists
    try {
      await query(
        `UPDATE bookings SET status = $1, admin_approval_status = $2, updated_at = NOW()
         WHERE type = 'wellness' AND user_id = $3
         AND details::text LIKE $4`,
        [status, status === 'Confirmed' ? 'APPROVED' : status === 'Rejected' ? 'REJECTED' : status, appointment.user_id, `%${appointment.practitioner_name}%`]
      );
    } catch (e) {
      // Best effort
    }

    // Send confirmation/rejection EMAIL to patient
    if (status === 'Confirmed' || status === 'Rejected') {
      try {
        // Get patient email: from appointment record, or from user table
        let recipientEmail = appointment.patient_email;
        if (!recipientEmail) {
          const userResult = await query(`SELECT email FROM users WHERE id = $1`, [appointment.user_id]);
          recipientEmail = userResult.rows[0]?.email;
        }
        const recipientName = appointment.patient_name || 'Patient';

        if (recipientEmail) {
          const emailType = status === 'Confirmed' ? 'booking_confirmed' : 'booking_rejected';
          console.log(`Sending wellness ${emailType} email to:`, recipientEmail);
          const emailRes = await fetch(new URL('/api/email/send', request.url).toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Cookie: request.headers.get('cookie') || '' },
            body: JSON.stringify({
              emailType,
              recipientEmail,
              recipientName,
              bookingDetails: {
                reference: `WEL-${appointmentId}`,
                serviceName: appointment.practitioner_name,
                amount: appointment.price,
                totalAmount: appointment.price,
                travelDate: appointment.date,
                type: 'wellness',
                travelTime: appointment.time_slot,
                customerName: recipientName,
                rejectionReason: notes || 'Rejected by admin',
              },
            }),
          });
          const emailData = await emailRes.json();
          console.log('Wellness email result:', emailData);
        }
      } catch (emailErr) {
        console.error('Wellness email send error:', emailErr.message);
      }
    }

    // Send notification to the other party
    try {
      // If customer updates → notify provider; if provider/admin updates → notify customer
      const targetUserId = isOwner ? appointment.provider_id : appointment.user_id;
      if (targetUserId) {
        let notifTitle, notifMessage, notifType;
        if (isOwner && status === 'Cancelled') {
          notifTitle = 'Appointment Cancelled by Patient';
          notifMessage = `Patient cancelled their appointment with ${appointment.practitioner_name} on ${appointment.date} at ${appointment.time_slot}.${notes ? ' Reason: ' + notes : ''}`;
          notifType = 'booking_cancelled';
        } else {
          switch (status) {
            case 'Confirmed':
              notifTitle = 'Appointment Confirmed!';
              notifMessage = `Your appointment with ${appointment.practitioner_name} on ${appointment.date} at ${appointment.time_slot} has been confirmed.`;
              notifType = 'booking_confirmed';
              break;
            case 'Rejected':
              notifTitle = 'Appointment Rejected';
              notifMessage = `Your appointment with ${appointment.practitioner_name} on ${appointment.date} has been rejected.${notes ? ' Reason: ' + notes : ''}`;
              notifType = 'booking_rejected';
              break;
            case 'Completed':
              notifTitle = 'Appointment Completed';
              notifMessage = `Your appointment with ${appointment.practitioner_name} has been marked as completed.`;
              notifType = 'booking_completed';
              break;
            case 'Cancelled':
              notifTitle = 'Appointment Cancelled';
              notifMessage = `Appointment with ${appointment.practitioner_name} on ${appointment.date} has been cancelled.${notes ? ' Reason: ' + notes : ''}`;
              notifType = 'booking_cancelled';
              break;
            default:
              notifTitle = `Appointment ${status}`;
              notifMessage = `Your appointment with ${appointment.practitioner_name} status changed to ${status}.`;
              notifType = 'booking_update';
          }
        }
        await query(
          `INSERT INTO notifications (user_id, type, title, message, data)
           VALUES ($1, $2, $3, $4, $5)`,
          [targetUserId, notifType, notifTitle, notifMessage, JSON.stringify({ appointmentId, status, oldStatus })]
        );
      }
    } catch (notifErr) {
      console.error('Wellness notification error:', notifErr.message);
    }

    return NextResponse.json({ success: true, appointment: updated });
  } catch (error) {
    console.error('Update wellness error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
