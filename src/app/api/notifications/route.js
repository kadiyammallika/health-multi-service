import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET — Fetch user's notifications
export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';

    let sql = `SELECT * FROM notifications WHERE user_id = $1`;
    if (unreadOnly) sql += ` AND is_read = false`;
    sql += ` ORDER BY created_at DESC LIMIT 50`;

    const result = await query(sql, [authUser.id]);

    // Get unread count
    const countResult = await query(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false`,
      [authUser.id]
    );

    return NextResponse.json({
      success: true,
      notifications: result.rows,
      unreadCount: parseInt(countResult.rows[0]?.count || '0', 10) || 0,
    });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH — Mark notifications as read
export async function PATCH(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationId, markAllRead } = await request.json();

    if (markAllRead) {
      await query(
        `UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`,
        [authUser.id]
      );
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (!notificationId) {
      return NextResponse.json({ success: false, error: 'Notification ID required' }, { status: 400 });
    }

    const result = await query(
      `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *`,
      [notificationId, authUser.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, notification: result.rows[0] });
  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
