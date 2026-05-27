import { Router } from "express";
import { postChatAssistant } from "../controllers/chatController.js";

const router = Router();

router.post("/chat-assistant", postChatAssistant);

export default router;
