import dotenv from "dotenv";
// 1. Initialize dotenv immediately at the very top
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

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// High payload limit for drag-and-drop base64 product images
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(cookieParser());

// API Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/products", productRoute);
app.use("/api/v1/orders", orderRoute);

const PORT = process.env.PORT || 5000;

// Connect to Database first, then start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err);
  });