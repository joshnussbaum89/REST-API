'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const auth = require('basic-auth');
const { User, Course } = require('./models');

// Construct a router instance.
const router = express.Router();

// Handler function to wrap each route.
function asyncHandler(cb) {
    return async (req, res, next) => {
        try {
            await cb(req, res, next);
        } catch (error) {
            // Forward error to the global error handler
            next(error);
        }
    }
}

const authenticateUser = async (req, res, next) => {
    // Parse the user's credentials from the Authorization header.
    let message;
    const credentials = auth(req);
    
    if (credentials) {
        const user = await User.findOne({ where: { emailAddress: credentials.name } });
        // Store the user on the Request object.
        req.currentUser = user;
    }
    //     // if (user) {
    //     //     const authenticated = bcrypt
    //     //         .compareSync(credentials.pass, user.confirmedPassword);
    //     //     if (authenticated) {
    //     //         console.log(`Authentication successful for username: ${user.username}`);

    //     //         // Store the user on the Request object.
    //     //         req.currentUser = user;
    //     //     } else {
    //     //         message = `Authentication failure for username: ${user.username}`;
    //     //     }
    //     // } else {
    //     //     message = `User not found for username: ${credentials.name}`;
    //     // }
    // } else {
    //     message = 'Auth header not found';
    // }
    console.log(credentials);
    next();
}

// setup a friendly greeting for the root route
router.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the REST API project!',
    });
});

/**
 * TODO
 * THIS RETURNS ALL USERS
 * SHOULD ONLY RETURN THE AUTHENTICATED USER
 */
// /api/users GET route that will return the currently authenticated user along with a 200 HTTP status code.
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
    const user = req.currentUser;
    res.json({ user });
}));

// /api/users POST route that will create a new user, set the Location header to "/", and return a 201 HTTP status code and no content.
router.post('/users', asyncHandler(async (req, res) => {
    try {
        // Use bcryptjs to has password
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
router.post('/courses', asyncHandler(async (req, res) => {
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
router.put('/courses/:id', asyncHandler(async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);
        await course.update(req.body);
        res.status(204).end();
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
router.delete('/courses/:id', asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id);
    await course.destroy(req.body);
    res.status(204).end();
}));


module.exports = router;
