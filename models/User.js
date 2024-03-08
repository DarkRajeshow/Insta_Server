import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        index: true, // Indexing the username field for faster queries
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true, // Indexing the email field for faster queries
    },
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        default: "Hey, I am using Instagram!"
    },
    dp: {
        type: String,
        default: 'default-profile.jpg',
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    liked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    saved: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    conversations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' }],
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }],
}, { timestamps: true }); // Adding timestamps for createdAt and updatedAt fields

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
