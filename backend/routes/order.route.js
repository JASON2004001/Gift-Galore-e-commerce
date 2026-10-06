import express from "express";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateDeliveryFee,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/order.controller.js";
import { verifyJwt, checkRole } from "../middleware/verifyJWT.js";

const router = express.Router();

// User endpoints
router.post("/create-order", verifyJwt, createOrder);
router.get("/my-orders", verifyJwt, getMyOrders);

// Admin endpoints
router.get("/admin/all-orders", verifyJwt, checkRole, getAllOrders);
router.patch("/admin/update-fee/:orderId", verifyJwt, checkRole, updateDeliveryFee);
router.patch("/admin/update-status/:orderId", verifyJwt, checkRole, updateOrderStatus);
router.delete("/admin/delete-order/:orderId", verifyJwt, checkRole, deleteOrder);

export default router;