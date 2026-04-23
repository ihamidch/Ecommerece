const User = require("../models/User");
const Order = require("../models/Order");

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

async function getMyWishlist(req, res, next) {
  try {
    const user = await User.findById(req.user._id).populate(
      "wishlist",
      "name price image category stock rating numReviews"
    );
    return res.json({ items: user?.wishlist || [] });
  } catch (error) {
    return next(error);
  }
}

async function toggleWishlistItem(req, res, next) {
  try {
    const productId = req.params.productId;
    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const exists = user.wishlist.some((item) => String(item) === String(productId));
    if (exists) {
      user.wishlist = user.wishlist.filter((item) => String(item) !== String(productId));
    } else {
      user.wishlist.push(productId);
    }
    await user.save();
    return res.json({ items: user.wishlist, action: exists ? "removed" : "added" });
  } catch (error) {
    return next(error);
  }
}

async function getAdminAnalytics(_req, res, next) {
  try {
    const [totalUsers, totalOrders, revenueResult] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
      ]),
    ]);

    return res.json({
      totalUsers,
      totalOrders,
      totalRevenue: Number(revenueResult[0]?.totalRevenue || 0),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getUsers,
  updateUserRole,
  getMyCart,
  updateMyCart,
  getMyWishlist,
  toggleWishlistItem,
  getAdminAnalytics,
};
