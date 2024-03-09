import express from 'express';
import Post from '../../models/Post.js';
import User from '../../models/User.js';
import getUserId from '../../utility/getUserId.js';

const router = express.Router();

const limit = 6;

router.get('/:offset', async (req, res) => {
    try {
        const offset = Number(req.params.offset);

        // Check if the request is authenticated with JWT
        if (req.isAuthenticated()) {
            const userId = await getUserId(req.cookies.jwt);
            const currentUser = await User.findById(userId);
            const likedPostIds = currentUser.liked;

            const likedPosts = await Post.find({ _id: { $in: likedPostIds } })
                .sort({ createdAt: -1, liked: -1 })
                .limit(limit)
                .skip(offset * limit);

            return res.json({ success: true, liked: likedPosts });
        } else {
            return res.json({ success: false, liked: "Log in to continue." });
        }
    } catch (error) {
        console.error(error);
        return res.json({ success: false, status: 'Something went wrong.' });
    }
});

export default router;
