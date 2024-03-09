
import express from 'express';
import User from '../../models/User.js';
import Post from '../../models/Post.js';
import Comment from '../../models/Comment.js';
import getUserId from '../../utility/getUserId.js';

const router = express.Router();

// Route to get comments for a specific post
router.get('/:postId', async (req, res) => {
    try {
        const postId = req.params.postId;
        const comments = await Comment.find({
            post: postId
        })
            .populate("author")
            .sort({ createdAt: -1 });

        return res.json({ success: true, comments });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, status: "Something went wrong." });
    }
});

// Route to add a comment to a post
router.post('/:postId', async (req, res) => {
    try {
        const postId = req.params.postId;
        const text = req.body.text;

        // Check if the request is authenticated with JWT
        if (!req.isAuthenticated()) {
            return res.json({ success: false, status: "Login to continue." });
        }

        const comment = await Comment.create({
            author: req.userId,
            post: postId,
            text: text
        });

        await User.findByIdAndUpdate(req.userId, {
            $push: {
                comments: comment._id
            }
        });

        await Post.findByIdAndUpdate(postId, {
            $push: {
                comments: comment._id
            }
        });

        return res.json({ success: true, status: "Comment added." });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, status: "Something went wrong." });
    }
});

// Route to delete a comment
router.delete('/:commentId', async (req, res) => {
    try {
        const commentId = req.params.commentId;

        // Check if the request is authenticated with JWT
        if (!req.isAuthenticated()) {
            return res.json({ success: false, status: "Login to continue." });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.json({ success: false, status: 'Comment not found.' });
        }

        if (!comment.author.equals(req.userId)) {
            return res.json({ success: false, status: 'You are not authorized to delete this comment.' });
        }

        await User.findByIdAndUpdate(req.userId, {
            $pull: {
                comments: commentId
            }
        });

        await Post.findByIdAndUpdate(comment.post, {
            $pull: {
                comments: commentId
            }
        });

        await Comment.findByIdAndDelete(commentId);
        return res.json({ success: true, status: 'Comment deleted.' });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, status: 'Something went wrong.' });
    }
});

// Route to like/unlike a comment
router.put('/like', async function (req, res) {
    try {
        // Check if the request is authenticated with JWT
        if (!req.isAuthenticated()) {
            return res.json({ success: false, status: "Login to continue." });
        }

        const { commentId } = req.body;
        const userId = await getUserId(req.cookies.jwt);
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.json({ success: false, status: 'Comment not found.' });
        }

        const userLikedComment = comment.likes.includes(userId);

        if (userLikedComment) {
            await Comment.findByIdAndUpdate(commentId, {
                $pull: {
                    likes: userId
                }
            });

            return res.json({ success: true, status: "Like removed." });
        } else {
            await Comment.findByIdAndUpdate(commentId, {
                $push: {
                    likes: userId
                }
            });

            return res.json({ success: true, status: "Liked." });
        }
    }
    catch (err) {
        console.error(err);
        return res.json({ success: false, status: "Something went wrong." });
    }
});

export default router;
