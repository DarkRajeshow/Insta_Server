import express from 'express';
import Notification from '../../models/Notification.js';
import User from '../../models/User.js';
import getUserId from '../../utility/getUserId.js';

const router = express.Router();

router.post('/new', async (req, res) => {
    try {
        const { recipient, relatedUser, relatedPost, message, type } = req.body;

        const nofitcation = {
            recipient,
            relatedPost,
            relatedUser,
            message,
            type,
        }

        const newNotification = await Notification.create(nofitcation);

        await User.findByIdAndUpdate(recipient, {
            $push: { notifications: newNotification._id }
        });

        res.json({ success: true, status: "Notification added successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, status: "Something went wrong." });
    }
});

router.put('/read', async (req, res) => {
    try {
        const { notificationIds } = req.body;
        await Notification.updateMany(
            {
                _id: { $in: notificationIds }
            },
            {
                $set: { read: true }
            }
        )
        res.json({ success: true, status: "Viewed" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, status: "Notifications not read." });
    }
});

router.get('/all', async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const userId = await getUserId(req.cookies.jwt);
            const notifications = await Notification.find({
                recipient: userId
            })
                .populate("relatedUser", 'name dp')
                .sort({
                    timestamp: -1
                });

                res.json({ success: true, notifications });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, status: "Internal Server Error", error: error.message });
        }
    } else {
        res.status(401).json({ success: false, status: "Unauthorized", error: "Login to continue." });
    }
});

router.get('/unread/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        const notifications = await Notification.find({
            recipient: userId,
            read: false
        }, {
            _id: true
        });

        res.json({ success: true, notificationCount: notifications.length });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, status: "Something went wrong." });
    }
});

router.delete('/all', async (req, res) => {
    try {
        const userId = await getUserId(req.cookies.jwt);
        await Notification.deleteMany({ recipient: userId });
        await User.findByIdAndUpdate(userId, { notifications: [] });
        res.json({ success: true, status: "Notifications cleared." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, status: "Something went wrong." });
    }
});

export default router;
