const Product = require("../models/Product");
const { ensureDemoCatalog } = require("../services/ensureDemoCatalog");

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

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

    const { search, category, minPrice, maxPrice, minRating, sort } = req.query;
    const filter = {};

    if (search) filter.name = { $regex: search, $options: "i" };
    if (category) filter.category = category;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (minRating) filter.rating = { $gte: Number(minRating) };

    const sortMap = {
      newest: { createdAt: -1 },
      priceAsc: { price: 1 },
      priceDesc: { price: -1 },
      topRated: { rating: -1, numReviews: -1, createdAt: -1 },
    };
    const sortBy = sortMap[sort] || sortMap.newest;

    const hasPaginationQuery = req.query.page !== undefined || req.query.limit !== undefined;
    if (!hasPaginationQuery) {
      const products = await Product.find(filter).sort(sortBy);
      return res.json(products);
    }

    const page = parsePositiveInt(req.query.page, 1);
    const limit = parsePositiveInt(req.query.limit, 9);
    const skip = (page - 1) * limit;

    const [items, totalItems] = await Promise.all([
      Product.find(filter).sort(sortBy).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    return res.json({
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / limit)),
      },
    });
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

async function addProductReview(req, res, next) {
  try {
    const { rating, comment } = req.body;
    const parsedRating = Number(rating);

    if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      const error = new Error("rating must be a number between 1 and 5");
      error.statusCode = 400;
      throw error;
    }
    if (!comment || !String(comment).trim()) {
      const error = new Error("comment is required");
      error.statusCode = 400;
      throw error;
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    const existingReview = product.reviews.find(
      (item) => String(item.user) === String(req.user._id)
    );
    if (existingReview) {
      existingReview.rating = parsedRating;
      existingReview.comment = String(comment).trim();
      existingReview.createdAt = new Date();
    } else {
      product.reviews.push({
        user: req.user._id,
        name: req.user.name,
        rating: parsedRating,
        comment: String(comment).trim(),
      });
    }

    product.numReviews = product.reviews.length;
    const totalRating = product.reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0);
    product.rating = product.numReviews ? Number((totalRating / product.numReviews).toFixed(2)) : 0;

    await product.save();
    return res.status(201).json({
      message: existingReview ? "Review updated" : "Review added",
      rating: product.rating,
      numReviews: product.numReviews,
      reviews: product.reviews,
    });
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
  addProductReview,
  createProduct,
  updateProduct,
  deleteProduct,
};
