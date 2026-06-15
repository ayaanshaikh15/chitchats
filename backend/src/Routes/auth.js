import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../Models/userModel.js"
import { protect } from "../middleware/auth.js";
import { generateToken,signup,login,logout,updateProfile,getCurrentUser } from "../Controllers/index.js";
const router = express.Router();

// ======================
// SIGN UP
// ======================
router.post("/signup",signup);

// ======================
// LOGIN
// ======================
router.post("/login", login);

// ======================
// LOGOUT
// ======================
router.post("/logout", logout);



router.put("/update", protect, updateProfile);

router.get("/me", protect, getCurrentUser);

export default router;