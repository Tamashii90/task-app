require('./db/mongoose');
const port = process.env.PORT;
const usersRouter = require('./routers/user');
const tasksRouter = require('./routers/task');
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const hbs = require('hbs');
const path = require('path');

const viewsPath = path.join(__dirname, '/templates/views');
const partialsPath = path.join(__dirname, '/templates/partials');

hbs.registerPartials(partialsPath);
app.set('view engine', 'hbs');
app.set('views', viewsPath);

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(usersRouter);
app.use(tasksRouter);

app.get('/', (req, res) => {
    res.render('index');
});

app.get('*', (req, res) => {
    res.status(404).send('404 - NO PAGE FOUND');
});

app.listen(port, () => console.log(`Listening on port ${port}..`));


