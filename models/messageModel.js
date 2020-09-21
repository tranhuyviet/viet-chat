import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const messageShema = new Schema({
    message: {
        type: String,
        required: true,
    },
    from: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    createdAt: {
        type: String,
        required: true,
    },
});

messageShema.pre(/^find/, function (next) {
    this.populate({
        path: 'from',
        select: 'name avatarUrl',
    }).populate({
        path: 'to',
        select: 'name avatarUrl',
    });

    next();
});

const Message = model('Message', messageShema);

export default Message;
