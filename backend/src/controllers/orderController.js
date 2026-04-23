const Product = require("../models/Product");
const Order = require("../models/Order");

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

function normalizeItems(cartItems) {
  return cartItems.map((item) => ({
    product: item.productId,
    name: item.name,
    image: item.image || "",
    price: Number(item.price),
    quantity: Number(item.quantity),
  }));
}

async function validateAndNormalizeCartItems(cartItems) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    const error = new Error("Cart items are required");
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

  const priceMap = new Map(
    products.map((product) => [String(product._id), { price: product.price, stock: product.stock }])
  );
  const normalizedItems = normalizeItems(cartItems).map((item) => ({
    ...item,
    price: priceMap.get(String(item.product))?.price ?? item.price,
  }));

  for (const item of normalizedItems) {
    const meta = priceMap.get(String(item.product));
    if (!meta) {
      const error = new Error("Invalid product in cart");
      error.statusCode = 400;
      throw error;
    }
    if (item.quantity > meta.stock) {
      const error = new Error(`Insufficient stock for "${item.name}" (available: ${meta.stock})`);
      error.statusCode = 400;
      throw error;
    }
  }

  const totalAmount = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { normalizedItems, totalAmount };
}

async function persistOrderWithStock({ userId, normalizedItems, shippingAddress, paymentMethod, paymentStatus }) {
  const totalAmount = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const stockDecrements = [];
  try {
    for (const item of normalizedItems) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!updated) {
        const error = new Error(`Could not reserve stock for "${item.name}"`);
        error.statusCode = 409;
        throw error;
      }
      stockDecrements.push({ productId: item.product, quantity: item.quantity });
    }

    const order = await Order.create({
      user: userId,
      items: normalizedItems,
      shippingAddress,
      totalAmount,
      paymentMethod,
      paymentStatus,
    });
    return order;
  } catch (orderError) {
    await Promise.all(
      stockDecrements.map((row) => Product.findByIdAndUpdate(row.productId, { $inc: { stock: row.quantity } }))
    );
    throw orderError;
  }
}

function assertShippingAddress(shippingAddress) {
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
}

async function createOrder(req, res, next) {
  try {
    const { cartItems, shippingAddress, paymentMethod = "mock", paymentStatus } = req.body;
    assertShippingAddress(shippingAddress);

    const { normalizedItems } = await validateAndNormalizeCartItems(cartItems);

    if (paymentMethod !== "mock") {
      const error = new Error("Only mock payment is supported");
      error.statusCode = 400;
      throw error;
    }

    const order = await persistOrderWithStock({
      userId: req.user._id,
      normalizedItems,
      shippingAddress,
      paymentMethod: "mock",
      paymentStatus: paymentStatus || "paid",
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

async function getOrderById(req, res, next) {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    const isOwner = String(order.user?._id) === String(req.user._id);
    if (!isOwner && req.user.role !== "admin") {
      const error = new Error("Not authorized to view this order");
      error.statusCode = 403;
      throw error;
    }

    return res.json(order);
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
      if (!ORDER_STATUSES.includes(req.body.status)) {
        const error = new Error(`Invalid order status. Allowed: ${ORDER_STATUSES.join(", ")}`);
        error.statusCode = 400;
        throw error;
      }
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

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
