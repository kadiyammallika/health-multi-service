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

    // Update provider profile to approved
    const updateRes = await query(
      `UPDATE provider_profiles
       SET application_status = 'approved', updated_at = NOW()
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
         VALUES ($1, 'approval', 'Application Approved!', $2, $3)`,
        [
          provider.user_id,
          `Great news! Your provider application for "${provider.business_name || 'your business'}" has been approved. You now have full access to the Provider Dashboard to manage your listings and bookings.`,
          JSON.stringify({ status: 'approved', business_name: provider.business_name }),
        ]
      );
    } catch (notifErr) {
      console.error('Failed to create in-app notification:', notifErr);
    }

    // Fetch the provider's email and name from users table
    const userRes = await query(
      `SELECT email, name FROM users WHERE id = $1`,
      [provider.user_id]
    );

    // Send approval email notification
    let emailSent = true;
    if (userRes.rows.length > 0) {
      const { email, name: full_name } = userRes.rows[0];
      try {
        await transporter.sendMail({
          from: `"OneConnect" <${process.env.GMAIL_USER}>`,
          to: email,
          subject: '🎉 Your Partner Application has been Approved! — OneConnect',
          html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
              <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
                <p style="color: #e0e7ff; margin: 10px 0 0; font-size: 16px;">Your partner application has been approved</p>
              </div>
              <div style="padding: 30px;">
                <p style="font-size: 16px; color: #374151;">Hi <strong>${full_name || 'Partner'}</strong>,</p>
                <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
                  Great news! Your application to become a service provider on <strong>OneConnect</strong> has been reviewed and <strong style="color: #059669;">approved</strong> by our team.
                </p>
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 15px; color: #166534;">
                    <strong>✅ Business Name:</strong> ${provider.business_name || 'Your Business'}<br/>
                    <strong>✅ Status:</strong> Approved<br/>
                    <strong>✅ Access:</strong> Provider Dashboard is now available
                  </p>
                </div>
                <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
                  You can now <strong>sign in</strong> with your registered email and password to access your Provider Dashboard. From there you can manage your services, view bookings, and grow your business.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login"
                     style="background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #ffffff; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600; display: inline-block;">
                    Sign In Now →
                  </a>
                </div>
                <p style="font-size: 13px; color: #9ca3af; text-align: center; margin-top: 30px;">
                  If you have any questions, reply to this email or contact our support team.
                </p>
              </div>
              <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; font-size: 13px; color: #9ca3af;">© ${new Date().getFullYear()} OneConnect. All rights reserved.</p>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('Failed to send approval email:', emailErr);
        emailSent = false;
      }
    }

    return NextResponse.json({
      success: true,
      message: emailSent
        ? 'Provider approved. Email & in-app notification sent.'
        : 'Provider approved. In-app notification sent (email delivery failed — check Gmail config).',
      emailSent,
      provider,
    });
  } catch (error) {
    console.error('Approve provider error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error approving provider.' },
      { status: 500 }
    );
  }
}
