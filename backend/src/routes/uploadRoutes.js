const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const { uploadImage } = require("../controllers/uploadController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const storage = process.env.CLOUDINARY_CLOUD_NAME
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: "mern-ecommerce",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
      },
    })
  : multer.memoryStorage();

const upload = multer({ storage });
const router = express.Router();

router.post("/", protect, adminOnly, upload.single("image"), uploadImage);

module.exports = router;
