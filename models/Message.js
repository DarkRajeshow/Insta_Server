import mongoose from 'mongoose';

const { Schema } = mongoose;

const messageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true, // Indexing sender for faster queries
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true, // Indexing sender for faster queries
    },
    read: {
        type: Boolean,
        default: false,
        index: true, // Indexing read for faster queries
    },
    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true, // Indexing timestamp for sorting and filtering
    },
});

const conversationSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    messages: [{
        type: Schema.Types.ObjectId,
        ref: 'Message',
        required: true,
    }],
});

// Indexing participants for faster queries
conversationSchema.index({ participants: 1 });

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);

export { Message, Conversation };
