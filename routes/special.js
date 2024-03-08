import express from 'express'
import User from '../models/User.js'

const router = express.Router();

// only retrives the attributes which are included in the attributes object
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const attributes = {};
        req.query.include.split(",").forEach(attribute => {
            attributes[attribute] = true;
        });
        const user = await User.findById(userId, attributes);
        res.json({ success: true, user });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, status: "Something went wrong....." });
    }
});

export default router;