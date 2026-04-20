const Stripe = require("stripe");
const Product = require("../models/Product");
const Order = require("../models/Order");

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

function normalizeItems(cartItems) {
  return cartItems.map((item) => ({
    product: item.productId,
    name: item.name,
    image: item.image || "",
    price: Number(item.price),
    quantity: Number(item.quantity),
  }));
}

async function createOrder(req, res, next) {
  try {
    const { cartItems, shippingAddress, paymentMethod = "mock", paymentStatus } = req.body;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      const error = new Error("Cart items are required");
      error.statusCode = 400;
      throw error;
    }

    if (
      !shippingAddress?.fullName ||
      !shippingAddress?.address ||
      !shippingAddress?.city ||
      !shippingAddress?.postalCode ||
      !shippingAddress?.country
    ) {
      const error = new Error("Complete shipping address is required");
      error.statusCode = 400;
      throw error;
    }

    const productIds = cartItems.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== productIds.length) {
      const error = new Error("Some products do not exist");
      error.statusCode = 400;
      throw error;
    }

    const priceMap = new Map(products.map((product) => [String(product._id), product.price]));
    const normalizedItems = normalizeItems(cartItems).map((item) => ({
      ...item,
      price: priceMap.get(String(item.product)) || item.price,
    }));

    const totalAmount = normalizedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      user: req.user._id,
      items: normalizedItems,
      shippingAddress,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentStatus || (paymentMethod === "mock" ? "paid" : "pending"),
    });

    return res.status(201).json(order);
  } catch (error) {
    return next(error);
  }
}

async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return next(error);
  }
}

async function getAllOrders(_req, res, next) {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return next(error);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    if (req.body.status) {
      order.status = req.body.status;
    }

    if (req.body.paymentStatus) {
      order.paymentStatus = req.body.paymentStatus;
    }

    await order.save();
    return res.json(order);
  } catch (error) {
    return next(error);
  }
}

async function createPaymentIntent(req, res, next) {
  try {
    const { amount } = req.body;
    if (!amount || Number(amount) <= 0) {
      const error = new Error("Valid amount is required");
      error.statusCode = 400;
      throw error;
    }

    if (!stripe) {
      return res.json({
        clientSecret: "mock-payment-secret",
        mode: "mock",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100),
      currency: "usd",
      payment_method_types: ["card"],
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
      mode: "stripe",
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  createPaymentIntent,
};
