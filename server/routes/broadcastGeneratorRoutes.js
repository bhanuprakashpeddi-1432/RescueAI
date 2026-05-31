import { Router } from "express";
import { createBroadcasts } from "../controllers/broadcastGeneratorController.js";

const router = Router();

// POST /api/broadcast/generate
router.post("/generate", createBroadcasts);

export default router;
