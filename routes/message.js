const express = require('express')
const auth = require('../middleware/authentication');
const { sendMessage, allMessages, deleteMessage, clearNotifications } = require('../controllers/messageController');

const router = express.Router()

router.route('/').post(auth, sendMessage)
router.route('/:chatId').get(auth, allMessages)
router.route('/:messageId').delete(auth, deleteMessage)
router.route('/clear-notifications').put(auth, clearNotifications)

module.exports = router;