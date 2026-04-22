const express = require("express");
const { signup, login, getProfile, logout } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimit");
const { validateBody } = require("../middleware/validateBody");
const { signupSchema, loginSchema } = require("../validation/authSchemas");

const router = express.Router();

router.post("/signup", authLimiter, validateBody(signupSchema), signup);
router.post("/login", authLimiter, validateBody(loginSchema), login);
router.post("/logout", protect, logout);
router.get("/me", protect, getProfile);

module.exports = router;
