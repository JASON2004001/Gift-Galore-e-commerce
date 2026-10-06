import { Product } from "../models/product.model.js";

// Unique SKU generator
const generateSKU = (category) => {
  const cleanCat = (category || "PROD")
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 4)
    .toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${cleanCat || "PROD"}-${timestamp}-${randomHex}`;
};

// 1. Create Product
export const createProduct = async (req, res) => {
  try {
    const { name, description, mrp, price, discountPercentage, category, stock, image } = req.body;

    if (!name || !description || price === undefined || !category || stock === undefined || !image) {
      return res.status(400).json({ message: "All fields including image, stock, and price are required" });
    }

    const sku = generateSKU(category);

    const product = await Product.create({
      sku,
      name,
      description,
      mrp: mrp ? Number(mrp) : Number(price),
      discountPercentage: discountPercentage ? Number(discountPercentage) : 0,
      price: Number(price), // Customer pays this Discount Price
      stock: Number(stock),
      image,
      category,
    });

    return res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 2. Get All Products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.status(200).json({ message: "Products fetched successfully", products });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 3. Get Product By ID
export const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    return res.status(200).json({ message: "Product fetched successfully", product });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 4. Update Product Stock (+ / -)
export const updateProductStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { change } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.stock = Math.max(0, product.stock + Number(change || 0));
    await product.save();

    return res.status(200).json({ message: "Stock updated successfully", product });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 5. Toggle Out of Stock
export const toggleOutOfStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.stock = product.stock > 0 ? 0 : 10;
    await product.save();

    return res.status(200).json({ message: "Stock status toggled", product });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 6. Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const deleted = await Product.findByIdAndDelete(productId);
    if (!deleted) return res.status(404).json({ message: "Product not found" });

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};