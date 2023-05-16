const express = require('express');
const router = express.Router();

router.get('/profile', async (req, res) => {
    if (req.session.loggedIn) {
        try {
            const user = await usersCollection.findOne({ email: req.session.email });
            res.render('profile', { user: user, currentPage: 'profile' });
        } catch (error) {
            res.status(500).send('Error retrieving user data.');
        }
    } else {
        res.status(403).send(
            "You must be logged in to access this page.<br><a href='/'>Go back to home page</a>"
        );
    }
});

router.get('/editProfile', async (req, res) => {
    if (req.session.loggedIn) {
        try {
            const user = await usersCollection.findOne({ email: req.session.email });
            res.render('editProfile', { user: user, currentPage: 'editProfile' });
        } catch (error) {
            res.status(500).send('Error retrieving user data.');
        }
    } else {
        res.status(403).send(
            "You must be logged in to access this page.<br><a href='/'>Go back to home page</a>"
        );
    }
});

router.get('/viewProfile', async (req, res) => {
    if (req.session.loggedIn) {
        try {
            const user = await usersCollection.findOne({ email: req.session.email });
            res.render('viewProfile', { user: user });
        } catch (error) {
            res.status(500).send('Error retrieving user data.');
        }
    } else {
        res.status(403).send(
            "You must be logged in to access this page.<br><a href='/'>Go back to home page</a>"
        );
    }
});

router.post('/updateProfile', async (req, res) => {
    if (req.session.loggedIn) {
        const schema = Joi.object({
            name: Joi.string().max(50).optional(),
            username: Joi.string().max(50).optional(),
            email: Joi.string().email().optional(),
            birthday: Joi.date().optional(),
            pronouns: Joi.string().max(50).optional(),
            interests: Joi.array().items(Joi.string()).max(10).optional(),
        });

        const validationResult = schema.validate(req.body);

        if (validationResult.error) {
            res.status(400).send(validationResult.error.details[0].message + "<br><a href='/editProfile'>Go back to edit profile</a>");
        } else {
            try {
                const user = await usersCollection.findOne({ email: req.session.email });
                if (user) {
                    const updatedUser = {
                        name: req.body.name,
                        username: req.body.username,
                        email: req.body.email,
                        birthday: new Date(req.body.birthday),
                        pronouns: req.body.pronouns,
                        interests: req.body.interests,
                    };
                    await usersCollection.updateOne({ email: req.session.email }, { $set: updatedUser });
                    req.session.name = updatedUser.name;
                    req.session.email = updatedUser.email;
                    res.redirect('/profile');
                } else {
                    res.status(401).send("User not found.<br><a href='/editProfile'>Go back to edit profile</a>");
                }
            } catch (error) {
                res.status(500).send("Error updating profile.<br><a href='/editProfile'>Go back to edit profile</a>");
            }
        }
    } else {
        res.status(403).send("You must be logged in to update your profile.< br > <a href='/'>Go back to home page</a>");
    }
});

module.exports = router;