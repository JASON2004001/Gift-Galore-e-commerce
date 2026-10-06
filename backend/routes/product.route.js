import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProductStock,
  toggleOutOfStock,
  deleteProduct,
} from "../controllers/product.controller.js";
import { verifyJwt, checkRole } from "../middleware/verifyJWT.js";

const router = express.Router();

// Public routes
router.get("/get-products", getProducts);
router.get("/get-product/:productId", getProductById);

// Admin routes
router.post("/create-product", verifyJwt, checkRole, createProduct);
router.patch("/update-stock/:productId", verifyJwt, checkRole, updateProductStock);
router.patch("/toggle-stock/:productId", verifyJwt, checkRole, toggleOutOfStock);
router.delete("/delete-product/:productId", verifyJwt, checkRole, deleteProduct);

export default router;