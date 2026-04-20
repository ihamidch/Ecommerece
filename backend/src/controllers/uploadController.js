const cloudinary = require("cloudinary").v2;

if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

async function uploadImage(req, res, next) {
  try {
    if (req.file?.path) {
      return res.status(201).json({ url: req.file.path });
    }

    const { imageBase64 } = req.body;
    if (!imageBase64) {
      const error = new Error("Image file or base64 payload is required");
      error.statusCode = 400;
      throw error;
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return res.status(201).json({
        url: imageBase64,
        message: "Cloudinary not configured. Stored base64 preview only.",
      });
    }

    const result = await cloudinary.uploader.upload(imageBase64, {
      folder: "mern-ecommerce",
    });

    return res.status(201).json({ url: result.secure_url });
  } catch (error) {
    return next(error);
  }
}

module.exports = { uploadImage };
