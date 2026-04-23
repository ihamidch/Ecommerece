const Stripe = require("stripe");
const Product = require("../models/Product");
const Order = require("../models/Order");

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

function normalizeItems(cartItems) {
  return cartItems.map((item) => ({
    product: item.productId,
    name: item.name,
    image: item.image || "",
    price: Number(item.price),
    quantity: Number(item.quantity),
  }));
}

function metaSlice(value, max = 450) {
  return String(value ?? "").slice(0, max);
}

async function validateAndNormalizeCartItems(cartItems) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    const error = new Error("Cart items are required");
    error.statusCode = 400;
    throw error;
  }

  const productIds = cartItems.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  if (products.length !== productIds.length) {
    const error = new Error("Some products do not exist");
    error.statusCode = 400;
    throw error;
  }

  const priceMap = new Map(
    products.map((product) => [String(product._id), { price: product.price, stock: product.stock }])
  );
  const normalizedItems = normalizeItems(cartItems).map((item) => ({
    ...item,
    price: priceMap.get(String(item.product))?.price ?? item.price,
  }));

  for (const item of normalizedItems) {
    const meta = priceMap.get(String(item.product));
    if (!meta) {
      const error = new Error("Invalid product in cart");
      error.statusCode = 400;
      throw error;
    }
    if (item.quantity > meta.stock) {
      const error = new Error(`Insufficient stock for "${item.name}" (available: ${meta.stock})`);
      error.statusCode = 400;
      throw error;
    }
  }

  const totalAmount = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { normalizedItems, totalAmount };
}

async function persistOrderWithStock({
  userId,
  normalizedItems,
  shippingAddress,
  paymentMethod,
  paymentStatus,
  stripeSessionId,
}) {
  const totalAmount = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const stockDecrements = [];
  try {
    for (const item of normalizedItems) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!updated) {
        const error = new Error(`Could not reserve stock for "${item.name}"`);
        error.statusCode = 409;
        throw error;
      }
      stockDecrements.push({ productId: item.product, quantity: item.quantity });
    }

    const payload = {
      user: userId,
      items: normalizedItems,
      shippingAddress,
      totalAmount,
      paymentMethod,
      paymentStatus,
    };
    if (stripeSessionId) {
      payload.stripeSessionId = stripeSessionId;
    }

    const order = await Order.create(payload);
    return order;
  } catch (orderError) {
    await Promise.all(
      stockDecrements.map((row) => Product.findByIdAndUpdate(row.productId, { $inc: { stock: row.quantity } }))
    );
    throw orderError;
  }
}

function assertShippingAddress(shippingAddress) {
  if (
    !shippingAddress?.fullName ||
    !shippingAddress?.address ||
    !shippingAddress?.city ||
    !shippingAddress?.postalCode ||
    !shippingAddress?.country
  ) {
    const error = new Error("Complete shipping address is required");
    error.statusCode = 400;
    throw error;
  }
}

async function createOrder(req, res, next) {
  try {
    const { cartItems, shippingAddress, paymentMethod = "mock", paymentStatus } = req.body;
    assertShippingAddress(shippingAddress);

    const { normalizedItems } = await validateAndNormalizeCartItems(cartItems);

    if (paymentMethod === "stripe") {
      const error = new Error(
        "Stripe orders must be completed via Stripe Checkout (redirect flow). Choose mock payment here, or pay with Stripe from the Stripe option on checkout."
      );
      error.statusCode = 400;
      throw error;
    }

    const order = await persistOrderWithStock({
      userId: req.user._id,
      normalizedItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentStatus || (paymentMethod === "mock" ? "paid" : "pending"),
      stripeSessionId: null,
    });

    return res.status(201).json(order);
  } catch (error) {
    return next(error);
  }
}

async function getStripeConfig(_req, res) {
  return res.json({
    stripeEnabled: Boolean(stripe),
  });
}

async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return next(error);
  }
}

async function getAllOrders(_req, res, next) {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return next(error);
  }
}

async function getOrderById(req, res, next) {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    const isOwner = String(order.user?._id) === String(req.user._id);
    if (!isOwner && req.user.role !== "admin") {
      const error = new Error("Not authorized to view this order");
      error.statusCode = 403;
      throw error;
    }

    return res.json(order);
  } catch (error) {
    return next(error);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    if (req.body.status) {
      if (!ORDER_STATUSES.includes(req.body.status)) {
        const error = new Error(`Invalid order status. Allowed: ${ORDER_STATUSES.join(", ")}`);
        error.statusCode = 400;
        throw error;
      }
      order.status = req.body.status;
    }

    if (req.body.paymentStatus) {
      order.paymentStatus = req.body.paymentStatus;
    }

    await order.save();
    return res.json(order);
  } catch (error) {
    return next(error);
  }
}

async function createPaymentIntent(req, res, next) {
  try {
    const { amount } = req.body;
    if (!amount || Number(amount) <= 0) {
      const error = new Error("Valid amount is required");
      error.statusCode = 400;
      throw error;
    }

    if (!stripe) {
      return res.json({
        clientSecret: "mock-payment-secret",
        mode: "mock",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100),
      currency: "usd",
      payment_method_types: ["card"],
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
      mode: "stripe",
    });
  } catch (error) {
    return next(error);
  }
}

async function createCheckoutSession(req, res, next) {
  try {
    if (!stripe) {
      const error = new Error("Stripe is not configured on the server");
      error.statusCode = 503;
      throw error;
    }

    const { cartItems, shippingAddress, successUrl, cancelUrl } = req.body;
    assertShippingAddress(shippingAddress);

    if (!successUrl || !String(successUrl).includes("{CHECKOUT_SESSION_ID}")) {
      const error = new Error("successUrl must include the literal {CHECKOUT_SESSION_ID}");
      error.statusCode = 400;
      throw error;
    }
    if (!cancelUrl) {
      const error = new Error("cancelUrl is required");
      error.statusCode = 400;
      throw error;
    }

    await validateAndNormalizeCartItems(cartItems);

    const lineItems = cartItems.map((item) => ({
      quantity: Math.max(1, Number(item.quantity) || 1),
      price_data: {
        currency: "usd",
        unit_amount: Math.round(Number(item.price) * 100),
        product_data: {
          name: String(item.name || "Product"),
          images: item.image ? [String(item.image)] : [],
          metadata: {
            productId: String(item.productId),
          },
        },
      },
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: req.user?.email || undefined,
      metadata: {
        userId: String(req.user._id),
        ship_fullName: metaSlice(shippingAddress.fullName),
        ship_address: metaSlice(shippingAddress.address),
        ship_city: metaSlice(shippingAddress.city),
        ship_postal: metaSlice(shippingAddress.postalCode),
        ship_country: metaSlice(shippingAddress.country),
      },
    });

    return res.json({
      checkoutUrl: session.url,
      sessionId: session.id,
      mode: "stripe",
    });
  } catch (error) {
    return next(error);
  }
}

async function completeStripeCheckout(req, res, next) {
  try {
    if (!stripe) {
      const error = new Error("Stripe is not configured on the server");
      error.statusCode = 503;
      throw error;
    }

    const { sessionId } = req.body;
    if (!sessionId || typeof sessionId !== "string") {
      const error = new Error("sessionId is required");
      error.statusCode = 400;
      throw error;
    }

    const existing = await Order.findOne({ stripeSessionId: sessionId });
    if (existing) {
      return res.status(200).json(existing);
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price.product"],
    });

    if (session.payment_status !== "paid") {
      const error = new Error("Checkout session is not paid yet");
      error.statusCode = 400;
      throw error;
    }

    if (String(session.metadata?.userId || "") !== String(req.user._id)) {
      const error = new Error("This checkout session does not belong to the current user");
      error.statusCode = 403;
      throw error;
    }

    const shippingAddress = {
      fullName: session.metadata.ship_fullName,
      address: session.metadata.ship_address,
      city: session.metadata.ship_city,
      postalCode: session.metadata.ship_postal,
      country: session.metadata.ship_country,
    };
    assertShippingAddress(shippingAddress);

    let lineRows = session.line_items?.data;
    if (!Array.isArray(lineRows) || lineRows.length === 0) {
      const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, {
        limit: 100,
        expand: ["data.price.product"],
      });
      lineRows = lineItems.data || [];
    }

    if (!lineRows.length) {
      const error = new Error("Checkout session has no line items");
      error.statusCode = 400;
      throw error;
    }

    const cartItems = [];
    for (const line of lineRows) {
      const product = line.price?.product;
      const productId =
        typeof product === "string"
          ? null
          : product?.metadata?.productId || product?.metadata?.productid;
      if (!productId) {
        const error = new Error("Checkout line items are missing product metadata");
        error.statusCode = 400;
        throw error;
      }
      const unitAmount = line.price?.unit_amount;
      if (!Number.isFinite(unitAmount)) {
        const error = new Error("Invalid line item pricing from Stripe");
        error.statusCode = 400;
        throw error;
      }
      cartItems.push({
        productId,
        name: line.description || "Product",
        image: "",
        price: unitAmount / 100,
        quantity: line.quantity || 1,
      });
    }

    const { normalizedItems, totalAmount } = await validateAndNormalizeCartItems(cartItems);
    const expectedCents = Math.round(totalAmount * 100);
    if (Math.abs(Number(session.amount_total) - expectedCents) > 2) {
      const error = new Error("Paid amount does not match current catalog pricing. Please contact support.");
      error.statusCode = 409;
      throw error;
    }

    const order = await persistOrderWithStock({
      userId: req.user._id,
      normalizedItems,
      shippingAddress,
      paymentMethod: "stripe",
      paymentStatus: "paid",
      stripeSessionId: sessionId,
    });

    return res.status(201).json(order);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createOrder,
  getStripeConfig,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  createPaymentIntent,
  createCheckoutSession,
  completeStripeCheckout,
};
