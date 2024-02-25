import express from 'express'
import upload from '../../utility/multer.js'
import User from '../../models/User.js'
import { Conversation } from '../../models/Message.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const full = req.query.full;

    try {
        if (req.isAuthenticated()) {
            if (full === "true") {
                const user = await User.findById(req.user._id).populate("posts");
                res.json({ success: true, user });
            } else {
                res.json({ success: true, user: req.user });
            }
        } else {
            res.json({ success: false, user: null });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, status: "Something went wrong....." });
    }
});


router.get('/recentchats', async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const currentUser = req.user;

            // Fetch conversations involving the current user
            const conversations = await Conversation.find({ participants: currentUser._id })
                .populate({
                    path: 'messages',
                    options: { sort: { timestamp: -1 }, limit: 1 }
                })
                .populate('participants', 'bio username name dp')

            // Extract unique participants from conversations and include last message content and timestamp
            let participants = [];
            conversations.forEach(conversation => {
                conversation.participants.forEach(participant => {
                    if (!participant._id.equals(currentUser._id)) {
                        const lastMessage = conversation.messages[0];
                        participants.push({
                            _id: participant._id,
                            username:participant.username,
                            name: participant.name,
                            dp: participant.dp,
                            bio: participant.bio,
                            lastMessage: lastMessage ? {
                                content: lastMessage.content,
                                timestamp: lastMessage.timestamp,
                                sender: lastMessage.sender,
                            } : null
                        });
                    }
                });
            });

            // Fetch following users
            const followingUsers = await User.find({ _id: { $in: currentUser.following } }, { bio: true, name: true, dp: true });

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

            res.json({ success: true, recentChats: participants });
        } else {
            res.json({ success: false, status: "Login to continue" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, status: "Something went wrong....." });
    }
});



router.put('/', upload.single("file"), async function (req, res) {

    if (!req.isAuthenticated()) {
        res.json({ success: false, status: "User Session expired." })
    }
    try {
        const newUserData = req.body;

        if (req.file) {
            await User.findByIdAndUpdate(req.user._id, {
                ...newUserData,
                dp: req.file.filename,
            }, {
                new: true
            });
        }

        else {
            await User.findByIdAndUpdate(req.user._id, newUserData, { new: true })
        }

        res.json({ success: true, status: "Profile updated successfully." })
    }

    catch (err) {
        console.log(err);
        res.json({ success: true, status: "Something went wrong..." })
    }
});

export default router;
