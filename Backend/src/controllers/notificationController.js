const crypto = require('crypto');
const { getDB } = require('../config/db');
const { getWebPushPublicKey } = require('../utils/notificationService');

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

function getWebPushKey(req, res) {
  try {
    const publicKey = getWebPushPublicKey();
    if (!publicKey) {
      return res.status(503).json({
        success: false,
        message: 'Web Push is not configured on the server',
      });
    }
    return res.json({ success: true, publicKey });
  } catch (error) {
    console.error('getWebPushKey error:', error);
    return res.status(500).json({ success: false, message: 'Web Push configuration is invalid' });
  }
}

async function registerWebPushSubscription(req, res) {
  const subscription = req.body?.subscription;
  const endpoint = typeof subscription?.endpoint === 'string' ? subscription.endpoint.trim() : '';
  const p256dhKey = subscription?.keys?.p256dh;
  const authKey = subscription?.keys?.auth;

  let endpointUrl;
  try {
    endpointUrl = new URL(endpoint);
  } catch (error) {
    return res.status(400).json({ success: false, message: 'A valid push subscription is required' });
  }

  if (
    endpoint.length > 2048 ||
    endpointUrl.protocol !== 'https:' ||
    endpointUrl.username ||
    endpointUrl.password ||
    endpointUrl.port ||
    !['fcm.googleapis.com', 'push.services.mozilla.com', 'push.apple.com'].some(
      host => endpointUrl.hostname === host || endpointUrl.hostname.endsWith(`.${host}`)
    ) ||
    typeof p256dhKey !== 'string' ||
    !p256dhKey.trim() ||
    p256dhKey.length > 255 ||
    !/^[A-Za-z0-9_-]+$/.test(p256dhKey) ||
    typeof authKey !== 'string' ||
    !authKey.trim() ||
    authKey.length > 255 ||
    !/^[A-Za-z0-9_-]+$/.test(authKey)
  ) {
    return res.status(400).json({ success: false, message: 'A valid push subscription is required' });
  }

  const endpointHash = crypto.createHash('sha256').update(endpoint).digest('hex');
  try {
    await getDB().execute(
      `INSERT INTO notification_web_push_subscriptions
        (endpoint_hash, endpoint, p256dh_key, auth_key, recipient_user_id)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         endpoint = VALUES(endpoint),
         p256dh_key = VALUES(p256dh_key),
         auth_key = VALUES(auth_key),
         recipient_user_id = VALUES(recipient_user_id),
         updated_at = CURRENT_TIMESTAMP`,
      [endpointHash, endpoint, p256dhKey, authKey, req.user.user_id]
    );
    return res.json({ success: true });
  } catch (error) {
    console.error('registerWebPushSubscription error:', error);
    return res.status(500).json({ success: false, message: 'Failed to register web push subscription' });
  }
}

async function unregisterWebPushSubscription(req, res) {
  const endpoint = typeof req.body?.endpoint === 'string' ? req.body.endpoint.trim() : '';
  if (!endpoint || endpoint.length > 2048) {
    return res.status(400).json({ success: false, message: 'A valid push endpoint is required' });
  }

  const endpointHash = crypto.createHash('sha256').update(endpoint).digest('hex');
  try {
    await getDB().execute(
      'DELETE FROM notification_web_push_subscriptions WHERE endpoint_hash = ? AND recipient_user_id = ?',
      [endpointHash, req.user.user_id]
    );
    return res.json({ success: true });
  } catch (error) {
    console.error('unregisterWebPushSubscription error:', error);
    return res.status(500).json({ success: false, message: 'Failed to unregister web push subscription' });
  }
}

module.exports = {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  registerPushToken,
  unregisterPushToken,
  getWebPushKey,
  registerWebPushSubscription,
  unregisterWebPushSubscription,
};
