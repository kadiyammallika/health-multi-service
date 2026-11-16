import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthenticatedUser, identifyAccountType } from '@/lib/auth';
import { sendBookingNotificationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const VALID_STATUSES = ['Pending', 'Confirmed', 'Rejected', 'Cancelled', 'Completed', 'Awaiting Payment'];
const VALID_APPROVAL_STATUSES = ['AWAITING_ADMIN_APPROVAL', 'APPROVED', 'REJECTED'];

// GET — Fetch bookings (customer sees their bookings, provider sees bookings for their listings, admin sees all)
export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    // Admin fetching all bookings
    if (role === 'admin') {
      if (!authUser.accountInfo || authUser.accountInfo.accountType !== 'admin') {
        return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
      }

      const search = searchParams.get('search');
      const status = searchParams.get('status');
      const type = searchParams.get('type');

      let sql = `
        SELECT b.*,
          cu.name as customer_name, cu.email as customer_email,
          CASE WHEN b.provider_id IS NOT NULL THEN pu.name ELSE NULL END as provider_user_name,
          CASE WHEN b.provider_id IS NOT NULL THEN pp.business_name ELSE NULL END as provider_name,
          au.name as approved_by_name
        FROM bookings b
        LEFT JOIN users cu ON b.user_id = cu.id
        LEFT JOIN users pu ON b.provider_id = pu.id
        LEFT JOIN provider_profiles pp ON pp.user_id = b.provider_id
        LEFT JOIN users au ON b.approved_by = au.id
        WHERE 1=1
      `;
      const params = [];
      let paramIdx = 1;

      if (search) {
        sql += ` AND (b.reference ILIKE $${paramIdx} OR cu.name ILIKE $${paramIdx} OR cu.email ILIKE $${paramIdx})`;
        params.push(`%${search}%`);
        paramIdx++;
      }

      if (status) {
        sql += ` AND b.status = $${paramIdx}`;
        params.push(status);
        paramIdx++;
      }

      if (type) {
        sql += ` AND b.type = $${paramIdx}`;
        params.push(type);
        paramIdx++;
      }

      sql += ` ORDER BY b.created_at DESC`;

      const result = await query(sql, params);
      return NextResponse.json({ success: true, bookings: result.rows });
    }

    // Provider fetching bookings for their listings
    if (role === 'provider') {
      const result = await query(
        `SELECT b.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
         FROM bookings b
         LEFT JOIN users u ON b.user_id = u.id
         WHERE b.provider_id = $1
         ORDER BY b.created_at DESC`,
        [authUser.id]
      );
      return NextResponse.json({ success: true, bookings: result.rows });
    }

    // Customer fetching their own bookings
    const result = await query(
      `SELECT b.*,
        CASE WHEN b.provider_id IS NOT NULL THEN pp.business_name ELSE NULL END as provider_name
       FROM bookings b
       LEFT JOIN provider_profiles pp ON pp.user_id = b.provider_id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [authUser.id]
    );

    return NextResponse.json({ success: true, bookings: result.rows });
  } catch (error) {
    console.error('Fetch bookings error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST — Create a new booking + notify provider
export async function POST(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      reference, type, categoryTitle, serviceName,
      fromLocation, toLocation, travelDate, travelTime,
      details, totalAmount, fareBreakdown, paymentMethod,
      providerId, listingId,
      // New fields
      paymentStatus, paymentTransactionId,
      checkInDate, checkOutDate,
      guestDetails, passengerDetails,
      // Currency fields
      displayCurrency, exchangeRate, originalCurrency
    } = body;

    if (!reference || !type || !totalAmount) {
      return NextResponse.json(
        { success: false, error: 'Reference, type, and amount are required.' },
        { status: 400 }
      );
    }

    // All bookings start as AWAITING_ADMIN_APPROVAL
    const initialStatus = 'Pending';
    const adminApprovalStatus = 'AWAITING_ADMIN_APPROVAL';

    // Merge extra details into the details object
    const enrichedDetails = {
      ...(details || {}),
      ...(checkInDate ? { checkInDate } : {}),
      ...(checkOutDate ? { checkOutDate } : {}),
      ...(guestDetails ? { guestDetails } : {}),
      ...(passengerDetails ? { passengerDetails } : {}),
    };

    // Create the booking with provider reference
    const result = await query(
      `INSERT INTO bookings (
        user_id, provider_id, listing_id, reference, type, category_title, service_name,
        from_location, to_location, travel_date, travel_time,
        details, total_amount, fare_breakdown, payment_method, status, payment_status,
        admin_approval_status, display_currency, exchange_rate, original_currency
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *`,
      [
        authUser.id,
        providerId || null,
        listingId || null,
        reference,
        type,
        categoryTitle || type,
        serviceName || '',
        fromLocation || null,
        toLocation || null,
        travelDate || null,
        travelTime || null,
        JSON.stringify(enrichedDetails),
        totalAmount,
        JSON.stringify(fareBreakdown || {}),
        paymentMethod || 'Online Payment',
        initialStatus,
        paymentStatus || 'Pending',
        adminApprovalStatus,
        displayCurrency || 'INR',
        exchangeRate || 1.0,
        originalCurrency || 'INR',
      ]
    );

    const booking = result.rows[0];

    // Create booking_status_history record
    try {
      await query(
        `INSERT INTO booking_status_history (booking_id, old_status, new_status, changed_by, notes)
         VALUES ($1, NULL, $2, $3, $4)`,
        [
          booking.id,
          initialStatus,
          authUser.id,
          `Booking created by customer. Reference: ${reference}`,
        ]
      );
    } catch (histErr) {
      console.error('Booking status history error:', histErr.message);
    }

    // Create payments record
    try {
      await query(
        `INSERT INTO payments (booking_id, user_id, amount, payment_method, transaction_id, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          booking.id,
          authUser.id,
          totalAmount,
          paymentMethod || 'Online Payment',
          paymentTransactionId || null,
          paymentStatus || (providerId ? 'Pending' : 'Completed'),
        ]
      );
    } catch (payErr) {
      console.error('Payment record creation error:', payErr.message);
    }

    // Create notification for the provider (if booking is for a provider listing)
    if (providerId) {
      try {
        const serviceLabel = {
          flights: 'Flight', hotels: 'Hotel', buses: 'Bus',
          properties: 'Property', wellness: 'Wellness'
        }[type] || type;

        await query(
          `INSERT INTO notifications (user_id, type, title, message, data)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            providerId,
            'new_booking',
            `New ${serviceLabel} Booking Request!`,
            `New booking request from ${authUser.name || 'A customer'} for "${serviceName || categoryTitle || type}" — ₹${totalAmount?.toLocaleString('en-IN')}. Reference: ${reference}. Awaiting your approval.`,
            JSON.stringify({
              bookingId: booking.id,
              reference,
              type,
              serviceName,
              customerName: authUser.name,
              totalAmount,
              travelDate,
              status: initialStatus,
            }),
          ]
        );
      } catch (notifErr) {
        console.error('Notification creation error:', notifErr.message);
        // Don't fail the booking if notification fails
      }
    }

    // Also create a notification for the customer
    try {
      const customerTitle = 'Booking Submitted!';
      const customerMessage = `Your booking for "${serviceName || categoryTitle || type}" has been submitted and is awaiting admin approval. Reference: ${reference}. You will receive an email once approved.`;

      await query(
        `INSERT INTO notifications (user_id, type, title, message, data)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          authUser.id,
          'booking_pending',
          customerTitle,
          customerMessage,
          JSON.stringify({
            bookingId: booking.id,
            reference,
            type,
            totalAmount,
            status: initialStatus,
          }),
        ]
      );
    } catch (notifErr) {
      console.error('Customer notification error:', notifErr.message);
    }

    // Send "Booking Submitted" confirmation email to the customer
    try {
      // Use the email from booking details (what customer typed in the form) or their registered email
      const detailsObj = enrichedDetails || {};
      const customerEmail = detailsObj.contactEmail || detailsObj.email
        || detailsObj.guestDetails?.email || detailsObj.passengerDetails?.[0]?.email
        || authUser.email;
      const customerName = detailsObj.contactName || detailsObj.guestDetails?.firstName
        || detailsObj.passengerDetails?.[0]?.name || authUser.name || 'Customer';

      if (customerEmail) {
        console.log('Sending booking submitted email to:', customerEmail);
        try {
          await sendBookingNotificationEmail({
            bookingId: booking.id,
            emailType: 'pending',
            recipientEmail: customerEmail,
            recipientName: customerName,
            bookingDetails: {
              reference,
              serviceName: serviceName || categoryTitle || type,
              amount: totalAmount,
              totalAmount,
              travelDate: travelDate || checkInDate,
              type,
              fromLocation,
              toLocation,
              travelTime,
              customerName,
              displayCurrency: displayCurrency || 'INR',
            },
          });
        } catch (e) {
          console.warn('Direct pending email dispatch note:', e.message);
        }
      }
    } catch (emailErr) {
      console.error('Booking submitted email error:', emailErr.message);
      // Don't fail the booking if email fails
    }

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH — Update booking status (cancel, confirm, reject, complete, etc.)
export async function PATCH(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, status, notes, approvalAction, rejectionReason } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ success: false, error: 'Booking ID is required.' }, { status: 400 });
    }

    // Handle admin approval/rejection actions
    if (approvalAction === 'approve' || approvalAction === 'reject') {
      const accountInfo = authUser.accountInfo || (await identifyAccountType(authUser.id));
      const isAdmin = accountInfo?.accountType === 'admin';
      if (!isAdmin) {
        return NextResponse.json({ success: false, error: 'Admin access required for approval actions.' }, { status: 403 });
      }

      const currentResult = await query(`SELECT b.*, u.email as customer_email, u.name as customer_name FROM bookings b LEFT JOIN users u ON b.user_id = u.id WHERE b.id = $1`, [bookingId]);
      if (currentResult.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Booking not found.' }, { status: 404 });
      }
      const booking = currentResult.rows[0];
      // Use contact email from booking details (what customer typed) if available, else registered email
      const detailsObj = typeof booking.details === 'string' ? JSON.parse(booking.details) : (booking.details || {});
      const recipientEmail = detailsObj.contactEmail || detailsObj.email || detailsObj.passengerDetails?.[0]?.email || detailsObj.guestDetails?.email || booking.customer_email;
      const recipientName = detailsObj.contactName || detailsObj.guestDetails?.firstName || detailsObj.passengerDetails?.[0]?.name || booking.customer_name || 'Customer';

      if (approvalAction === 'approve') {
        await query(
          `UPDATE bookings SET admin_approval_status = 'APPROVED', approved_by = $1, approval_timestamp = NOW(), status = 'Confirmed', payment_status = 'Completed', updated_at = NOW() WHERE id = $2`,
          [authUser.id, bookingId]
        );
        // Log status history
        try {
          await query(`INSERT INTO booking_status_history (booking_id, old_status, new_status, changed_by, notes) VALUES ($1, $2, 'Confirmed', $3, 'Approved by admin')`, [bookingId, booking.status, authUser.id]);
        } catch (e) {}
        // Update payment
        try { await query(`UPDATE payments SET status = 'Completed', updated_at = NOW() WHERE booking_id = $1`, [bookingId]); } catch (e) {}
        // Notify customer
        try {
          await query(`INSERT INTO notifications (user_id, type, title, message, data) VALUES ($1, 'booking_confirmed', 'Booking Approved!', $2, $3)`,
            [booking.user_id, `Your booking ${booking.reference} has been approved by admin. Confirmation email sent.`, JSON.stringify({ bookingId, reference: booking.reference, status: 'Confirmed' })]);
        } catch (e) {}
        // Send booking confirmation email to customer (direct dispatch via Gmail SMTP)
        let emailResult = null;
        try {
          console.log('Sending direct confirmation email to:', recipientEmail, '(name:', recipientName, ')');
          emailResult = await sendBookingNotificationEmail({
            bookingId,
            emailType: 'booking_confirmed',
            recipientEmail: recipientEmail,
            recipientName: recipientName,
            bookingDetails: {
              reference: booking.reference,
              serviceName: booking.service_name,
              amount: booking.total_amount,
              totalAmount: booking.total_amount,
              travelDate: booking.travel_date,
              type: booking.type,
              fromLocation: booking.from_location,
              toLocation: booking.to_location,
              travelTime: booking.travel_time,
              customerName: recipientName,
              displayCurrency: booking.display_currency || 'INR',
            },
          });
        } catch (emailErr) {
          console.error('Direct email send error:', emailErr.message);
        }

        const updated = await query(`SELECT * FROM bookings WHERE id = $1`, [bookingId]);
        return NextResponse.json({
          success: true,
          booking: updated.rows[0],
          emailSent: !!emailResult,
          recipientEmail,
          message: emailResult
            ? `Booking ${booking.reference} approved! Confirmation email sent to ${recipientEmail}.`
            : `Booking ${booking.reference} approved successfully.`,
        });
      }

      if (approvalAction === 'reject') {
        await query(
          `UPDATE bookings SET admin_approval_status = 'REJECTED', approved_by = $1, approval_timestamp = NOW(), rejection_reason = $2, status = 'Rejected', updated_at = NOW() WHERE id = $3`,
          [authUser.id, rejectionReason || 'Rejected by admin', bookingId]
        );
        try {
          await query(`INSERT INTO booking_status_history (booking_id, old_status, new_status, changed_by, notes) VALUES ($1, $2, 'Rejected', $3, $4)`, [bookingId, booking.status, authUser.id, rejectionReason || 'Rejected by admin']);
        } catch (e) {}
        // Notify customer
        try {
          await query(`INSERT INTO notifications (user_id, type, title, message, data) VALUES ($1, 'booking_rejected', 'Booking Rejected', $2, $3)`,
            [booking.user_id, `Your booking ${booking.reference} has been rejected.${rejectionReason ? ' Reason: ' + rejectionReason : ''}`, JSON.stringify({ bookingId, reference: booking.reference, status: 'Rejected' })]);
        } catch (e) {}
        // Send booking rejection email to customer
        let emailResult = null;
        try {
          console.log('Sending direct rejection email to:', recipientEmail, '(name:', recipientName, ')');
          emailResult = await sendBookingNotificationEmail({
            bookingId,
            emailType: 'booking_rejected',
            recipientEmail: recipientEmail,
            recipientName: recipientName,
            rejectionReason: rejectionReason || 'Rejected by admin',
            bookingDetails: {
              reference: booking.reference,
              serviceName: booking.service_name,
              amount: booking.total_amount,
              totalAmount: booking.total_amount,
              travelDate: booking.travel_date,
              type: booking.type,
              fromLocation: booking.from_location,
              toLocation: booking.to_location,
              customerName: recipientName,
              displayCurrency: booking.display_currency || 'INR',
            },
          });
        } catch (emailErr) {
          console.error('Direct email send error:', emailErr.message);
        }

        const updated = await query(`SELECT * FROM bookings WHERE id = $1`, [bookingId]);
        return NextResponse.json({
          success: true,
          booking: updated.rows[0],
          emailSent: !!emailResult,
          recipientEmail,
          message: emailResult
            ? `Booking rejected and notification email sent to ${recipientEmail}.`
            : `Booking rejected.`,
        });
      }
    }

    if (!status) {
      return NextResponse.json({ success: false, error: 'Status is required.' }, { status: 400 });
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if user is admin
    const accountInfo = authUser.accountInfo || (await identifyAccountType(authUser.id));
    const isAdmin = accountInfo?.accountType === 'admin';

    // Fetch the current booking — admin can access any booking
    let currentResult;
    if (isAdmin) {
      currentResult = await query(
        `SELECT * FROM bookings WHERE id = $1`,
        [bookingId]
      );
    } else {
      currentResult = await query(
        `SELECT * FROM bookings WHERE id = $1 AND (user_id = $2 OR provider_id = $2)`,
        [bookingId, authUser.id]
      );
    }

    if (currentResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Booking not found.' }, { status: 404 });
    }

    const oldBooking = currentResult.rows[0];
    const oldStatus = oldBooking.status;

    // Build the update query — also update payment_status when confirmed or cancelled
    let updateSql;
    let updateParams;

    if (status === 'Confirmed' && oldStatus === 'Pending') {
      // Provider/admin accepting: set status to Confirmed and payment_status to Completed
      updateSql = `UPDATE bookings SET status = $1, payment_status = 'Completed', updated_at = NOW()
                    WHERE id = $2 RETURNING *`;
      updateParams = [status, bookingId];
    } else if (status === 'Cancelled') {
      // Cancellation: also update payment_status to Refund Pending
      const newPaymentStatus = oldBooking.payment_status === 'Completed' ? 'Refund Pending' : oldBooking.payment_status;
      updateSql = `UPDATE bookings SET status = $1, payment_status = $3, updated_at = NOW()
                    WHERE id = $2 RETURNING *`;
      updateParams = [status, bookingId, newPaymentStatus];
    } else {
      updateSql = `UPDATE bookings SET status = $1, updated_at = NOW()
                    WHERE id = $2 RETURNING *`;
      updateParams = [status, bookingId];
    }

    const result = await query(updateSql, updateParams);

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Booking not found or update failed.' }, { status: 404 });
    }

    const booking = result.rows[0];

    // Insert into booking_status_history
    try {
      await query(
        `INSERT INTO booking_status_history (booking_id, old_status, new_status, changed_by, notes)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          bookingId,
          oldStatus,
          status,
          authUser.id,
          notes || `Status changed from ${oldStatus} to ${status}`,
        ]
      );
    } catch (histErr) {
      console.error('Status history insert error:', histErr.message);
    }

    // Update payment record when provider confirms
    if (status === 'Confirmed' && oldStatus === 'Pending') {
      try {
        await query(
          `UPDATE payments SET status = 'Completed', updated_at = NOW() WHERE booking_id = $1`,
          [bookingId]
        );
      } catch (payErr) {
        console.error('Payment status update error:', payErr.message);
      }
    }

    // Send confirmation email if status transitioned to Confirmed
    if (status === 'Confirmed' && oldStatus !== 'Confirmed') {
      try {
        const custRes = await query(`SELECT email, name FROM users WHERE id = $1`, [booking.user_id]);
        const cust = custRes.rows[0] || {};
        const detailsObj = typeof booking.details === 'string' ? JSON.parse(booking.details) : (booking.details || {});
        const recipientEmail = detailsObj.contactEmail || detailsObj.email || detailsObj.passengerDetails?.[0]?.email || detailsObj.guestDetails?.email || cust.email;
        const recipientName = detailsObj.contactName || detailsObj.guestDetails?.firstName || detailsObj.passengerDetails?.[0]?.name || cust.name || 'Customer';

        if (recipientEmail) {
          await sendBookingNotificationEmail({
            bookingId: booking.id,
            emailType: 'booking_confirmed',
            recipientEmail,
            recipientName,
            bookingDetails: {
              reference: booking.reference,
              serviceName: booking.service_name,
              amount: booking.total_amount,
              totalAmount: booking.total_amount,
              travelDate: booking.travel_date,
              type: booking.type,
              fromLocation: booking.from_location,
              toLocation: booking.to_location,
              travelTime: booking.travel_time,
              customerName: recipientName,
              displayCurrency: booking.display_currency || 'INR',
            },
          });
        }
      } catch (err) {
        console.warn('Status change confirmation email warning:', err.message);
      }
    }

    // Notify the other party about status change
    try {
      const isProvider = booking.provider_id === authUser.id;
      const targetUserId = isProvider ? booking.user_id : booking.provider_id;

      if (targetUserId) {
        let notifTitle;
        let notifMessage;
        let notifType = 'booking_update';

        switch (status) {
          case 'Confirmed':
            notifTitle = 'Booking Confirmed!';
            notifMessage = `Booking ${booking.reference} for "${booking.service_name || booking.type}" has been confirmed${isProvider ? ' by the provider' : ''}.`;
            notifType = 'booking_confirmed';
            break;
          case 'Rejected':
            notifTitle = 'Booking Rejected';
            notifMessage = `Booking ${booking.reference} for "${booking.service_name || booking.type}" has been rejected by the provider.${notes ? ' Reason: ' + notes : ''}`;
            notifType = 'booking_rejected';
            break;
          case 'Cancelled':
            notifTitle = 'Booking Cancelled';
            notifMessage = `Booking ${booking.reference} for "${booking.service_name || booking.type}" has been cancelled${isProvider ? ' by the provider' : ' by the customer'}.`;
            notifType = 'booking_cancelled';
            break;
          case 'Completed':
            notifTitle = 'Booking Completed';
            notifMessage = `Booking ${booking.reference} for "${booking.service_name || booking.type}" has been marked as completed.`;
            notifType = 'booking_completed';
            break;
          case 'Awaiting Payment':
            notifTitle = 'Payment Required';
            notifMessage = `Booking ${booking.reference} for "${booking.service_name || booking.type}" is awaiting payment.`;
            notifType = 'booking_awaiting_payment';
            break;
          default:
            notifTitle = `Booking ${status}`;
            notifMessage = `Booking ${booking.reference} for "${booking.service_name || booking.type}" status changed to ${status}.`;
        }

        await query(
          `INSERT INTO notifications (user_id, type, title, message, data)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            targetUserId,
            notifType,
            notifTitle,
            notifMessage,
            JSON.stringify({ bookingId: booking.id, reference: booking.reference, status, oldStatus }),
          ]
        );
      }
    } catch (notifErr) {
      console.error('Status notification error:', notifErr.message);
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
