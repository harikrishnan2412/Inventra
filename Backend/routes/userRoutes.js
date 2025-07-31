const express = require('express');

const { createUser, listUsers, deleteUser } = require('../controllers/userController');
const router = express.Router();

router.post('/', createUser);


router.get('/', listUsers);

router.delete('/:email', deleteUser);

module.exports = router;