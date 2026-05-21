import crypto from "node:crypto";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { config } from "../../config";

import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
} from "./auth.constants";

interface AccessTokenPayload {
  userId: string;

  sessionId: string;

  roles: string[];

  tokenVersion: number;
}

interface RefreshTokenPayload {
  sessionId: string;

  tokenVersion: number;
}

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  passwordHash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, passwordHash);
};

export const generateSecureToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const compareTokenHash = (token: string, tokenHash: string): boolean => {
  const incomingTokenHash = hashToken(token);

  const incomingBuffer = Buffer.from(incomingTokenHash, "hex");

  const storedBuffer = Buffer.from(tokenHash, "hex");

  if (incomingBuffer.length !== storedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(incomingBuffer, storedBuffer);
};

export const generateAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
};

export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, config.jwt.accessSecret) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as RefreshTokenPayload;
};

export const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
