import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized, please login first" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ message: "Forbidden, you are not an admin" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};








