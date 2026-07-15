import { addMinutes } from "date-fns";

import { AppError } from "../../../common/errors/app-error";
import { runTransaction } from "../../../database/transaction";
import { logger } from "../../../logger";
import { emailProvider } from "../../../shared/providers/email";
import {
  MAX_PASSWORD_RESET_ATTEMPTS,
  PASSWORD_RESET_EXPIRES_IN_MINUTES,
  PASSWORD_RESET_RESEND_COOLDOWN_SECONDS,
} from "../auth.constants";
import {
  createPasswordResetToken,
  findLatestPasswordResetToken,
  findPasswordResetTokenById,
  findUserByEmail,
  markPasswordResetTokenUsed,
  revokeAllUserSessions,
  updateUserPassword,
} from "../auth.repository";
import {
  compareTokenHash,
  generateOtp,
  generatePasswordResetSessionToken,
  hashPassword,
  hashToken,
  verifyPasswordResetSessionToken,
} from "../auth.utils";
import { generatePasswordResetTemplate } from "../templates/password-reset.template";

// In-memory cache to track verification attempt counts per token
const attemptCache = new Map<string, { count: number; lastAttempt: Date }>();

/**
 * Handles the forgot password request flow.
 * Generates an OTP, hashes it, saves the reset token, sends the email,
 * and handles email enumeration protection and resend cooldowns.
 */
export const forgotPassword = async (email: string): Promise<void> => {
  const user = await findUserByEmail(email);

  // Email Enumeration Protection: Never reveal if the email exists.
  if (!user) {
    logger.info({ email }, "Password reset requested for non-existing email");
    return;
  }

  // Resend Protection: Check cooldown from latest token
  const latestToken = await findLatestPasswordResetToken(user.id);
  if (latestToken) {
    const timeDifferenceInSeconds = Math.floor(
      (new Date().getTime() - latestToken.createdAt.getTime()) / 1000,
    );

    if (timeDifferenceInSeconds < PASSWORD_RESET_RESEND_COOLDOWN_SECONDS) {
      const waitSeconds =
        PASSWORD_RESET_RESEND_COOLDOWN_SECONDS - timeDifferenceInSeconds;
      throw new AppError(
        `Please wait ${waitSeconds} seconds before requesting a new OTP`,
        429,
        "RESEND_COOLDOWN",
      );
    }
  }

  const otp = generateOtp();
  const tokenHash = hashToken(otp);
  const expiresAt = addMinutes(new Date(), PASSWORD_RESET_EXPIRES_IN_MINUTES);

  await createPasswordResetToken({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  const html = generatePasswordResetTemplate({ otp });

  try {
    await emailProvider.sendEmail({
      to: user.email,
      subject: "Reset your password",
      html,
    });
  } catch (error) {
    logger.error(
      { error, userId: user.id },
      "Failed to send password reset email",
    );
    throw new AppError(
      "Failed to send password reset email",
      500,
      "EMAIL_SEND_FAILED",
    );
  }

  logger.info({ userId: user.id }, "Password reset requested and email sent");
};

/**
 * Verifies the password reset OTP entered by the user.
 * Increments attempt limits, checks expiration, and issues a temporary reset session JWT.
 */
export const verifyResetPasswordOtp = async (
  email: string,
  otp: string,
): Promise<{ token: string }> => {
  const user = await findUserByEmail(email);
  if (!user) {
    logger.warn({ email }, "Attempted OTP verification for non-existing email");
    throw new AppError("Invalid email or OTP", 400, "INVALID_RESET_OTP");
  }

  const token = await findLatestPasswordResetToken(user.id);
  if (!token) {
    logger.warn({ userId: user.id }, "No password reset token found for user");
    throw new AppError("Invalid email or OTP", 400, "INVALID_RESET_OTP");
  }

  // Retrieve and increment attempt count
  const attempts = attemptCache.get(token.id) || {
    count: 0,
    lastAttempt: new Date(),
  };
  attempts.count += 1;
  attempts.lastAttempt = new Date();
  attemptCache.set(token.id, attempts);

  if (attempts.count > MAX_PASSWORD_RESET_ATTEMPTS) {
    logger.warn(
      { userId: user.id, tokenId: token.id, attempts: attempts.count },
      "Excessive password reset OTP verification attempts",
    );
    throw new AppError(
      "Maximum verification attempts exceeded",
      429,
      "MAX_RESET_ATTEMPTS_EXCEEDED",
    );
  }

  if (token.expiresAt < new Date()) {
    logger.warn(
      { userId: user.id, tokenId: token.id },
      "Password reset OTP expired",
    );
    throw new AppError("OTP expired", 400, "RESET_OTP_EXPIRED");
  }

  const isValid = compareTokenHash(otp, token.tokenHash);
  if (!isValid) {
    logger.warn(
      { userId: user.id, tokenId: token.id, attempt: attempts.count },
      "Failed password reset OTP verification",
    );
    throw new AppError("Invalid email or OTP", 400, "INVALID_RESET_OTP");
  }

  // Clear in-memory verification attempts for this token
  attemptCache.delete(token.id);

  // Generate temporary password reset session token (JWT) valid for 15 minutes
  const resetSessionToken = generatePasswordResetSessionToken({
    userId: user.id,
    resetTokenId: token.id,
    purpose: "password_reset",
  });

  logger.info(
    { userId: user.id, tokenId: token.id },
    "Password reset OTP verified successfully",
  );

  return { token: resetSessionToken };
};

/**
 * Resends the password reset OTP if requested, respecting the cooldown period.
 */
export const resendResetPasswordOtp = async (email: string): Promise<void> => {
  // Reuse forgotPassword business logic which contains cooldown checks and email sending
  await forgotPassword(email);
};

/**
 * Performs the actual password update.
 * Validates the temporary reset session token, and updates password, marks OTP used, and invalidates all active sessions in a transaction.
 */
export const resetPassword = async (
  token: string,
  newPassword: string,
): Promise<void> => {
  let payload;
  try {
    payload = verifyPasswordResetSessionToken(token);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorName = error instanceof Error ? error.name : "";

    logger.warn(
      { error: errorMessage },
      "Invalid or expired temporary password reset session token",
    );

    if (errorName === "TokenExpiredError") {
      throw new AppError(
        "Password reset session expired",
        400,
        "RESET_SESSION_EXPIRED",
      );
    }

    throw new AppError(
      "Invalid password reset session",
      400,
      "RESET_SESSION_INVALID",
    );
  }

  await runTransaction(async (tx) => {
    const resetToken = await findPasswordResetTokenById(
      payload.resetTokenId,
      tx,
    );

    if (!resetToken || resetToken.usedAt !== null) {
      logger.warn(
        { tokenId: payload.resetTokenId },
        "Password reset token already used or invalid",
      );
      throw new AppError(
        "Password reset session invalid or already used",
        400,
        "RESET_SESSION_INVALID",
      );
    }

    if (resetToken.expiresAt < new Date()) {
      logger.warn(
        { tokenId: payload.resetTokenId },
        "Password reset token expired",
      );
      throw new AppError(
        "Password reset session expired",
        400,
        "RESET_SESSION_EXPIRED",
      );
    }

    const passwordHash = await hashPassword(newPassword);

    // Update password
    await updateUserPassword(payload.userId, passwordHash, tx);

    // Mark the reset OTP token as used
    await markPasswordResetTokenUsed(resetToken.id, tx);

    // Invalidate every active refresh session (force logout from all devices)
    await revokeAllUserSessions(payload.userId);

    logger.info(
      { userId: payload.userId, tokenId: resetToken.id },
      "Password reset successfully completed and sessions invalidated",
    );
  });
};
