const Product = require("../models/Product");
const { ensureDemoCatalog } = require("../services/ensureDemoCatalog");

async function getProductCategories(req, res, next) {
  try {
    await ensureDemoCatalog();
    const categories = await Product.distinct("category");
    categories.sort((a, b) => a.localeCompare(b));
    return res.json(categories);
  } catch (error) {
    return next(error);
  }
}

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
    if (!name || !description || price === undefined || price === null || !category) {
      const error = new Error("name, description, price, and category are required");
      error.statusCode = 400;
      throw error;
    }

    const priceNum = Number(price);
    const stockNum = Number(stock);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      const error = new Error("price must be a non-negative number");
      error.statusCode = 400;
      throw error;
    }
    if (Number.isNaN(stockNum) || stockNum < 0) {
      const error = new Error("stock must be a non-negative number");
      error.statusCode = 400;
      throw error;
    }

    const product = await Product.create({
      name: String(name).trim(),
      description: String(description).trim(),
      price: priceNum,
      category: String(category).trim(),
      stock: stockNum,
      image: typeof image === "string" ? image.trim() : "",
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

    if (req.body.price !== undefined) {
      const p = Number(product.price);
      if (Number.isNaN(p) || p < 0) {
        const error = new Error("price must be a non-negative number");
        error.statusCode = 400;
        throw error;
      }
      product.price = p;
    }
    if (req.body.stock !== undefined) {
      const s = Number(product.stock);
      if (Number.isNaN(s) || s < 0) {
        const error = new Error("stock must be a non-negative number");
        error.statusCode = 400;
        throw error;
      }
      product.stock = s;
    }
    if (typeof product.name === "string") product.name = product.name.trim();
    if (typeof product.description === "string") product.description = product.description.trim();
    if (typeof product.category === "string") product.category = product.category.trim();
    if (typeof product.image === "string") product.image = product.image.trim();

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
  getProductCategories,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
