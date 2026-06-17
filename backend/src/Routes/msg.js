import express from 'express'
import { protect } from '../Middleware/auth.js';
import { getConversationsForSidebar, getMessage, getUsers, sendMessage } from '../Controllers/msg.controllers.js';
import { upload } from '../Middleware/uploadfile.js';
const router =express.Router();
router.use(protect);
router.get('/user',getUsers)
router.get('/:id',getMessage);
router.get("/conversation",getConversationsForSidebar);
router.post("/send/:id",upload.single("media"),sendMessage);

export default router;