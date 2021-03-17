'use strict';

const express = require('express');

// Construct a router instance.
const router = express.Router();
const { User, Course } = require('./models');

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

// setup a friendly greeting for the root route
router.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the REST API project!',
    });
});

// /api/courses GET route that will return a list of all courses including the User that owns each course and a 200 HTTP status code.
router.get('/users', asyncHandler(async (req, res) => {
    let courses = await Course.findAll();
    res.json(courses);
}));

// /api/courses/:id GET route that will return the corresponding course along with the User that owns that course and a 200 HTTP status code.

// /api/courses POST route that will create a new course, set the Location header to the URI for the newly created course, and return a 201 HTTP status code and no content.

// /api/courses/:id PUT route that will update the corresponding course and return a 204 HTTP status code and no content.

// /api/courses/:id DELETE route that will delete the corresponding course and return a 204 HTTP status code and no content.


module.exports = router;
