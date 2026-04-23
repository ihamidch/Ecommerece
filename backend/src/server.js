const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ quiet: true });

const app = require("./app");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("MONGO_URI is required in environment variables");
}

let cachedConnection = null;

async function connectDb() {
  if (cachedConnection) {
    return cachedConnection;
  }

  cachedConnection = await mongoose.connect(MONGO_URI);
  return cachedConnection;
}

if (process.env.VERCEL) {
  module.exports = async (req, res) => {
    await connectDb();
    return app(req, res);
  };
} else {
  connectDb()
    .then(() => {
      app.listen(PORT, () => {
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console -- local dev visibility only
          console.log(`Backend running on port ${PORT}`);
        }
      });
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error("Database connection failed", error);
      process.exit(1);
    });
}
