'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const { asyncHandler } = require('../middleware/async-handler');
const { authenticateUser } = require('../middleware/auth-user');
const { User, Course } = require('../models');

// Construct a router instance.
const router = express.Router();

/**
 * Setup a friendly greeting for the root route
 */
router.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the REST API project!',
    });
});

/**
 * Return the currently authenticated user along with a 200 HTTP status code.
 */
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.currentUser, {
        attributes: {
            exclude: ['password', 'createdAt', 'updatedAt']
        },
    });
    res.json({ user });
}));

/**
 * Create a new user
 * Set the Location header to "/"
 * Return a 201 HTTP status code and no content
 */
router.post('/users', asyncHandler(async (req, res) => {
    try {
        const user = req.body;

        // Use bcryptjs to hash password
        if (user.length > 0) {
            let { password } = user;
            user.password = bcrypt.hashSync(password, 10);
        }

        // create user
        await User.create(req.body);
        res.status(201).location('/').end();
    } catch (error) {
        console.log('ERROR: ', error.name);

        // Check for Sequelize errors
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            let errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });
        } else {
            throw error;
        };
    };


}));

/**
 * Return a list of all courses including the User that owns each course and a 200 HTTP status code
 */
router.get('/courses', asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
        attributes: {
            exclude: ['createdAt', 'updatedAt'],
        },
        include: [{
            model: User,
            as: 'userOwner',
            attributes: {
                exclude: ['password', 'createdAt', 'updatedAt']
            },
        }],
    });

    if (courses) {
        res.json(courses);
    } else {
        res.json({ "message": "No courses to display" });
    };
}));

/**
 * Return the corresponding course along with the User that owns that course and a 200 HTTP status code
 */
router.get('/courses/:id', asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id, {
        attributes: {
            exclude: ['createdAt', 'updatedAt'],
        },
        include: [{
            model: User,
            as: 'userOwner',
            attributes: {
                exclude: ['password', 'createdAt', 'updatedAt']
            },
        }],
    });

    res.json(course);
}));

/**
 * Create a new course
 * Set the Location header to the URI for the newly created course
 * Return a 201 HTTP status code and no content
 */
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
    try {
        const course = await Course.create(req.body);
        const courseIndex = course.dataValues.id;

        res.status(201).location(`courses/${courseIndex}`).end();
    } catch (error) {
        console.log('ERROR: ', error.name);

        // Check for Sequelize errors
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });
        } else {
            throw error;
        };
    };
}));

/**
 * Update the corresponding course and return a 204 HTTP status code and no content
 */
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);

        // Make sure only authenticated user can update a course
        if (req.currentUser === course.userId) {
            await course.update(req.body);
            res.status(204).end();
        } else {
            const error = new Error();
            error.message = "Sorry, you don't have authority to update this course.";
            error.status = 403;
            throw error;
        };
    } catch (error) {
        console.log('ERROR: ', error.name);

        // Check for Sequelize errors
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });
        } else {
            throw error;
        };
    };
}));

/**
 * Delete the corresponding course and return a 204 HTTP status code and no content
 */
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id);

    // Make sure only authenticated user can delete a course
    if (req.currentUser === course.userId) {
        await course.destroy(req.body);
        res.status(204).end();
    } else {
        const error = new Error();
        error.message = "Sorry, you don't have authority to delete this course.";
        error.status = 403;
        throw error;
    };
}));


module.exports = router;
