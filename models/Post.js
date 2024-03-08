import mongoose from 'mongoose';

const { Schema } = mongoose;

const postSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true, // Indexing the author field for faster queries
    },
    type: {
        type: String,
        enum: ["video", "image"],
        required: true
    },
    media: {
        type: String,
        required: true,
    },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    saved: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    createdAt: {
        type: Date,
        default: Date.now,
        index: true, // Indexing the createdAt field for sorting and filtering
    },
    caption: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        index: true, // Indexing the username field for faster queries
    },
    name: {
        type: String,
        required: true,
    },
    tags: [{ type: String, index: true }], // Indexing the tags field for faster queries
}, { timestamps: true }); // Adding timestamps for createdAt and updatedAt fields

// Simplified virtual for calculating time passed since post creation
postSchema.virtual('timePassed').get(function () {
    const millisecondsPassed = Date.now() - this.createdAt.getTime();
    const secondsPassed = Math.floor(millisecondsPassed / 1000);

    if (secondsPassed < 60) {
        return `${secondsPassed}s`;
    } else if (secondsPassed < 3600) {
        return `${Math.floor(secondsPassed / 60)}m`;
    } else if (secondsPassed < 86400) {
        return `${Math.floor(secondsPassed / 3600)}h`;
    } else {
        return `${Math.floor(secondsPassed / 86400)}d`;
    }
});

// Ensure virtuals are included in JSON output
postSchema.set('toJSON', { virtuals: true });

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

export default Post;
