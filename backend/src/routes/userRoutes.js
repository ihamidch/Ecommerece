const express = require("express");
const {
  getUsers,
  updateUserRole,
  getMyCart,
  updateMyCart,
} = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me/cart", protect, getMyCart);
router.put("/me/cart", protect, updateMyCart);
router.get("/", protect, adminOnly, getUsers);
router.patch("/:id/role", protect, adminOnly, updateUserRole);

module.exports = router;
