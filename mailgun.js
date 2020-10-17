const mailgun = require("mailgun-js");
const domain = process.env.MAILGUN_DOMAIN;
const apiKey = process.env.MAILGUN_API_KEY;
const mg = mailgun({ apiKey, domain });

const sendWelcome = (name, email) => {
    const data = {
        from: 'My Task App <me@samples.mailgun.org>',
        to: email,
        subject: 'Welcome',
        html: `Why, hello there <b>${name}</b>.`
    };
    mg.messages().send(data, function (error, body) {
        if (error)
            return console.log(error);
        console.log('Email sent to user.');
    });
};

const sendBye = (name, email) => {
    const data = {
        from: 'My Task App <me@samples.mailgun.org>',
        to: email,
        subject: 'Sayonara',
        html: `Why, goodbye there <b>${name}</b>.`
    };
    mg.messages().send(data, function (error, body) {
        if (error)
            return console.log(error);
        console.log('Email sent to user.');
    });
};
module.exports = { sendWelcome, sendBye };