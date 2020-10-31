const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const auth = require('../middleware/auth');

router.get('/tasks/', auth, async (req, res) => {
    const match = {};
    const sort = {};
    if (req.query.completed !== undefined)      // Remember Boolean('false') == true
        match.completed = req.query.completed;
    if (req.query.sortBy) {
        const [field, order] = req.query.sortBy.split(':');
        sort[field] = order === 'asc' ? 1 : -1;
    }
    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: +req.query.limit,
                skip: +req.query.skip,
                sort
            }
        }).execPopulate();
        if (req.user.tasks.length)
            res.render('../partials/tasks', { tasks: req.user.tasks });
        else res.send('no tasks man');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        if (!task)
            return res.status(404).send();
        res.send(task)
    } catch (error) {
        res.status(500).send()
    }
});

router.patch('/tasks/:id', auth, async (req, res) => {
    const allowedFields = ['description', 'completed'];
    const isAllowedField = Object.keys(req.body).every(property => allowedFields.includes(property));
    if (!isAllowedField)
        return res.status(400).send('Bad field.');
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
        if (!task)
            return res.status(404).send('No task found.');
        Object.assign(task, req.body);
        await task.save();
        res.send('Task Updated.');
    } catch (err) {
        res.status(400).send(err.message);
    }
});

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        if (!task)
            return res.status(404).send('Task not found.');
        res.send('Task Deleted.');
    } catch (error) {
        res.status(500).send(error);
    }
});

router.post('/tasks/', auth, async (req, res) => {
    const task = new Task({ ...req.body, owner: req.user._id });
    try {
        await task.save();
        res.status(201).send('Task created.');
    } catch (err) {
        res.status(400).send(err.message);
    }
});


module.exports = router;