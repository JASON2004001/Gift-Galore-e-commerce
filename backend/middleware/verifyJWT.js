import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const verifyJwt = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token = req.cookies?.token || (authHeader?.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : null);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken?.user_id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: Invalid user" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token", error: error.message });
  }
};

const checkRole = async (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin privileges required" });
  }
  next();
};

export { verifyJwt, checkRole };