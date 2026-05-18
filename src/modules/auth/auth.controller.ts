import type { Request, Response } from "express";

import { registerUser, loginUser } from "./auth.service";
import { verifyEmailOtp } from "./services/verify-email.service";

export const registerUserController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const user = await registerUser(req.body);

  res.status(201).json({
    success: true,

    message: "Registration successful",

    data: {
      userId: user.id,

      email: user.email,
    },
  });
};

export const verifyEmailOtpController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  await verifyEmailOtp(req.body);

  res.status(200).json({
    success: true,

    message: "Email verified successfully",
  });
};

export const loginUserController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authResponse = await loginUser({
    ...req.body,

    userAgent: req.headers["user-agent"],

    ipAddress: req.ip,
  });

  res.status(200).json({
    success: true,

    message: "Login successful",

    data: authResponse,
  });
};
