import express from 'express';
import upload from '../../utility/multer.js';
import User from '../../models/User.js';
import Post from '../../models/Post.js';
import getUserId from '../../utility/getUserId.js';


const router = express.Router();

router.post('/', upload.single("file"), async function (req, res) {
    // Check if the request is authenticated with JWT
    if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, status: "To upload the post, you must first log in." });
    }

    // Check if a file is provided
    if (!req.file) {
        return res.status(400).json({ success: false, status: "Media field is required." });
    }

    try {
        const { caption, type, tags } = req.body;

        const userId = await getUserId(req.cookies.jwt);
        const tagsArray = tags.split(",");

        const user = await User.findById(userId);

        // Create a new post
        const newPost = await Post.create({
            caption,
            type,
            username: user.username,
            name: user.name,
            tags: tagsArray,
            author: userId, // Use userId extracted from JWT payload
            media: req.file.filename,
        });

        // Update the user's posts array
        await User.findByIdAndUpdate(userId, {
            $push: {
                posts: newPost._id
            }
        });

        return res.json({ success: true, status: "The post has been created." });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, status: "Sorry, something went wrong." });
    }
});

export default router;
