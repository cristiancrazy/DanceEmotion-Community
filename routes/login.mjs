import express from 'express'; // Import express for routing
import passport from 'passport'; // Import passport for authentication

const router = express.Router();

/* GET login page */
router.get('/', function(req, res, next) {
  // Check if the user is already authenticated
  if (req.isAuthenticated()) {
    return res.redirect('/'); // Redirect to home page if already authenticated
  }

  // Render the login page if not authenticated
  res.render('accesso', { user: req.user, messages: req.flash('error') });
});

/* POST login page */
router.post('/', function(req, res, next) {
  // Use passport to authenticate the user
  passport.authenticate('dancer&school', {
    successRedirect: '/profilo', // Redirect to home page on success
    failureRedirect: '/accesso' // Redirect back to login page on failure
  })(req, res, next);
});

export default router;