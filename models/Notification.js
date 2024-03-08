import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true // Add index for faster lookup
    },
    relatedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    relatedPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
    },
    type: {
        type: String,
        enum: ["post", "follow", "message", "profile"],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true // Add index for sorting by timestamp
    }
});

// Indexes
notificationSchema.index({ recipient: 1, timestamp: -1 }); // Compound index for recipient and timestamp

// TTL index for auto-expiring documents after 15 days
notificationSchema.index({ timestamp: 1 }, { expireAfterSeconds: 15 * 24 * 60 * 60 }); // 15 days in seconds

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
