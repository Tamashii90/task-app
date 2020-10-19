require('./db/mongoose');
const express = require('express');
const app = express();
const port = process.env.PORT;
const usersRouter = require('./routers/user');
const tasksRouter = require('./routers/task');
const cookieParser = require('cookie-parser');
const fillHeader = require('./middleware/fillHeader');
const favicon = require('serve-favicon');
const hbs = require('hbs');
const path = require('path');

const viewsPath = path.join(__dirname, '/templates/views');
const partialsPath = path.join(__dirname, '/templates/partials');
const faviconPath = path.join(__dirname, '../public/favicon.ico');

hbs.registerPartials(partialsPath);
app.set('view engine', 'hbs');
app.set('views', viewsPath);

app.use(favicon(faviconPath));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fillHeader);
app.use(usersRouter);
app.use(tasksRouter);

app.get('/', (req, res) => {
    res.render('index');
});

app.get('*', (req, res) => {
    res.status(404).render('404');
});

app.listen(port, () => console.log(`Listening on port ${port}..`));




