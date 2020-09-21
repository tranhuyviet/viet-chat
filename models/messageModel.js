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

messageShema.methods.returnMessage = async function returnMessage() {
    // this.populate({
    //     path: 'from',
    //     select: 'name avatarUrl',
    // }).populate({
    //     path: 'to',
    //     select: 'name avatarUrl',
    // });

    return {
        _id: this._id,
        message: this.message,
        from: this.populate({
            path: 'from',
            select: 'name avatarUrl',
        }),
        to: this.to,
        createdAt: this.createdAt,
    };
};

messageShema.post('save', function () {
    this.populate({
        path: 'from',
        select: 'name avatarUrl',
    }).populate({
        path: 'to',
        select: 'name avatarUrl',
    });
});

const Message = model('Message', messageShema);

export default Message;
