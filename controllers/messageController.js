const asyncHandler = require('express-async-handler')
const Message = require('../models/Message')
const User = require('../models/User')
const Chat = require('../models/Chat')

const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId, fileUrl, fileName, fileType } = req.body;

    if ((!content && !fileUrl) || !chatId) {
        console.log('Invalid data passed into request');
        return res.sendStatus(400);

    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
        res.status(404);
        throw new Error('Chat not found');
    }

    if (chat.blockedBy && chat.blockedBy.length > 0) {
        if (chat.blockedBy.some(blockedUserId => blockedUserId.equals(req.user.userId))) {
            res.status(403);
            throw new Error('Cannot send message: You have blocked this chat');
        }

        const otherUsers = chat.users.filter(user => !user.equals(req.user.userId));
        for (const otherUser of otherUsers) {
            if (chat.blockedBy.some(blockedUserId => blockedUserId.equals(otherUser._id))) {
                res.status(403);
                throw new Error('Cannot send message: This chat has been blocked by another participant');
            }
        }
    }

    var newMessage = {
        sender: req.user.userId,
        content: content || '',
        chat: chatId,
        isRead: false
    };

    if (fileUrl) {
        newMessage.fileUrl = fileUrl;
        newMessage.fileName = fileName;
        newMessage.fileType = fileType;
    }

    try {
        var message = await Message.create(newMessage);
        message = await message.populate('sender', 'firstName lastName email');
        message = await message.populate('chat');
        message = await User.populate(message, {
            path: 'chat.users',
            select: 'firstName lastName email role'
        });

        await Chat.findByIdAndUpdate(req.body.chatId, {
            latestMessage: message
        });

        res.json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }

})


const allMessages = asyncHandler(async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId);
        if (!chat) {
            res.status(404);
            throw new Error('Chat not found');
        }

        if (!chat.users.some(user => user._id.toString() === req.user.userId.toString())) {
            res.status(403);
            throw new Error('You are not authorized to access this chat');
        }

        const messages = await Message.find({ chat: req.params.chatId })
            .populate('sender', 'firstName lastName email')
            .populate('chat');
        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
})

const deleteMessage = asyncHandler(async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);

        if (!message) {
            res.status(404);
            throw new Error('Message not found');
        }

        if (message.sender.toString() !== req.user.userId.toString()) {
            res.status(401);
            throw new Error('You can only delete your own messages');
        }

        await Message.findByIdAndDelete(req.params.messageId);

        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
})

const clearNotifications = asyncHandler(async (req, res) => {
    try {
        const userChats = await Chat.find({ users: req.user.userId }).select('_id');

        await Message.updateMany(
            {
                chat: { $in: userChats },
                isRead: { $ne: true }
            },
            { $set: { isRead: true } }
        );

        res.json({ message: 'All notifications cleared' });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
})

module.exports = { sendMessage, allMessages, deleteMessage, clearNotifications }