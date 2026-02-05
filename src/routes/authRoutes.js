const { Router } = require('express');
const { login, register } = require('../controllers/authController');
const { validateBody } = require('../middleware/validate');
const { loginSchema, registerSchema } = require('../utils/validation');

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);

module.exports = router;