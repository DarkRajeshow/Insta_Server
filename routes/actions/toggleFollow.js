import express from 'express';
import User from '../../models/User.js';
import getUserId from '../../utility/getUserId.js';

const router = express.Router();

router.put('/', async (req, res) => {
    // Check if the request is authenticated with JWT
    if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, status: 'Login to continue.' });
    }

    const { userIdToFollow } = req.body;

    try {
        // Find the current user by userId

        const userId = await getUserId(req.cookies.jwt);
        const currentUser = await User.findById(userId);

        // Find the user to follow by userIdToFollow
        const userToFollow = await User.findById(userIdToFollow);

        if (!userToFollow) {
            return res.status(404).json({ success: false, status: 'User not found.' });
        }

        // Check if the current user is already following the userToFollow
        const isFollowing = currentUser.following.includes(userToFollow._id);

        if (isFollowing) {
            // If already following, unfollow the user
            currentUser.following.pull(userToFollow._id);
            userToFollow.followers.pull(currentUser._id);
        } else {
            // If not following, follow the user
            currentUser.following.push(userToFollow._id);
            userToFollow.followers.push(currentUser._id);
        }

        // Save changes to both users
        await currentUser.save();
        await userToFollow.save();

        // Return success response with appropriate message
        return res.json({ success: true, status: isFollowing ? `Unfollowed ${userToFollow.username}` : `Followed ${userToFollow.username}` });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, status: 'Internal server error' });
    }
});

export default router;
