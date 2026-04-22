const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function getToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
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

    const token = getToken(user._id);
    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
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

    const token = getToken(user._id);
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function getProfile(req, res) {
  return res.json({ user: req.user });
}

async function logout(_req, res) {
  return res.json({ message: "Logged out successfully" });
}

module.exports = { signup, login, getProfile, logout };
