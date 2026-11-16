import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { sendBookingNotificationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/email/send
 * Public or authenticated endpoint for sending email notifications
 */
export async function POST(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    // Allow internal calls or authenticated calls
    if (!authUser) {
      // Check if authorization or secret header is passed, or if request is local
      const isInternal = request.headers.get('x-internal-call') === 'true';
      if (!isInternal) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await request.json();
    const { bookingId, emailType, recipientEmail, recipientName, bookingDetails, rejectionReason } = body;

    if (!recipientEmail) {
      return NextResponse.json(
        { success: false, error: 'recipientEmail is required.' },
        { status: 400 }
      );
    }

    const result = await sendBookingNotificationEmail({
      bookingId,
      emailType: emailType || 'booking_confirmed',
      recipientEmail,
      recipientName,
      bookingDetails,
      rejectionReason,
    });

    return NextResponse.json({
      success: true,
      emailId: result.emailId,
      method: result.method,
      message: `Email dispatched successfully via ${result.method}.`,
    });
  } catch (error) {
    console.error('Email API send error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error while sending email.' },
      { status: 500 }
    );
  }
}
