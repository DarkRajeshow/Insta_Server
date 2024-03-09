import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import Post from '../../models/Post.js';
import getUserId from '../../utility/getUserId.js';

const router = express.Router();

/* PUT to like/unlike a post */
router.put('/', async function (req, res) {
    // Check if the request is authenticated with JWT
    if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, status: "To add the post, you must log in." });
    }

    try {
        // Extract userId from JWT payload
        const userId = await getUserId(req.cookies.jwt);
        const { postId } = req.body;

        // Find the post by postId
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ success: false, status: "Post not found." });
        }

        // Check if the user has already liked the post
        const userLiked = post.likes.includes(userId);

        if (userLiked) {
            // If the user has already liked the post, remove the like
            await Post.findByIdAndUpdate(postId, {
                $pull: {
                    likes: userId
                }
            });

            // Remove post from user's liked array
            await User.findByIdAndUpdate(userId, {
                $pull: {
                    liked: postId
                }
            });

            return res.json({ success: true, status: "Like removed." });
        } else {
            // If the user hasn't liked the post, add the like
            await Post.findByIdAndUpdate(postId, {
                $push: {
                    likes: userId
                }
            });

            // Add post to user's liked array
            await User.findByIdAndUpdate(userId, {
                $push: {
                    liked: postId
                }
            });

            return res.json({ success: true, status: "Post Liked." });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, status: "Something went wrong." });
    }
});

export default router;
