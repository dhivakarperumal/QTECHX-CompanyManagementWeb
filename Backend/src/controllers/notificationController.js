const { getDB } = require('../config/db');

async function listNotifications(req, res) {
  try {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const [rows] = await getDB().execute(
      `SELECT id, type, title, message, link, related_id, is_read, created_at
         FROM notifications
        WHERE recipient_user_id = ?
        ORDER BY created_at DESC
        LIMIT ?`,
      [req.user.user_id, limit]
    );
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error('listNotifications error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load notifications' });
  }
}

async function markNotificationRead(req, res) {
  try {
    const db = getDB();
    const [result] = await db.execute(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND recipient_user_id = ?',
      [req.params.id, req.user.user_id]
    );
    if (!result.affectedRows) {
      const [rows] = await db.execute(
        'SELECT id FROM notifications WHERE id = ? AND recipient_user_id = ? LIMIT 1',
        [req.params.id, req.user.user_id]
      );
      if (!rows.length) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }
    }
    return res.json({ success: true });
  } catch (error) {
    console.error('markNotificationRead error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
}

async function markAllNotificationsRead(req, res) {
  try {
    await getDB().execute(
      'UPDATE notifications SET is_read = 1 WHERE recipient_user_id = ? AND is_read = 0',
      [req.user.user_id]
    );
    return res.json({ success: true });
  } catch (error) {
    console.error('markAllNotificationsRead error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update notifications' });
  }
}

async function registerPushToken(req, res) {
  const token = String(req.body?.token || '').trim();
  if (!/^Expo(nent)?PushToken\[[^\]]+\]$/.test(token)) {
    return res.status(400).json({ success: false, message: 'A valid Expo push token is required' });
  }

  try {
    await getDB().execute(
      `INSERT INTO notification_push_tokens (token, recipient_user_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE
         recipient_user_id = VALUES(recipient_user_id),
         updated_at = CURRENT_TIMESTAMP`,
      [token, req.user.user_id]
    );
    return res.json({ success: true });
  } catch (error) {
    console.error('registerPushToken error:', error);
    return res.status(500).json({ success: false, message: 'Failed to register push token' });
  }
}

async function unregisterPushToken(req, res) {
  const token = String(req.body?.token || '').trim();
  if (!/^Expo(nent)?PushToken\[[^\]]+\]$/.test(token)) {
    return res.status(400).json({ success: false, message: 'A valid Expo push token is required' });
  }

  try {
    await getDB().execute(
      'DELETE FROM notification_push_tokens WHERE token = ? AND recipient_user_id = ?',
      [token, req.user.user_id]
    );
    return res.json({ success: true });
  } catch (error) {
    console.error('unregisterPushToken error:', error);
    return res.status(500).json({ success: false, message: 'Failed to unregister push token' });
  }
}

module.exports = {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  registerPushToken,
  unregisterPushToken,
};
