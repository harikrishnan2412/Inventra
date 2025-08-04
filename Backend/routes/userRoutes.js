const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');

const { createUser, listUsers, deleteUser } = require('../controllers/userController');
const router = express.Router();

router.post('/',verifyToken, createUser);


router.get('/',verifyToken, listUsers);

router.delete('/:email',verifyToken, deleteUser);

module.exports = router;