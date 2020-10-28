const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const Task = require('./task');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'Username is required !',
        trim: true,
        unique: 'Username already exists.'
    },
    email: {
        type: String,
        unique: 'Email already exists.',
        trim: true,
        lowercase: true,
        required: 'Email is required !',
        validate(value) {
            if (!validator.isEmail(value)) throw new Error('Invalid email');
        }
    },
    password: {
        type: String,
        required: 'Password is required !',
        minlength: [7, 'Password has to be longer than 6 characters.'],
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) throw new Error('Password shouldn\'t include "password"');
        }
    },
    tokens: [String],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

userSchema.plugin(beautifyUnique);

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

userSchema.virtual('pwdVerif')
.set(function (pwd) {
    if (this.password !== pwd)
        this.invalidate('pwdVerif', 'Passwords don\'t match.');
});

userSchema.pre('save', async function (next) {
    const user = this;      // this here refers to the document (user)
    if (user.isModified('password')) {      // Only hash when password is changed
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

userSchema.pre('remove', async function (next) {
    const user = this;
    await Task.deleteMany({ owner: user._id });
    next();
});

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    user.tokens.push(token);
    await user.save();
    return token;
};

userSchema.methods.minifyUser = function () {
    const user = this;
    const newUser = user.toObject();
    delete newUser.avatar;
    delete newUser.tokens;
    delete newUser.password;
    return newUser;
};

userSchema.methods.toJSON = function () {
    const user = this;
    return user.minifyUser();
};

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user)
        throw new Error('Invalid Credentials.');

    const isValidPwd = await bcrypt.compare(password, user.password);
    if (!isValidPwd)
        throw new Error('Invalid Credentials.');
    return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;