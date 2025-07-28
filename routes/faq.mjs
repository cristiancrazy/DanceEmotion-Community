import express from 'express'; // Import express for routing

const router = express.Router();

/* GET events page */
router.get('/', function(req, res, next) {
  res.render('FAQ', {user: req.user});
});

export default router;