const express = require("express");
const {
  createOrder,
  getStripeConfig,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  createPaymentIntent,
  createCheckoutSession,
  completeStripeCheckout,
} = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/stripe/config", getStripeConfig);

router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);
router.get("/my-orders", protect, getMyOrders);
router.get("/user", protect, getMyOrders);

router.post("/stripe/complete", protect, completeStripeCheckout);
router.post("/payment-intent", protect, createPaymentIntent);
router.post("/checkout-session", protect, createCheckoutSession);

router.get("/:id", protect, getOrderById);

router.get("/", protect, adminOnly, getAllOrders);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);
router.patch("/:id/status", protect, adminOnly, updateOrderStatus);

module.exports = router;
