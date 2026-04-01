import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (user) => {
    return jwt.sign({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
    }, process.env.JWT_SECRET, { expiresIn: "7d" }
);
};


const sendTokenCookie = (req, res, token) => {
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "strict" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};


// export const register = async (req, res) => {
//     try {
//         const { name, email, password } = req.body;
//         const existingUser = await User.findOne({ email });
//     if (existingUser) {
//     return res.status(400).json({ message: "Email already registered" });
//     }
//         const user = await User.create({ name, email, password });
//         const token = generateToken(user);
//         sendTokenCookie(req, res, token);
//         res.status(201).json({ message: "User created successfully", user: {
//             id: user._id, 
//             name: user.name, 
//             email: user.email 
//         }
//         });
//     } catch (error) {
//         res.status(500).json({ message: "Server error" });
//     }
// };

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const token = generateToken(user);
        sendTokenCookie(req, res, token);
        res.status(200).json({ message: "Login successful", user: {
            id: user._id, 
            name: user.name, 
            email: user.email 
        }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Logout user by clearing the authentication token cookie.
 * @returns {Promise<Object>} Success response with a message.

/*******  7fbc933b-88ac-4ef8-abde-92e9d542db0d  *******/export const logout = async (req, res) => {
    try {
        res.clearCookie("token");
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User found", user: {
            id: user._id, 
            name: user.name, 
            email: user.email 
        }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ message: "Invalid current password" });
        }
        user.password = newPassword;
        await user.save();
        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};