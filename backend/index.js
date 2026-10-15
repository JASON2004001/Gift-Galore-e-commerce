import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./connectDB/connectDB.js";
import userRouter from "./routes/user.route.js";
import productRoute from "./routes/product.route.js";
import orderRoute from "./routes/order.route.js";

const app = express();

app.disable("x-powered-by");

// Allowed Origins List (Includes production Vercel domain, previews, and local dev)
const allowedOrigins = [
  "https://gift-galore-e-commerce-frontend.vercel.app",
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000"
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// High payload limits for large base64 camera image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Root health-check route to verify backend status on Render
app.get("/", (req, res) => {
  res.status(200).send("🚀 Gift Galore Backend API is active and running!");
});

// API Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/products", productRoute);
app.use("/api/v1/orders", orderRoute);

// Global 404 handler for undefined API routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler (handles PayloadTooLargeError and unexpected exceptions)
app.use((err, req, res, next) => {
  console.error("Unhandled Backend Error:", err);
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Image payload too large. Please use a smaller or compressed image."
    });
  }
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas first, then start the HTTP server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err);
  });
