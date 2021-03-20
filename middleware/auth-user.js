'use strict';

const auth = require('basic-auth');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

/**
 * Checks if credentials exists
 * Compares unencrypted password with encrypted password to allow entry
 * Display helpful error messages if user is not authorized
 */
exports.authenticateUser = async (req, res, next) => {
    let message;
    const credentials = auth(req);

    if (credentials) {

        // Find user with matching email address
        const user = await User.findOne({
            where: {
                emailAddress: credentials.name
            }
        });
        if (user) {
            const authenticated = bcrypt
                .compareSync(credentials.pass, user.password);
            if (authenticated) {
                console.log(`Authentication successful!`)

                // Store the user ID on the Request object.
                req.currentUser = user.id;
            } else {
                message = `Authentication failure for username: ${user.emailAddress}`;
            }
        } else {
            message = `User not found for username: ${credentials.name}`;
        }
    } else {
        message = 'Auth header not found';
    }

    // Display warning message 
    if (message) {
        console.warn(message);
        res.status(401).json({ message: 'Access Denied' });
    } else {
        next();
    }
};
