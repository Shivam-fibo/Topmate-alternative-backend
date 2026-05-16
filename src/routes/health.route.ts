import { Router } from "express";

import { config } from "../config";
import { sendSuccessResponse } from "../utils/api-response";

const router = Router();

router.get("/", (_req, res) => {
  return sendSuccessResponse(res, 200, "Health check passed", {
    uptime: process.uptime(),
    environment: config.nodeEnv,
  });
});

export default router;
