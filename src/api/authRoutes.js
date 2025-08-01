const router = require('express').Router();
const { register, login, verifyEmail } = require('./authController');


router.post('/register', register);
router.post('/login', login);
router.get('/verify-email', verifyEmail);
module.exports = router;