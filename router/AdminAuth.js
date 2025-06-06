const express = require('express');
const adminController = require('../controller/AdminAuth');

const { registerAdmin, loginAdmin } = adminController;
const {authenticateToken} = require('../middleware/auth');

const router = express.Router();

router.post('/register',registerAdmin);
router.post('/login', loginAdmin);

module.exports = router;

