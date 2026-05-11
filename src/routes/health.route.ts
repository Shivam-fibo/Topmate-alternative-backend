import { Router } from "express";

import { config } from "../config";

const router = Router();

router.get("/", (_req, res) => {
  return res.status(200).json({
    success: true,

    uptime: process.uptime(),

    timestamp: new Date().toISOString(),

    environment: config.nodeEnv,
  });
});

export default router;