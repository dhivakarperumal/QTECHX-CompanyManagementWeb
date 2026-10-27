const express = require('express');
const { authenticate } = require('../security/authMiddleware');
const {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  registerPushToken,
  unregisterPushToken,
  getWebPushKey,
  registerWebPushSubscription,
  unregisterWebPushSubscription,
} = require('../controllers/notificationController');

const router = express.Router();

router.use(authenticate);
router.get('/', listNotifications);
router.patch('/read-all', markAllNotificationsRead);
router.get('/web-push-public-key', getWebPushKey);
router.post('/web-push-subscription', registerWebPushSubscription);
router.delete('/web-push-subscription', unregisterWebPushSubscription);
router.post('/push-token', registerPushToken);
router.delete('/push-token', unregisterPushToken);
router.patch('/:id/read', markNotificationRead);

module.exports = router;
