import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const isUserAlreadyExists = await User.findOne({ email: email.toLowerCase() });
    if (isUserAlreadyExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const role = email.toLowerCase() === "babymanna1975@gmail.com" ? "admin" : "user";

    const user = await User.create({
      userName,
      email: email.toLowerCase(),
      password,
      role,
    });

    const token = jwt.sign(
      { user_id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    const userResponse = {
      _id: user._id,
      name: user.userName,
      email: user.email,
      role: user.role,
    };

    return res.status(201).json({
      message: "User created successfully",
      user: userResponse,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if this is the store admin
    if (cleanEmail === "babymanna1975@gmail.com") {
      if (password !== "123456") {
        return res.status(400).json({ message: "Invalid admin password" });
      }

      let adminUser = await User.findOne({ email: cleanEmail });
      if (!adminUser) {
        adminUser = await User.create({
          userName: "Store Admin",
          email: cleanEmail,
          password: "123456",
          role: "admin",
        });
      } else if (adminUser.role !== "admin") {
        adminUser.role = "admin";
        await adminUser.save();
      }

      const token = jwt.sign(
        { user_id: adminUser._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
      );

      return res.status(200).json({
        message: "Admin authenticated successfully",
        user: {
          _id: adminUser._id,
          name: adminUser.userName,
          email: adminUser.email,
          role: "admin",
        },
        token,
      });
    }

    // Normal customer login
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { user_id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.status(200).json({
      message: "User logged in successfully",
      user: {
        _id: user._id,
        name: user.userName,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logoutUser = async (req, res) => {
  return res.status(200).json({ message: "User logged out successfully" });
};

const getCurrentUser = async (req, res) => {
  try {
    return res.status(200).json({
      user: {
        _id: req.user._id,
        name: req.user.userName,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { registerUser, loginUser, logoutUser, getCurrentUser };