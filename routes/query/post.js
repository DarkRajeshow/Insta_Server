import express from 'express'
import Post from '../../models/Post.js';
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const limit = 8;

router.get('/explore/:offset', async (req, res) => {
    try {
        const offset = Number(req.params.offset);

        const explorePosts = await Post.find()
            .sort({
                likes: -1,
                createdAt: -1
            })
            .limit(limit)
            .skip(offset * limit)

        res.json({ success: true, explore: explorePosts });
    }

    catch (error) {
        console.error(error);
        res.json({ success: false, status: 'Something went wrong.' });
    }
});

router.get('/search', async (req, res) => {
    const { query } = req.query;
    try {

        const explorePosts = await Post.find({
            $or: [
                { username: { $regex: new RegExp(query, 'i') } },
                { name: { $regex: new RegExp(query, 'i') } },
                { caption: { $regex: new RegExp(query, 'i') } },
                {
                    tags: {
                        $elemMatch: {
                            $regex: new RegExp(query, 'i')
                        }
                    }
                }
            ]
        }).sort({ createdAt: -1, likes: -1 });

        res.json({ success: true, explore: explorePosts });
    } catch (error) {
        console.error(error);
        res.json({ success: false, status: 'Something went wrong.' });
    }
});

//search with id
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const post = await Post.findById(id).populate("author");
        res.json({ success: true, post })
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, status: "Something went wrong....." })
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ success: false, status: "Post not found." });
        }

        // Construct the file path of the media file
        const filePath = path.join(__dirname, '..', '..', 'public', 'uploads', post.media);

        // Check if the file exists before attempting to delete it
        if (fs.existsSync(filePath)) {
            // Delete the media file
            fs.unlinkSync(filePath);
        } else {
            console.log(`File not found at ${filePath}`);
        }

        // Delete the post from the database
        await Post.findByIdAndDelete(id);

        res.json({ success: true, status: "Post deleted successfully." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, status: "Something went wrong." });
    }
});


export default router;
