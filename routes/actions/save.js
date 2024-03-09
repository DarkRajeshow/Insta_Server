import express from 'express';
import User from '../../models/User.js';
import Post from '../../models/Post.js';
import getUserId from '../../utility/getUserId.js';

const router = express.Router();

/* PUT to save/unsave a post */
router.put('/', async function (req, res) {
    // Check if the request is authenticated with JWT
    if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, status: "To save the post, you must log in." });
    }

    try {
        // Extract userId from JWT payload
        const userId = await getUserId(req.cookies.jwt);;
        const { postId } = req.body;

        // Find the post by postId
        const post = await Post.findById(postId);
        
        if (!post) {
            return res.status(404).json({ success: false, status: "Post not found." });
        }

        // Check if the user has already saved the post
        const userSaved = post.saved.includes(userId);

        if (userSaved) {
            // If the user has already saved the post, remove the post
            await Post.findByIdAndUpdate(postId, {
                $pull: {
                    saved: userId
                }
            });

            // Remove post from user's saved array
            await User.findByIdAndUpdate(userId, {
                $pull: {
                    saved: postId
                }
            });

            return res.json({ success: true, status: "Post removed from saved." });
        } else {
            // If the user hasn't saved the post, add the post
            await Post.findByIdAndUpdate(postId, {
                $push: {
                    saved: userId
                }
            });

            // Add post to user's saved array
            await User.findByIdAndUpdate(userId, {
                $push: {
                    saved: postId
                }
            });

            return res.json({ success: true, status: "Post saved." });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, status: "Something went wrong." });
    }
});

export default router;
