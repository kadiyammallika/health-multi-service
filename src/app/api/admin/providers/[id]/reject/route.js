import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request, { params }) {
  try {
    const authData = await getAuthenticatedUser(request);

    if (!authData) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    if (authData.accountInfo?.accountType !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Access restricted strictly to platform administrators.' },
        { status: 403 }
      );
    }

    const { id } = params;

    const updateRes = await query(
      `UPDATE provider_profiles
       SET application_status = 'rejected', updated_at = NOW()
       WHERE id::text = $1 OR user_id::text = $1
       RETURNING id, user_id, business_name, application_status, updated_at`,
      [id]
    );

    if (updateRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Provider application not found.' },
        { status: 404 }
      );
    }

    const provider = updateRes.rows[0];

    // Create in-app notification for the provider
    try {
      await query(
        `INSERT INTO notifications (user_id, type, title, message, metadata)
         VALUES ($1, 'rejection', 'Application Update', $2, $3)`,
        [
          provider.user_id,
          `Your provider application for "${provider.business_name || 'your business'}" was not approved at this time. You may reapply with updated information or contact support for more details.`,
          JSON.stringify({ status: 'rejected', business_name: provider.business_name }),
        ]
      );
    } catch (notifErr) {
      console.error('Failed to create in-app notification:', notifErr);
    }

    // Fetch the provider's email and name
    const userRes = await query(
      `SELECT email, name FROM users WHERE id = $1`,
      [provider.user_id]
    );

    // Send rejection email notification
    let emailSent = true;
    if (userRes.rows.length > 0) {
      const { email, name: full_name } = userRes.rows[0];
      try {
        await transporter.sendMail({
          from: `"OneConnect" <${process.env.GMAIL_USER}>`,
          to: email,
          subject: 'Update on Your Partner Application — OneConnect',
          html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
              <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Application Update</h1>
                <p style="color: #e0e7ff; margin: 10px 0 0; font-size: 16px;">OneConnect Partner Program</p>
              </div>
              <div style="padding: 30px;">
                <p style="font-size: 16px; color: #374151;">Hi <strong>${full_name || 'Applicant'}</strong>,</p>
                <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
                  Thank you for your interest in becoming a service provider on <strong>OneConnect</strong>. After careful review, we are unable to approve your application at this time.
                </p>
                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 15px; color: #991b1b;">
                    <strong>Business Name:</strong> ${provider.business_name || 'Your Business'}<br/>
                    <strong>Status:</strong> Not Approved
                  </p>
                </div>
                <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
                  This could be due to incomplete information, unverifiable credentials, or other factors. You are welcome to reapply in the future with updated details.
                </p>
                <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
                  If you believe this was a mistake or need more information, please reply to this email and our team will assist you.
                </p>
                <p style="font-size: 13px; color: #9ca3af; text-align: center; margin-top: 30px;">
                  Thank you for your understanding.
                </p>
              </div>
              <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; font-size: 13px; color: #9ca3af;">© ${new Date().getFullYear()} OneConnect. All rights reserved.</p>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('Failed to send rejection email:', emailErr);
        emailSent = false;
      }
    }

    return NextResponse.json({
      success: true,
      message: emailSent
        ? 'Provider rejected. Email & in-app notification sent.'
        : 'Provider rejected. In-app notification sent (email delivery failed — check Gmail config).',
      emailSent,
      provider,
    });
  } catch (error) {
    console.error('Reject provider error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error rejecting provider.' },
      { status: 500 }
    );
  }
}
