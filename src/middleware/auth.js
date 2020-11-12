const User = require('../models/user');
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        const token = req.cookies['auth_token'];
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: verified._id, tokens: token });
        if (!user)
            throw new Error();
        // req.token = token;
        req.user = user;    
        next();
    } catch (err) {
        res.status(401).redirect('/users/login');
    }

};

module.exports = auth;