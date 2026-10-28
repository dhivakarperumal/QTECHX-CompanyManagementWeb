const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../config/db');

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

function normalizeIds(ids) {
  return [...new Set((Array.isArray(ids) ? ids : [ids])
    .filter((id) => id !== undefined && id !== null && String(id).trim())
    .map((id) => String(id).trim()))];
}

async function resolveUserIds(recipientIds) {
  const ids = normalizeIds(recipientIds);
  if (!ids.length) return [];

  const db = getDB();
  const placeholders = ids.map(() => '?').join(', ');
  const [rows] = await db.execute(
    `SELECT DISTINCT u.user_id
       FROM users u
      WHERE u.status = 'Active'
        AND (
          u.user_id IN (${placeholders})
          OR u.email IN (${placeholders})
          OR EXISTS (
            SELECT 1
              FROM employees e
             WHERE (
               BINARY e.employee_id = BINARY u.user_id
               OR BINARY e.official_email = BINARY u.email
               OR BINARY e.personal_email = BINARY u.email
             )
               AND (
                 e.employee_id IN (${placeholders})
                 OR CAST(e.id AS CHAR) IN (${placeholders})
                 OR e.employee_code IN (${placeholders})
               )
          )
        )`,
    [...ids, ...ids, ...ids, ...ids, ...ids]
  );
  return rows.map((row) => row.user_id);
}

async function persistAndEmit(io, userIds, notification) {
  const db = getDB();
  const [adminRows] = await db.execute(
    `SELECT user_id
       FROM users
      WHERE LOWER(TRIM(status)) = 'active'
        AND LOWER(TRIM(role)) IN ('admin', 'super admin')`
  );
  const uniqueUserIds = normalizeIds([
    ...(Array.isArray(userIds) ? userIds : [userIds]),
    ...adminRows.map((row) => row.user_id),
  ]);
  if (!uniqueUserIds.length) return [];

  const records = uniqueUserIds.map((recipientUserId) => ({
    id: uuidv4(),
    recipientUserId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    link: notification.link || null,
    relatedId: notification.relatedId ? String(notification.relatedId) : null,
  }));

  for (let index = 0; index < records.length; index += 250) {
    const batch = records.slice(index, index + 250);
    const values = batch.flatMap((record) => [
      record.id,
      record.recipientUserId,
      record.type,
      record.title,
      record.message,
      record.link,
      record.relatedId,
    ]);
    const rowsSql = batch.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
    await db.execute(
      `INSERT INTO notifications
        (id, recipient_user_id, type, title, message, link, related_id)
       VALUES ${rowsSql}`,
      values
    );
  }

  const createdAt = new Date().toISOString();
  records.forEach((record) => {
    const payload = {
      id: record.id,
      type: record.type,
      title: record.title,
      message: record.message,
      link: record.link,
      related_id: record.relatedId,
      is_read: 0,
      created_at: createdAt,
    };
    io?.to(`user:${record.recipientUserId}`).emit('notification', payload);
  });

  await sendPushNotifications(records);
  return records.map((record) => record.id);
}

async function sendPushNotifications(records) {
  try {
    const userIds = normalizeIds(records.map((record) => record.recipientUserId));
    if (!userIds.length) return;

    const placeholders = userIds.map(() => '?').join(', ');
    const [tokenRows] = await getDB().execute(
      `SELECT token, recipient_user_id
         FROM notification_push_tokens
        WHERE recipient_user_id IN (${placeholders})`,
      userIds
    );
    if (!tokenRows.length) return;

    const recordByUserId = new Map(records.map((record) => [String(record.recipientUserId), record]));
    const messages = tokenRows.flatMap(({ token, recipient_user_id }) => {
      const record = recordByUserId.get(String(recipient_user_id));
      if (!record) return [];
      return [{
        to: token,
        sound: 'default',
        title: record.title,
        body: record.message,
        data: {
          notificationId: record.id,
          type: record.type,
          link: record.link,
        },
        channelId: 'default',
      }];
    });

    for (let index = 0; index < messages.length; index += 100) {
      const batch = messages.slice(index, index + 100);
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch),
      });
      const result = await response.json();

      if (!response.ok) {
        console.error('[Notifications] Expo push request failed:', response.status, result);
        continue;
      }

      const tickets = Array.isArray(result?.data) ? result.data : [result?.data];
      const invalidTokens = tickets.flatMap((ticket, ticketIndex) =>
        ticket?.details?.error === 'DeviceNotRegistered' && batch[ticketIndex]
          ? [batch[ticketIndex].to]
          : []
      );
      if (invalidTokens.length) {
        const invalidPlaceholders = invalidTokens.map(() => '?').join(', ');
        await getDB().execute(
          `DELETE FROM notification_push_tokens WHERE token IN (${invalidPlaceholders})`,
          invalidTokens
        );
      }

      tickets.forEach((ticket, ticketIndex) => {
        if (ticket?.status === 'error' && ticket?.details?.error !== 'DeviceNotRegistered') {
          console.error('[Notifications] Expo push delivery failed:', {
            token: batch[ticketIndex]?.to,
            message: ticket.message,
            error: ticket.details?.error,
          });
        }
      });
    }
  } catch (error) {
    console.error('[Notifications] Push delivery failed:', error);
  }
}

async function sendNotification(io, recipientIds, notification) {
  const userIds = await resolveUserIds(recipientIds);
  return persistAndEmit(io, userIds, notification);
}

async function sendToRoles(io, roles, notification) {
  const db = getDB();
  const placeholders = roles.map(() => '?').join(', ');
  const [rows] = await db.execute(
    `SELECT user_id FROM users WHERE status = 'Active' AND role IN (${placeholders})`,
    roles
  );
  return persistAndEmit(io, rows.map((row) => row.user_id), notification);
}

async function sendToAdmins(io, notification) {
  return sendToRoles(io, ['Admin', 'Super Admin'], notification);
}

async function sendToAllActiveUsers(io, notification) {
  const db = getDB();
  const [rows] = await db.execute("SELECT user_id FROM users WHERE status = 'Active'");
  return persistAndEmit(io, rows.map((row) => row.user_id), notification);
}

async function resolveEmployeeName(employeeIdentifier, fallbackName = null) {
  if (employeeIdentifier === undefined || employeeIdentifier === null || !String(employeeIdentifier).trim()) {
    return fallbackName || 'An employee';
  }

  const identifier = String(employeeIdentifier).trim();
  try {
    const db = getDB();
    const [userRows] = await db.execute(
      'SELECT email, username FROM users WHERE user_id = ? LIMIT 1',
      [identifier]
    );
    const identifiers = normalizeIds([
      identifier,
      userRows[0]?.email,
      userRows[0]?.username,
    ]);
    const placeholders = identifiers.map(() => '?').join(', ');
    const [rows] = await db.execute(
      `SELECT first_name, last_name
         FROM employees
        WHERE employee_id IN (${placeholders})
           OR CAST(id AS CHAR) IN (${placeholders})
           OR employee_code IN (${placeholders})
           OR username IN (${placeholders})
           OR official_email IN (${placeholders})
           OR personal_email IN (${placeholders})
        LIMIT 1`,
      [...identifiers, ...identifiers, ...identifiers, ...identifiers, ...identifiers, ...identifiers]
    );
    if (!rows.length) return fallbackName || 'An employee';
    return [rows[0].first_name, rows[0].last_name].filter(Boolean).join(' ').trim() || fallbackName || 'An employee';
  } catch (error) {
    console.error('[Notifications] Employee name lookup failed:', error);
    return fallbackName || 'An employee';
  }
}

function parseAudienceValues(value) {
  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      if (item && typeof item === 'object') {
        return [item.name, item.label, item.department, item.team, item.value].filter(Boolean);
      }
      return [item];
    });
  }
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parseAudienceValues(parsed);
    } catch (error) {
      console.warn('[Notifications] Could not parse calendar audience list:', error.message);
    }
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

async function resolveCalendarAudienceIds(event) {
  const recipients = participantIds(event?.participants);
  const departments = normalizeIds(parseAudienceValues(event?.departments));
  const teams = normalizeIds(parseAudienceValues(event?.teams));
  if (!departments.length && !teams.length) return recipients;

  const db = getDB();
  const audienceClauses = [];
  const audienceValues = [];
  if (departments.length) {
    const placeholders = departments.map(() => '?').join(', ');
    audienceClauses.push(`designation IN (${placeholders})`, `role IN (${placeholders})`);
    audienceValues.push(...departments, ...departments);
  }
  if (teams.length) {
    const placeholders = teams.map(() => '?').join(', ');
    audienceClauses.push(`team_lead IN (${placeholders})`);
    audienceValues.push(...teams);
  }

  const [rows] = await db.execute(
    `SELECT employee_id FROM employees
      WHERE (status = 'Active' OR employment_status = 'Active')
        AND (${audienceClauses.join(' OR ')})`,
    audienceValues
  );
  return normalizeIds([...recipients, ...rows.map((row) => row.employee_id)]);
}

async function resolveCalendarAudienceIdsSafely(event, context) {
  try {
    return await resolveCalendarAudienceIds(event);
  } catch (error) {
    console.error(`[Notifications] ${context} audience lookup failed:`, error);
    return null;
  }
}

async function notifySafely(req, recipientIds, notification, context) {
  try {
    return await sendNotification(req.app.get('io'), recipientIds, notification);
  } catch (error) {
    console.error(`[Notifications] ${context} delivery failed:`, error);
    return [];
  }
}

async function notifyRolesSafely(req, roles, notification, context) {
  try {
    return await sendToRoles(req.app.get('io'), roles, notification);
  } catch (error) {
    console.error(`[Notifications] ${context} delivery failed:`, error);
    return [];
  }
}

async function notifyAdminsSafely(req, notification, context) {
  try {
    return await sendToAdmins(req.app.get('io'), notification);
  } catch (error) {
    console.error(`[Notifications] ${context} delivery failed:`, error);
    return [];
  }
}

async function notifyAllUsersSafely(req, notification, context) {
  try {
    return await sendToAllActiveUsers(req.app.get('io'), notification);
  } catch (error) {
    console.error(`[Notifications] ${context} delivery failed:`, error);
    return [];
  }
}

function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    const isParticipant = [
      'user_id', 'userId', 'employee_id', 'employeeId',
      'trainee_id', 'traineeId', 'intern_id', 'internId',
    ].some((field) => value[field] !== undefined && value[field] !== null);
    return isParticipant ? [value] : Object.values(value);
  }
  if (typeof value !== 'string' || !value.trim()) return [];
  const trimmed = value.trim();
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') return Object.values(parsed);
  } catch (error) {
    if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) {
      return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
    }
    console.warn('[Notifications] Could not parse participant list:', error.message);
  }
  return [];
}

function participantIds(participants) {
  return parseJsonArray(participants)
    .map((participant) => {
      if (typeof participant === 'string' || typeof participant === 'number') return participant;
      if (!participant || typeof participant !== 'object') return null;
      return participant.user_id || participant.userId ||
        participant.employee_id || participant.employeeId ||
        participant.trainee_id || participant.traineeId ||
        participant.intern_id || participant.internId ||
        participant.id || participant.value || null;
    })
    .filter(Boolean);
}

module.exports = {
  normalizeIds,
  resolveUserIds,
  sendNotification,
  sendToAdmins,
  sendToAllActiveUsers,
  resolveEmployeeName,
  resolveCalendarAudienceIds,
  resolveCalendarAudienceIdsSafely,
  notifySafely,
  notifyRolesSafely,
  notifyAdminsSafely,
  notifyAllUsersSafely,
  participantIds,
};
