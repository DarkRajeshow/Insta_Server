import express from 'express';
import upload from '../../utility/multer.js';
import User from '../../models/User.js';
import { Conversation, Message } from '../../models/Message.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import getUserId from '../../utility/getUserId.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Route to get user information
router.get('/', async (req, res) => {
    try {

        const userId = await getUserId(req.cookies.jwt);
        // Check if the request is authenticated with JWT
        if (!req.isAuthenticated()) {
            console.log(userId);
            return res.json({ success: false, status: 'Login to continue.' });
        }

        const full = req.query.full;
        const user = full === "true" ? await User.findById(userId).populate("posts") : await User.findById(userId);


        return res.json({ success: true, user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, status: "Something went wrong." });
    }
});

// Route to get recent chats
router.get('/recentchats', async (req, res) => {
    try {
        // Check if the request is authenticated with JWT
        if (!req.isAuthenticated()) {
            return res.json({ success: false, status: 'Login to continue.' });
        }
        const userId = await getUserId(req.cookies.jwt);

        const currentUser = await User.findById(userId);
        const conversations = await Conversation.find({ participants: currentUser._id })
            .populate('participants', 'bio username name dp');

        // Fetch following users
        const followingUsers = await User.find({ _id: { $in: currentUser.following } }, { bio: true, name: true, dp: true });

        let participants = [];

        // Iterate through conversations and extract participants
        for (const conversation of conversations) {
            const lastMessageId = conversation.messages[conversation.messages.length - 1];
            const lastMessage = await Message.findById(lastMessageId);

            for (const participant of conversation.participants) {
                if (!participant._id.equals(currentUser._id)) {
                    const unreadMessages = await Message.find({
                        _id: { $in: conversation.messages },
                        sender: participant._id,
                        read: false
                    }, { _id: true });

                    participants.push({
                        _id: participant._id,
                        username: participant.username,
                        name: participant.name,
                        dp: participant.dp,
                        bio: participant.bio,
                        lastMessage: lastMessage,
                        unreadMessagesCount: unreadMessages.length
                    });
                }
            }
        }

        // Merge participants with following users and remove duplicates
        participants = participants.concat(followingUsers);
        participants = participants.filter((participant, index, self) =>
            index === self.findIndex(p => p._id.equals(participant._id))
        );

        // Sort participants based on the timestamp of the last message
        participants.sort((a, b) => {
            const timestampA = a.lastMessage ? a.lastMessage.timestamp : new Date(0);
            const timestampB = b.lastMessage ? b.lastMessage.timestamp : new Date(0);
            return timestampB - timestampA;
        });

        return res.json({ success: true, recentChats: participants });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, status: "Something went wrong." });
    }
});

// Route to update user profile
router.put('/', upload.single("file"), async function (req, res) {
    try {
        // Check if the request is authenticated with JWT
        if (!req.isAuthenticated()) {
            return res.json({ success: false, status: "User session expired." });
        }

        const userId = await getUserId(req.cookies.jwt);
        
        const newUserData = req.body;
        const user = await User.findById(userId);

        // Check if there's a new profile image
        if (req.file) {
            if (user.dp !== "default-profile.jpg") {
                // Construct the file path of the old profile image
                const oldDpPath = path.join(__dirname, '..', '..', 'public', 'uploads', user.dp);

                // Check if the old profile image exists before attempting to delete it
                if (fs.existsSync(oldDpPath)) {
                    // Delete the old profile image
                    fs.unlinkSync(oldDpPath);
                } else {
                    console.log(`Old profile image not found at ${oldDpPath}`);
                }
            }
            // Update the user's profile with the new image filename
            await User.findByIdAndUpdate(userId, {
                ...newUserData,
                dp: req.file.filename,
            }, {
                new: true
            });
        } else {
            // If there's no new profile image, simply update the user's profile data
            await User.findByIdAndUpdate(userId, newUserData, { new: true });
        }

        return res.json({ success: true, status: "Profile updated successfully." });
    } catch (err) {
        console.error(err);
        return res.json({ success: false, status: "Something went wrong." });
    }
});

export default router;
