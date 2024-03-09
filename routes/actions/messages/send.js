import express from 'express';
import User from '../../../models/User.js';
import Message from '../../../models/Message.js';
import getUserId from '../../../utility/getUserId.js';

const router = express.Router();

// Route for sending a message
router.put('/send', async (req, res) => {

    if (!req.isAuthenticated()) {
        return res.json({ success: false, status: "Login to continue." });
    }

    try {
        const loggedUserId = await getUserId(req.cookies.jwt);
        const { chatUser, content } = req.body;

        // Create a new message document
        const newMessage = new Message({
            content,
            sender: loggedUserId,
            receiver: chatUser,
        });

        // Save the message
        await newMessage.save();

        // Update sender's sentMessages
        await User.findOneAndUpdate(
            { _id: loggedUserId, 'messages.userId': chatUser },
            { $push: { 'messages.$.conversation.sentMessages': newMessage._id } },
            { upsert: true }
        );

        // Update receiver's receivedMessages
        await User.findOneAndUpdate(
            { _id: chatUser, 'messages.userId': loggedUserId },
            { $push: { 'messages.$.conversation.receivedMessages': newMessage._id } },
            { upsert: true }
        );

        res.json({ success: true, status: "Message sent successfully." });
    } catch (error) {
        console.error(error);
        res.json({ success: false, status: "Something went wrong." });
    }
});

export default router;
