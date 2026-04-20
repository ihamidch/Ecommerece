const axios = require("axios");
const http = require("http");
const https = require("https");

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
  httpAgent: new http.Agent({ keepAlive: false }),
  httpsAgent: new https.Agent({ keepAlive: false }),
});

function uniqueEmail(prefix) {
  return `${prefix}+${Date.now()}@example.com`;
}

async function run() {
  const adminEmail = "admin@example.com";
  const userEmail = uniqueEmail("user");
  const password = "password123";

  // Register admin (admin role is assigned by ADMIN_EMAILS in backend/.env)
  try {
    await api.post("/auth/signup", {
      name: "Admin User",
      email: adminEmail,
      password,
    });
  } catch (error) {
    if (error.response?.status !== 400) {
      throw error;
    }
  }

  // Register normal user
  await api.post("/auth/signup", {
    name: "Normal User",
    email: userEmail,
    password,
  });

  const adminLogin = await api.post("/auth/login", {
    email: adminEmail,
    password,
  });

  const userLogin = await api.post("/auth/login", {
    email: userEmail,
    password,
  });

  const adminToken = adminLogin.data.token;
  const userToken = userLogin.data.token;

  if (!adminToken || !userToken) {
    throw new Error("Missing tokens after login");
  }

  const createdProduct = await api.post(
    "/products",
    {
      name: "Test Product",
      description: "Functional test product",
      price: 199,
      category: "Testing",
      stock: 9,
      image: "https://placehold.co/600x400?text=Test",
    },
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );

  const productId = createdProduct.data._id;
  if (!productId) {
    throw new Error("Product creation failed");
  }

  const products = await api.get("/products");
  if (!Array.isArray(products.data) || products.data.length === 0) {
    throw new Error("Products listing failed");
  }

  const paymentIntent = await api.post(
    "/orders/payment-intent",
    { amount: 199 },
    { headers: { Authorization: `Bearer ${userToken}` } }
  );

  if (!paymentIntent.data.clientSecret) {
    throw new Error("Payment intent endpoint failed");
  }

  const createdOrder = await api.post(
    "/orders",
    {
      cartItems: [
        {
          productId,
          name: "Test Product",
          image: "https://placehold.co/600x400?text=Test",
          price: 199,
          quantity: 1,
        },
      ],
      shippingAddress: {
        fullName: "Normal User",
        address: "Street 123",
        city: "City",
        postalCode: "10001",
        country: "Country",
      },
      paymentMethod: "mock",
      paymentStatus: "paid",
    },
    { headers: { Authorization: `Bearer ${userToken}` } }
  );

  const orderId = createdOrder.data._id;
  if (!orderId) {
    throw new Error("Order creation failed");
  }

  const myOrders = await api.get("/orders/my-orders", {
    headers: { Authorization: `Bearer ${userToken}` },
  });

  if (!Array.isArray(myOrders.data) || myOrders.data.length === 0) {
    throw new Error("User order history failed");
  }

  const adminOrders = await api.get("/orders", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  if (!Array.isArray(adminOrders.data) || adminOrders.data.length === 0) {
    throw new Error("Admin orders endpoint failed");
  }

  const updatedOrder = await api.patch(
    `/orders/${orderId}/status`,
    { status: "shipped" },
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );

  if (updatedOrder.data.status !== "shipped") {
    throw new Error("Order status update failed");
  }

  console.log("E2E tests passed.");
}

run().catch((error) => {
  const message = error.response?.data || error.message;
  console.error("E2E tests failed:", message);
  process.exit(1);
});
