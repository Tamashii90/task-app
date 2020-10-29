const express = require('express');
const router = express.Router();
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auth');
const { clearMyCookies, setMyCookies } = require('../utils/cookies');
const { sendBye, sendWelcome } = require('../../mailgun');
const multer = require('multer');
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/))
            cb(new Error('Extension must be jpg, jpeg, or png'));

        cb(null, true);
    }
});

router.get('/users/me', auth, async (req, res) => {
    try {
        res.render('profile');
    } catch (error) {
        res.status(500).send();
    }
});

router.get('/users/me/info', auth, (req, res) => {
    try {
        const user = req.user;
        const profile = {
            ...user._doc,
            createdAt: user.createdAt.toDateString()
        };
        res.render('account', { profile });
    } catch (error) {
        res.status(500).send();
    }
});

router.post('/users/signup', async (req, res, next) => {

    // if (req.body.pwdVerif !== req.body.password)
    //     return next("Passwords don't match.");
    //delete req.body.pwdVerif;       // this doesn't get stored in the database
    try {
        const user = new User(req.body);
        // user.pwdVerif = req.body.pwdVerif;
        await user.save();
        //sendWelcome(user.name, user.email);
        const token = await user.generateAuthToken();
        res.setMyCookies = setMyCookies;
        res.setMyCookies(user, token);
        res.status(201).render('redirect', { message: 'Welcome !', page: '/users/me' });
    } catch (err) {
        // res.status(400).send(err);
        res.status(400).render('signup', { error: err, pastEmail: req.body.email, pastName : req.body.name });
    }
});

router.patch('/users/me', auth, upload.single('avatar'), async (req, res) => {
    const allowedFields = ["name", "pwdVerif", "email", "password", "avatar"];
    const isAllowedField = Object.keys(req.body).every(property => allowedFields.includes(property));
    if (!isAllowedField)
        return res.status(400).send('Bad field.');
    if (!req.body.password && !req.body.pwdVerif) {
        // if the user didn't change his password, those two fields will arrive as empty strings
        // which will cause Mongoose to throw an error. I delete them, so Mongoose won't malfunction.
        delete req.body.password;
        delete req.body.pwdVerif;
    }
    if (req.file) {
        req.body.avatar = await sharp(req.file.buffer).resize({ width: 200, height: 200 }).png().toBuffer();
    }
    const user = req.user;
    Object.assign(user, req.body);
    try {
        await user.save();
        res.cookie('hasAvatar', 'true', { sameSite: 'lax' });        // update the avatar cookie
        res.cookie('current_user', user.name, { sameSite: "lax" });     // update the cookie to the new name
        res.send('Changes Applied.');
    } catch (error) {
        const profile = {
            ...user._doc,
            createdAt: user.createdAt.toDateString()
        };
        res.status(400).render('account', { profile, error });
    }
}, (err, req, res, next) => {
    res.status(400).send({ error: err.message });
});

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        //sendBye(req.user.name, req.user.email);
        res.clearMyCookies = clearMyCookies;
        res.clearMyCookies();
        res.send('Goodbye :(');
    } catch (err) {
        res.status(500).send(err);
    }
});
router.get('/users/signup', (req, res) => {
    if (!req.cookies['auth_token']) {
        return res.render('signup');
    }
    res.render('redirect', {
        message: 'You already have an account.',
        page: '/users/me'
    })
});

router.get('/users/login', (req, res) => {
    if (!req.cookies['auth_token']) {
        return res.render('login')
    }
    res.redirect('/users/me');
});

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);   // Static function
        const token = await user.generateAuthToken();
        res.setMyCookies = setMyCookies;
        res.setMyCookies(user, token);
        res.render('redirect', { message: `Welcome ${user.name}`, page: '/users/me' });
    } catch (error) {
        res.status(400).render('login', { error: error.message, pastEmail: req.body.email });
    }
});

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token !== req.token);
        await req.user.save();
        res.clearMyCookies = clearMyCookies;
        res.clearMyCookies();
        res.render('redirect', { message: 'You have been logged out.', page: '/' });
    } catch (error) {
        res.status(500).send();
    }
});

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.clearMyCookies = clearMyCookies;
        res.clearMyCookies();
        res.render('redirect', {
            message: 'Successfully Logged Out From All Sessions.',
            page: '/'
        });
    } catch (error) {
        res.status(500).send(error);
    }
});

// router.post('/users/me/avatar/', auth, upload.single('avatar'), async (req, res) => {
//     const buffer = await sharp(req.file.buffer).resize({ width: 200, height: 200 }).png().toBuffer();
//     req.user.avatar = buffer;
//     await req.user.save();
//     res.send('Uploaded !');

// }, (err, req, res, next) => {
//     res.status(400).send({ error: err.message });
// });

router.delete('/users/me/avatar/', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.cookie('hasAvatar', '', { sameSite: 'lax' });
    res.send('Avatar Reset.');
});

router.get('/users/me/avatar/', auth, async (req, res) => {
    try {
        const user = await User.findOne(req.user._id);
        res.set('Content-Type', 'image/jpg');
        res.send(user.avatar);
    } catch (error) {
        res.status(404).send(error.message);
    }
});

module.exports = router;