const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Product = require("../src/models/Product");

dotenv.config();

async function cleanup() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI not found in environment");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const removeResult = await Product.deleteMany({
    $or: [
      { name: { $regex: /^test product$/i } },
      { image: { $regex: /placehold\.co/i } },
      { description: { $regex: /functional test product/i } },
    ],
  });

  console.log(`Removed ${removeResult.deletedCount} test products.`);
  await mongoose.disconnect();
}

cleanup().catch((error) => {
  console.error("Cleanup failed:", error.message);
  process.exit(1);
});
