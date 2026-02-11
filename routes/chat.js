const express = require("express");
const auth = require("../middleware/authentication");
const { 
    accessChat, 
    fetchChats, 
    createGroup, 
    renameGroup, 
    addToGroup, 
    removeFromGroup, 
    markChatAsRead, 
    deleteGroup, 
    deleteChat, 
    blockChat, 
    unblockChat 
} = require("../controllers/chatController");

const router = express.Router();

router.route('/').post(auth, accessChat);
router.route('/').get(auth, fetchChats);
router.route('/group').post(auth, createGroup);
router.route('/rename').put(auth, renameGroup);
router.route('/groupadd').put(auth, addToGroup);
router.route('/groupremove').put(auth, removeFromGroup);
router.route('/groupdelete').delete(auth, deleteGroup);
router.route('/:chatId/read').put(auth, markChatAsRead);
router.route('/:chatId').delete(auth, deleteChat);
router.route('/:chatId/block').post(auth, blockChat);
router.route('/:chatId/unblock').post(auth, unblockChat);

module.exports = router;