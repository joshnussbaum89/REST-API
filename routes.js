'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const { asyncHandler } = require('./middleware/async-handler');
const { authenticateUser } = require('./middleware/auth-user');
const { User, Course } = require('./models');

// Construct a router instance.
const router = express.Router();

// setup a friendly greeting for the root route
router.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the REST API project!',
    });
});

// /api/users GET route that will return the currently authenticated user along with a 200 HTTP status code.
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
    const user = req.currentUser;
    res.json({ user });
}));

// /api/users POST route that will create a new user, set the Location header to "/", and return a 201 HTTP status code and no content.
router.post('/users', asyncHandler(async (req, res) => {
    try {
        // Use bcryptjs to hash password
        const user = req.body;
        let { password } = user;
        user.password = bcrypt.hashSync(password, 10);

        // create user
        await User.create(req.body);
        res.status(201).location('/').json({ "message": "Account successfully created!" });
    } catch (error) {
        console.log('ERROR: ', error.name);

        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });
        } else {
            throw error;
        }
    }
}));

// /api/courses GET route that will return a list of all courses including the User that owns each course and a 200 HTTP status code.
router.get('/courses', asyncHandler(async (req, res) => {
    let courses = await Course.findAll();
    if (courses) {
        res.json(courses);
    } else {
        res.json({ "message": "No courses to display" });
    }
}));

// /api/courses/:id GET route that will return the corresponding course along with the User that owns that course and a 200 HTTP status code.
router.get('/courses/:id', asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id, {
        include: [{
            model: User,
            as: 'userOwner',
        }],
    });
    res.json(course);
}));

// /api/courses POST route that will create a new course, set the Location header to the URI for the newly created course, and return a 201 HTTP status code and no content.
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
    try {
        await Course.create(req.body);
        res.status(201).location(`courses/${req.body.userId}`).json({ "message": "Course successfully created!" });
    } catch (error) {
        console.log('ERROR: ', error.name);

        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });
        } else {
            throw error;
        }
    }
}));

// /api/courses/:id PUT route that will update the corresponding course and return a 204 HTTP status code and no content.
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);
        await course.update(req.body);
        res.json({ "message": "Course successfully edited" }).status(204).end();
    } catch (error) {
        console.log('ERROR: ', error.name);

        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });
        } else {
            throw error;
        }
    }
}));

// /api/courses/:id DELETE route that will delete the corresponding course and return a 204 HTTP status code and no content.
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id);
    await course.destroy(req.body);
    res.json({ "message": "Course successfully deleted" }).status(204).end();
}));


module.exports = router;
