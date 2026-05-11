import rateLimit from "express-rate-limit";

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 100,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,

    message:
      "Too many requests, please try again later",

    errorCode: "RATE_LIMIT_EXCEEDED",

    details: null,

    timestamp: new Date().toISOString(),
  },
});