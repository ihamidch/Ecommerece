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

module.exports = { getUsers, updateUserRole };
