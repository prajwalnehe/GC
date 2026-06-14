const express = require('express');
const { getUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/', getUsers);
router.post('/', admin, createUser);
router.route('/:id').get(admin, getUserById).put(admin, updateUser).delete(admin, deleteUser);

module.exports = router;
