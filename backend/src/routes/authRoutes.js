const express = require("express");
const { signup, login, getProfile, logout } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/me", protect, getProfile);

module.exports = router;
