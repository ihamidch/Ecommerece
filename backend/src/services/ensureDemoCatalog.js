const bcrypt = require("bcryptjs");
const Product = require("../models/Product");
const User = require("../models/User");

const demoProducts = [
  {
    name: "AirFlow Sneakers",
    description: "Lightweight daily sneakers with responsive cushioning.",
    price: 89,
    category: "Footwear",
    stock: 40,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Urban Leather Bag",
    description: "Premium leather laptop bag with minimalist design.",
    price: 129,
    category: "Accessories",
    stock: 22,
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "NoiseCancel Pro",
    description: "Wireless over-ear headphones with active noise cancellation.",
    price: 199,
    category: "Electronics",
    stock: 18,
    image:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Smart Fitness Watch",
    description: "Track health, steps, sleep, and workouts in style.",
    price: 159,
    category: "Electronics",
    stock: 35,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Cozy Knit Hoodie",
    description: "Soft premium cotton hoodie for all-day comfort.",
    price: 59,
    category: "Apparel",
    stock: 50,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Ceramic Coffee Set",
    description: "Elegant ceramic mug set for home and office coffee lovers.",
    price: 39,
    category: "Home",
    stock: 28,
    image:
      "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=900&q=80",
  },
];

let seedInFlight = null;

/**
 * If the database has zero products, seed a demo catalog once.
 * Set SKIP_AUTO_DEMO_SEED=true to disable.
 */
async function ensureDemoCatalog() {
  if (process.env.SKIP_AUTO_DEMO_SEED === "true") {
    return;
  }

  const initialCount = await Product.countDocuments();
  if (initialCount > 0) {
    return;
  }

  if (seedInFlight) {
    await seedInFlight;
    return;
  }

  seedInFlight = (async () => {
    const count = await Product.countDocuments();
    if (count > 0) {
      return;
    }

    let admin = await User.findOne({ email: "admin@example.com" });
    if (!admin) {
      const password = await bcrypt.hash("password123", 10);
      admin = await User.create({
        name: "Admin User",
        email: "admin@example.com",
        password,
        role: "admin",
      });
    }

    for (const item of demoProducts) {
      await Product.findOneAndUpdate(
        { name: item.name },
        { ...item, createdBy: admin._id },
        { upsert: true, returnDocument: "after" }
      );
    }
  })();

  try {
    await seedInFlight;
  } finally {
    seedInFlight = null;
  }
}

module.exports = { ensureDemoCatalog };
