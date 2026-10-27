const express = require('express');
const { authenticate } = require('../security/authMiddleware');
const {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  registerPushToken,
  unregisterPushToken,
} = require('../controllers/notificationController');

const router = express.Router();

router.use(authenticate);
router.get('/', listNotifications);
router.patch('/read-all', markAllNotificationsRead);
router.post('/push-token', registerPushToken);
router.delete('/push-token', unregisterPushToken);
router.patch('/:id/read', markNotificationRead);

module.exports = router;
