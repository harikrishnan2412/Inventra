const express = require('express');
const { loginUser, getProfile } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', loginUser);
router.get('/me', verifyToken, getProfile);

module.exports = router;
