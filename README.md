# task-manager
### This following block is awkward, but necessary.
```javascript
const express = require('express');
const app = express();
module.exports = app;
const port = process.env.PORT;
const usersRouter = require('./routers/user');
const tasksRouter = require('./routers/task');
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon');
const hbs = require('hbs');
const path = require('path');
```

I need to set app.locals.user = user from the auth.js middleware, but because this middleware doesn't get called in index.js,
that means it doesn't have access to the app object. I export it this early because the user router uses it, so
I have to export it before requiring that.
