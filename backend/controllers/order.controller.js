import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";

// Create Order (Handles both single product and combined multi-item cart purchases)
export const createOrder = async (req, res) => {
  try {
    const { items, productId, quantity, customerName, phone, address, city, notes } = req.body;

    if (!customerName || !phone || !address || !city) {
      return res.status(400).json({ message: "All customer delivery details are required" });
    }

    const deliveryFee = 70; // Updated default delivery fee to ₹70
    const processedItems = [];
    let subtotalAmount = 0;

    // Multi-item cart purchase
    if (items && Array.isArray(items) && items.length > 0) {
      for (const itm of items) {
        const prod = await Product.findById(itm.productId || itm._id || itm.id);
        if (!prod) continue;

        const qty = Number(itm.quantity || itm.qty || 1);
        if (prod.stock < qty) {
          return res.status(400).json({ message: `Insufficient stock for ${prod.name}. Available: ${prod.stock}` });
        }

        // Deduct stock
        prod.stock = Math.max(0, prod.stock - qty);
        await prod.save();

        processedItems.push({
          id: prod._id,
          name: prod.name,
          price: prod.price,
          image: prod.image,
          category: prod.category,
          quantity: qty,
        });

        subtotalAmount += prod.price * qty;
      }
    } else if (productId) {
      // Single product purchase
      const prod = await Product.findById(productId);
      if (!prod) return res.status(404).json({ message: "Product not found" });

      const qty = Number(quantity || 1);
      if (prod.stock < qty) {
        return res.status(400).json({ message: `Insufficient stock. Only ${prod.stock} available.` });
      }

      prod.stock = Math.max(0, prod.stock - qty);
      await prod.save();

      processedItems.push({
        id: prod._id,
        name: prod.name,
        price: prod.price,
        image: prod.image,
        category: prod.category,
        quantity: qty,
      });

      subtotalAmount = prod.price * qty;
    } else {
      return res.status(400).json({ message: "No items provided in order" });
    }

    const totalAmount = subtotalAmount + deliveryFee;
    const orderId = "ORD-" + Date.now().toString().slice(-6);

    const order = await Order.create({
      orderId,
      user: req.user._id,
      userEmail: req.user.email,
      customerName,
      phone,
      address,
      city,
      notes: notes || "",
      items: processedItems,
      deliveryFee,
      subtotalAmount,
      totalAmount,
      status: "Pending Admin Review",
    });

    res.status(201).json({ message: "Combined order placed successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User: Get Personal Orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get All Orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update Delivery Fee
export const updateDeliveryFee = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryFee } = req.body;

    const fee = Number(deliveryFee);
    if (isNaN(fee) || fee < 0) {
      return res.status(400).json({ message: "Invalid delivery fee" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.deliveryFee = fee;
    order.totalAmount = (order.subtotalAmount || 0) + fee;
    await order.save();

    res.status(200).json({ message: "Delivery fee updated", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update Status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Restore inventory if order is rejected
    if (status === "Rejected" && order.status !== "Rejected") {
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.id, { $inc: { stock: item.quantity } });
        }
      }
    }

    if (status === "Delivered") {
      order.deliveredAt =
        new Date().toLocaleDateString("en-IN") + " " + new Date().toLocaleTimeString("en-IN");
    }

    order.status = status;
    await order.save();

    res.status(200).json({ message: `Order status set to ${status}`, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Delete Request
export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ message: "Order request deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};