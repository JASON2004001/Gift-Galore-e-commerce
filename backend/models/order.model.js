import { Schema, model } from "mongoose";

const orderItemSchema = new Schema({
  id: { type: Schema.Types.ObjectId, ref: "Product" },
  name: { type: String, required: true },
  price: { type: Number, required: true }, // Discounted price
  image: String,
  category: String,
  quantity: { type: Number, default: 1, min: 1 },
});

const orderSchema = new Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    items: [orderItemSchema], // Combined multi-product items list
    deliveryFee: {
      type: Number,
      default: 70, // Default delivery fee updated to 70
    },
    subtotalAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending Admin Review", "Accepted", "Rejected", "Delivered"],
      default: "Pending Admin Review",
    },
    deliveredAt: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export const Order = model("Order", orderSchema);