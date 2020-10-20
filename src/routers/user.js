const express = require('express');
const router = express.Router();
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auth');
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
        const user = req.user;
        res.render('profile', { profile: user });
    } catch (error) {
        res.status(500).send();
    }
});

router.patch('/users/me', auth, async (req, res) => {
    const allowedFields = ["name", "age", "email", "password"];
    const isAllowedField = Object.keys(req.body).every(property => allowedFields.includes(property));

    if (!isAllowedField)
        return res.status(400).send('Bad field.');

    try {
        const user = req.user;
        Object.assign(user, req.body);
        await user.save();
        res.send(user);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        //sendBye(req.user.name, req.user.email);
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

router.post('/users/signup', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        //sendWelcome(user.name, user.email);
        const token = await user.generateAuthToken();
        res.cookie('auth_token', token, { sameSite: 'lax' });
        res.status(201).render('redirect', { message: 'Thanks for creating an account.', page: '/users/me' });
    } catch (err) {
        res.status(400).send(err.message);
    }
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
        res.cookie('current_user', user.name, { sameSite: 'lax' });
        res.cookie('auth_token', token, { sameSite: 'lax' });
        res.render('redirect', { message: `Welcome ${user.name}`, page: '/users/me' });
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token !== req.token);
        await req.user.save();
        res.clearCookie('auth_token');
        res.clearCookie('current_user');
        res.render('redirect', { message: 'You have been logged out.', page: '/' });
    } catch (error) {
        res.status(500).send();
    }
});

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.clearCookie('auth_token');
        res.clearCookie('current_user');
        res.render('redirect', {
            message:'Successfully Logged Out From All Sessions.',
            page:'/'
        });
    } catch (error) {
        res.status(500).send();
    }
});

router.post('/users/me/avatar/', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send('Uploaded !');

}, (err, req, res, next) => {
    res.status(400).send({ error: err.message });
});

router.delete('/users/me/avatar/', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send('Deleted your avatar.');
});

router.get('/users/:id/avatar/', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar)
            throw new Error('No avatar or user.');
        res.set('Content-Type', 'image/jpg');
        res.send(user.avatar);
    } catch (error) {
        res.status(404).send(error.message);
    }
});

module.exports = router;