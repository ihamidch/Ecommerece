const Product = require("../models/Product");
const { ensureDemoCatalog } = require("../services/ensureDemoCatalog");

async function getProducts(req, res, next) {
  try {
    await ensureDemoCatalog();

    const { search, category, minPrice, maxPrice } = req.query;
    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    return res.json(products);
  } catch (error) {
    return next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }
    return res.json(product);
  } catch (error) {
    return next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const { name, description, price, category, stock, image } = req.body;
    if (!name || !description || !price || !category) {
      const error = new Error("name, description, price, and category are required");
      error.statusCode = 400;
      throw error;
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock) || 0,
      image: image || "",
      createdBy: req.user._id,
    });

    return res.status(201).json(product);
  } catch (error) {
    return next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    const updates = ["name", "description", "price", "category", "stock", "image"];
    updates.forEach((key) => {
      if (req.body[key] !== undefined) {
        product[key] = req.body[key];
      }
    });

    await product.save();
    return res.json(product);
  } catch (error) {
    return next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    await product.deleteOne();
    return res.json({ message: "Product deleted successfully" });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
