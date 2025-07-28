import express from 'express'; // Import express for routing

const router = express.Router();

/* Logout the user */
router.post('/', (req, res, next) => {
    // Check if the user is authenticated
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }

    // Call the logout method provided by passport
    req.logout((err) => {
        if (err) {
            return next(err);
        }

        req.session.destroy((err) => {
            if (err) {
                return next(err);
            }
        });
        // Clear the user from the request object
        req.user = null;

        // Redirect to the home page after logout
        res.redirect('/');
    });
});

export default router;