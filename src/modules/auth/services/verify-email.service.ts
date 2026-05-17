import { AppError } from "../../../common/errors/app-error";
import { MAX_EMAIL_VERIFICATION_ATTEMPTS } from "../auth.constants";
import {
  findEmailVerificationToken,
  incrementEmailVerificationAttempts,
  markEmailVerificationTokenUsed,
  markUserEmailVerified,
} from "../auth.repository";
import { hashToken } from "../auth.utils";

interface VerifyEmailOtpInput {
  otp: string;
}

export const verifyEmailOtp = async (
  input: VerifyEmailOtpInput,
): Promise<void> => {
  const tokenHash = hashToken(input.otp);

  const verificationToken = await findEmailVerificationToken(tokenHash);

  if (!verificationToken) {
    throw new AppError("Invalid OTP", 400, "INVALID_OTP");
  }

  if (verificationToken.attemptCount >= MAX_EMAIL_VERIFICATION_ATTEMPTS) {
    throw new AppError(
      "Maximum verification attempts exceeded",
      429,
      "MAX_OTP_ATTEMPTS_EXCEEDED",
    );
  }

  await incrementEmailVerificationAttempts(verificationToken.id);

  if (verificationToken.expiresAt < new Date()) {
    throw new AppError("OTP expired", 400, "OTP_EXPIRED");
  }

  if (verificationToken.user.isEmailVerified) {
    return;
  }

  await Promise.all([
    markUserEmailVerified(verificationToken.userId),

    markEmailVerificationTokenUsed(verificationToken.id),
  ]);
};
