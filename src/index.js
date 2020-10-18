require('./db/mongoose');
const port = process.env.PORT;
const usersRouter = require('./routers/user');
const tasksRouter = require('./routers/task');
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());
app.use(usersRouter);
app.use(tasksRouter);

app.listen(port, () => console.log(`Listening on port ${port}..`));


