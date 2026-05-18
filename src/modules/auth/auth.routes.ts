import { Router } from "express";

import { validateRequest } from "../../middlewares/validation.middleware";

import {
  registerUserController,
  verifyEmailOtpController,
  loginUserController,
} from "./auth.controller";
import {
  registerUserSchema,
  verifyEmailOtpSchema,
  loginSchema,
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

export { authRouter };
