import nodemailer from 'nodemailer';
import { query } from './db.js';

/**
 * Generates responsive HTML email template for bookings
 */
export function generateEmailHTML(emailType, bookingDetails, rejectionReason = '') {
  const {
    reference,
    serviceName,
    amount,
    totalAmount,
    date,
    travelDate,
    status,
    type,
    fromLocation,
    toLocation,
    travelTime,
    passengerName,
    customerName,
    displayCurrency = 'INR',
  } = bookingDetails || {};

  const displayAmount = amount || totalAmount || '0';
  const displayDate = date || travelDate;
  const displayName = passengerName || customerName || 'Valued Customer';
  const currencySymbol = {
    INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ', CAD: 'CA$', AUD: 'A$', SGD: 'S$', JPY: '¥', THB: '฿', MYR: 'RM', SAR: '﷼', CHF: 'CHF', CNY: '¥'
  }[displayCurrency] || '₹';

  const baseStyles = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f1f5f9; padding: 20px; }
      .wrapper { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
      .header { padding: 36px 28px; text-align: center; }
      .header-confirmed { background: linear-gradient(135deg, #059669 0%, #10b981 100%); }
      .header-rejected { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); }
      .header-pending { background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); }
      .logo { font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin-bottom: 8px; }
      .logo span { color: #fde047; }
      .header h1 { color: #ffffff; font-size: 24px; font-weight: 800; margin-bottom: 6px; }
      .header p { color: rgba(255,255,255,0.92); font-size: 14px; font-weight: 500; }
      .content { padding: 32px 28px; }
      .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
      .message { font-size: 15px; color: #475569; margin-bottom: 24px; line-height: 1.7; }
      .booking-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 20px 0; }
      .booking-card h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 1.2px; color: #64748b; margin-bottom: 18px; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
      .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
      .detail-row:last-child { border-bottom: none; }
      .detail-label { color: #64748b; font-weight: 500; }
      .detail-value { color: #0f172a; font-weight: 600; text-align: right; }
      .amount-highlight { font-size: 22px; color: #059669; font-weight: 800; }
      .ref-code { font-family: 'Courier New', monospace; background: #e0e7ff; color: #4338ca; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 15px; letter-spacing: 1px; }
      .status-pill { display: inline-block; padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
      .status-confirmed { background: #dcfce7; color: #15803d; }
      .status-rejected { background: #fee2e2; color: #b91c1c; }
      .status-pending { background: #e0e7ff; color: #3730a3; }
      .rejection-box { background: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #dc2626; border-radius: 8px; padding: 16px; margin: 20px 0; }
      .rejection-box h4 { color: #dc2626; font-size: 14px; font-weight: 700; margin-bottom: 6px; }
      .rejection-box p { color: #991b1b; font-size: 14px; }
      .info-notice { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 14px 18px; margin: 20px 0; font-size: 13px; color: #065f46; }
      .footer { background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
      .footer .brand { font-weight: 700; color: #4f46e5; margin-bottom: 4px; }
    </style>
  `;

  let headerClass, headerTitle, headerSubtitle, bodyContent;
  const serviceTypeLabel = {
    flight: 'Flight', flights: 'Flight',
    hotel: 'Hotel', hotels: 'Hotel',
    bus: 'Bus', buses: 'Bus',
    property: 'Property', properties: 'Property',
    wellness: 'Health & Healing',
  }[type] || type || 'Service';

  if (emailType === 'booking_confirmed' || emailType === 'confirmation') {
    headerClass = 'header-confirmed';
    headerTitle = 'Booking Confirmed!';
    headerSubtitle = 'Your reservation has been approved by admin';
    bodyContent = `
      <p class="greeting">Dear ${displayName},</p>
      <p class="message">Great news! Your <strong>${serviceTypeLabel}</strong> booking has been reviewed and <strong>officially confirmed</strong> by our administration team. Your reservation is now complete and active.</p>

      <div class="booking-card">
        <h3>Confirmed Reservation Details</h3>
        <div class="detail-row">
          <span class="detail-label">Booking Reference</span>
          <span class="detail-value"><span class="ref-code">${reference || 'N/A'}</span></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Service</span>
          <span class="detail-value">${serviceName || 'OneConnect Verified Service'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Category</span>
          <span class="detail-value">${serviceTypeLabel}</span>
        </div>
        ${fromLocation ? `<div class="detail-row"><span class="detail-label">Origin / Location</span><span class="detail-value">${fromLocation}</span></div>` : ''}
        ${toLocation ? `<div class="detail-row"><span class="detail-label">Destination</span><span class="detail-value">${toLocation}</span></div>` : ''}
        ${displayDate ? `<div class="detail-row"><span class="detail-label">Travel / Check-in Date</span><span class="detail-value">${new Date(displayDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span></div>` : ''}
        ${travelTime ? `<div class="detail-row"><span class="detail-label">Scheduled Time</span><span class="detail-value">${travelTime}</span></div>` : ''}
        <div class="detail-row">
          <span class="detail-label">Total Amount Paid</span>
          <span class="detail-value amount-highlight">${currencySymbol}${Number(displayAmount).toLocaleString('en-IN')}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status</span>
          <span class="detail-value"><span class="status-pill status-confirmed">Confirmed</span></span>
        </div>
      </div>

      <div class="info-notice">
        <strong>Important:</strong> Please retain your reference number <strong>${reference || ''}</strong>. You can view, download, or print your official ticket/voucher anytime from your OneConnect dashboard.
      </div>

      <p class="message">Thank you for choosing OneConnect Multi-Service Marketplace. If you require any further assistance, feel free to contact our customer support team.</p>
    `;
  } else if (emailType === 'booking_rejected' || emailType === 'rejection') {
    headerClass = 'header-rejected';
    headerTitle = 'Booking Status Update';
    headerSubtitle = 'Your booking could not be confirmed';
    bodyContent = `
      <p class="greeting">Dear ${displayName},</p>
      <p class="message">We are writing to update you on your recent <strong>${serviceTypeLabel}</strong> booking request. Unfortunately, our administration team was unable to confirm this reservation.</p>

      <div class="booking-card">
        <h3>Reservation Details</h3>
        <div class="detail-row">
          <span class="detail-label">Booking Reference</span>
          <span class="detail-value"><span class="ref-code">${reference || 'N/A'}</span></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Service</span>
          <span class="detail-value">${serviceName || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status</span>
          <span class="detail-value"><span class="status-pill status-rejected">Rejected</span></span>
        </div>
      </div>

      ${rejectionReason ? `
        <div class="rejection-box">
          <h4>Reason for Rejection</h4>
          <p>${rejectionReason}</p>
        </div>
      ` : ''}

      <p class="message">Any payments collected will be processed for immediate refund to your original payment method within 5-7 business days.</p>
    `;
  } else {
    // booking submitted / pending
    headerClass = 'header-pending';
    headerTitle = 'Booking Request Received';
    headerSubtitle = 'Awaiting administrative verification';
    bodyContent = `
      <p class="greeting">Dear ${displayName},</p>
      <p class="message">Thank you for placing your <strong>${serviceTypeLabel}</strong> booking with OneConnect! Your booking has been received and is currently awaiting administrator confirmation. You will receive an email once approved.</p>

      <div class="booking-card">
        <h3>Booking Summary</h3>
        <div class="detail-row">
          <span class="detail-label">Booking Reference</span>
          <span class="detail-value"><span class="ref-code">${reference || 'N/A'}</span></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Service</span>
          <span class="detail-value">${serviceName || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Total Amount</span>
          <span class="detail-value amount-highlight">${currencySymbol}${Number(displayAmount).toLocaleString('en-IN')}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status</span>
          <span class="detail-value"><span class="status-pill status-pending">Awaiting Approval</span></span>
        </div>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${baseStyles}
</head>
<body>
  <div class="wrapper">
    <div class="header ${headerClass}">
      <div class="logo">One<span>Connect</span></div>
      <h1>${headerTitle}</h1>
      <p>${headerSubtitle}</p>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <p class="brand">OneConnect Multi-Service Marketplace</p>
      <p>Flight • Bus • Hotel • Health & Healing • Real Estate</p>
      <p style="margin-top: 8px;">&copy; ${new Date().getFullYear()} OneConnect. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Send email via Gmail SMTP using Nodemailer
 */
async function sendViaGmail(to, subject, html) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPassword) {
    throw new Error('Gmail SMTP credentials not configured');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPassword,
    },
  });

  const info = await transporter.sendMail({
    from: `"OneConnect Marketplace" <${gmailUser}>`,
    to,
    subject,
    html,
  });

  return { id: info.messageId, method: 'gmail' };
}

/**
 * Send email via Resend API as fallback
 */
async function sendViaResend(to, subject, html) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'OneConnect <onboarding@resend.dev>',
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend API error: ${errorText}`);
  }

  const data = await response.json();
  return { id: data.id, method: 'resend' };
}

/**
 * Main email dispatcher function for booking events
 */
export async function sendBookingNotificationEmail({
  bookingId,
  emailType,
  recipientEmail,
  recipientName,
  bookingDetails,
  rejectionReason,
}) {
  if (!recipientEmail) {
    throw new Error('Recipient email is required to send notification.');
  }

  let subject = '';
  const ref = bookingDetails?.reference || 'Reservation';
  if (emailType === 'booking_confirmed' || emailType === 'confirmation') {
    subject = `Booking Confirmed: ${ref} - OneConnect`;
  } else if (emailType === 'booking_rejected' || emailType === 'rejection') {
    subject = `Booking Update: ${ref} - OneConnect`;
  } else {
    subject = `Booking Submitted: ${ref} - OneConnect`;
  }

  const html = generateEmailHTML(emailType, bookingDetails, rejectionReason);

  let emailResult;
  let sendMethod = 'gmail';

  try {
    emailResult = await sendViaGmail(recipientEmail, subject, html);
    sendMethod = 'gmail';
  } catch (gmailErr) {
    console.warn('Gmail SMTP failed, falling back to Resend:', gmailErr.message);
    try {
      emailResult = await sendViaResend(recipientEmail, subject, html);
      sendMethod = 'resend';
    } catch (resendErr) {
      console.error('All email delivery options failed:', {
        gmail: gmailErr.message,
        resend: resendErr.message,
      });

      // Try logging error to email_logs
      if (bookingId) {
        try {
          await query(
            `INSERT INTO email_logs (booking_id, recipient_email, email_type, subject, status, error_message, sent_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
            [bookingId, recipientEmail, emailType, subject, 'failed', `Gmail: ${gmailErr.message} | Resend: ${resendErr.message}`]
          );
        } catch (e) {}
      }

      throw new Error(`Failed to deliver email: ${gmailErr.message}`);
    }
  }

  // Log successful send
  if (bookingId) {
    try {
      await query(
        `INSERT INTO email_logs (booking_id, recipient_email, email_type, subject, status, email_id, sent_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [bookingId, recipientEmail, emailType, subject, 'sent', emailResult.id || null]
      );
    } catch (e) {}

    try {
      await query(
        `UPDATE bookings SET email_notification_status = 'sent', updated_at = NOW() WHERE id = $1`,
        [bookingId]
      );
    } catch (e) {}
  }

  return {
    success: true,
    emailId: emailResult.id,
    method: sendMethod,
    recipient: recipientEmail,
  };
}
