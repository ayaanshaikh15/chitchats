import express from 'express'
import { protect } from "../Middleware/auth.js";
import { upload } from "../Middleware/uploadfile.js";
import { generateToken,signup,login,logout,updateProfile,getCurrentUser } from "../Controllers/auth.controllers.js";
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



router.put("/update", protect, upload.single("profilePic"), updateProfile);

router.get("/me", protect, getCurrentUser);

export default router;