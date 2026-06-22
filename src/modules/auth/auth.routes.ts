import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validation.middleware";

import {
  registerUserController,
  verifyEmailOtpController,
  loginUserController,
  refreshTokenController,
  logoutController,
  getMeController,
} from "./auth.controller";
import {
  registerUserSchema,
  verifyEmailOtpSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
} from "./auth.validation";

const authRouter = Router();

authRouter.post(
  "/register",
  validateRequest({
    body: registerUserSchema,
  }),
  registerUserController,
);

authRouter.post(
  "/verify-email",
  validateRequest({
    body: verifyEmailOtpSchema,
  }),
  verifyEmailOtpController,
);

authRouter.post(
  "/login",
  validateRequest({
    body: loginSchema,
  }),
  loginUserController,
);

authRouter.post(
  "/refresh",
  validateRequest({
    body: refreshTokenSchema,
  }),
  refreshTokenController,
);

authRouter.post(
  "/logout",
  validateRequest({
    body: logoutSchema,
  }),
  logoutController,
);

authRouter.get("/me", authMiddleware, getMeController);

export { authRouter };

