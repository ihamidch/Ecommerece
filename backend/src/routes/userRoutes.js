const express = require("express");
const { getUsers, updateUserRole } = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, adminOnly, getUsers);
router.patch("/:id/role", protect, adminOnly, updateUserRole);

module.exports = router;
