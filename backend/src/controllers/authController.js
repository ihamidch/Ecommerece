const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function getAccessToken(userId) {
  return jwt.sign({ id: userId, type: "access" }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
}

function getRefreshToken(userId) {
  const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  return jwt.sign({ id: userId, type: "refresh" }, refreshSecret, {
    expiresIn: "7d",
  });
}

function authResponse(user, accessToken, refreshToken) {
  return {
    token: accessToken,
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
}

function isAdminEmail(email) {
  const raw = process.env.ADMIN_EMAILS || "";
  const adminEmails = raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}

async function issueTokensForUser(user) {
  const accessToken = getAccessToken(user._id);
  const refreshToken = getRefreshToken(user._id);
  await User.findByIdAndUpdate(user._id, { refreshToken });
  return authResponse(user, accessToken, refreshToken);
}

async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const emailNorm = String(email || "")
      .toLowerCase()
      .trim();

    if (!name || !email || !password) {
      const error = new Error("All fields are required");
      error.statusCode = 400;
      throw error;
    }
    if (!isValidEmail(emailNorm)) {
      const error = new Error("Please provide a valid email address");
      error.statusCode = 400;
      throw error;
    }
    if (String(password).length < 6) {
      const error = new Error("Password must be at least 6 characters");
      error.statusCode = 400;
      throw error;
    }

    const existingUser = await User.findOne({ email: emailNorm });
    if (existingUser) {
      const error = new Error("Email already in use");
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = isAdminEmail(emailNorm) ? "admin" : "user";
    const user = await User.create({
      name: String(name).trim(),
      email: emailNorm,
      password: hashedPassword,
      role,
    });

    const payload = await issueTokensForUser(user);
    return res.status(201).json(payload);
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      const error = new Error("Email and password are required");
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }

    const payload = await issueTokensForUser(user);
    return res.json(payload);
  } catch (error) {
    return next(error);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      const error = new Error("refreshToken is required");
      error.statusCode = 400;
      throw error;
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    const decoded = jwt.verify(refreshToken, refreshSecret);
    if (decoded.type !== "refresh") {
      const error = new Error("Invalid refresh token");
      error.statusCode = 401;
      throw error;
    }

    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || user.refreshToken !== refreshToken) {
      const error = new Error("Refresh token is invalid or expired");
      error.statusCode = 401;
      throw error;
    }

    const payload = await issueTokensForUser(user);
    return res.json(payload);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 401;
      error.message = "Refresh token is invalid or expired";
    }
    return next(error);
  }
}

async function getProfile(req, res) {
  return res.json({ user: req.user });
}

async function logout(req, res, next) {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: "" });
    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    return next(error);
  }
}

module.exports = { signup, login, refresh, getProfile, logout };
