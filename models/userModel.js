import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const { Schema, model } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        index: true,
    },
    password: {
        type: String,
    },
    avatarUrl: {
        type: String,
        default: '',
    },
    createdAt: {
        type: String,
        required: true,
    },
});

userSchema.methods.hashPassword = function hashPassword(password) {
    this.password = bcrypt.hashSync(password, 12);
};

userSchema.methods.isValidPassword = function isValidPassword(password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.methods.generateJWT = function generateJWT() {
    return jwt.sign(
        {
            _id: this._id,
            name: this.name,
            email: this.email,
            avatarUrl: this.avatarUrl,
            createdAt: this.createdAt,
        },
        process.env.JWT_SECRET
    );
};

userSchema.methods.returnAuthUser = function returnAuthUser() {
    return {
        _id: this._id,
        name: this.name,
        email: this.email,
        avatarUrl: this.avatarUrl,
        createdAt: this.createdAt,
        token: this.generateJWT(),
    };
};

const User = model('User', userSchema);
export default User;
