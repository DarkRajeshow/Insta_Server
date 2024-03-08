import mongoose from 'mongoose';

const { Schema } = mongoose;

const commentSchema = new Schema({
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
        index: true, // Indexing post for faster queries
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true, // Indexing author for faster queries
    },
    text: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true, // Indexing createdAt for sorting and filtering
    },
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
});

// Ensure indexes are included in JSON output
commentSchema.set('toJSON', { virtuals: true });

// Ensure indexes are included in Object output (e.g., res.send)
commentSchema.set('toObject', { virtuals: true });

const Comment = mongoose.models.Comment || mongoose.model("Comment", commentSchema)

export default Comment;
