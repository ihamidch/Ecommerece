const User = require("../models/User");

async function getUsers(_req, res, next) {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    return next(error);
  }
}

async function updateUserRole(req, res, next) {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      const error = new Error('role must be "user" or "admin"');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return res.json(user);
  } catch (error) {
    return next(error);
  }
}

function normalizeCartItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => ({
      productId: item.productId,
      name: String(item.name || "").trim(),
      image: typeof item.image === "string" ? item.image.trim() : "",
      price: Number(item.price),
      quantity: Number(item.quantity),
    }))
    .filter(
      (item) =>
        item.productId &&
        item.name &&
        !Number.isNaN(item.price) &&
        item.price >= 0 &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
    );
}

async function getMyCart(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select("cart");
    return res.json({ items: user?.cart || [] });
  } catch (error) {
    return next(error);
  }
}

async function updateMyCart(req, res, next) {
  try {
    const normalized = normalizeCartItems(req.body?.items);
    if (!Array.isArray(req.body?.items)) {
      const error = new Error("items must be an array");
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { cart: normalized },
      { new: true, runValidators: true }
    ).select("cart");

    return res.json({ items: user?.cart || [] });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getUsers, updateUserRole, getMyCart, updateMyCart };
