import express from "express";
import { protect, requireAdmin } from "../Middleware/auth.js";
import { getStats, makeAdmin, getAdmins } from "../Controllers/admin.controllers.js";

const router = express.Router();

router.use(protect, requireAdmin);

router.get("/stats", getStats);
router.put("/make-admin/:id", makeAdmin);
router.get("/admins", getAdmins);

export default router;
