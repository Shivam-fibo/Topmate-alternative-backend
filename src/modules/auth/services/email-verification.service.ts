import { addMinutes } from "date-fns";

import { emailProvider } from "../../../shared/providers/email";
import { EMAIL_VERIFICATION_EXPIRES_IN_MINUTES } from "../auth.constants";
import { createEmailVerificationToken } from "../auth.repository";
import { generateOtp, hashToken } from "../auth.utils";
import { generateEmailVerificationTemplate } from "../templates/email-verification.template";

interface SendVerificationEmailParams {
  userId: string;

  email: string;
}

export const sendVerificationEmail = async (
  params: SendVerificationEmailParams,
): Promise<void> => {
  const otp = generateOtp();

  const tokenHash = hashToken(otp);

  const expiresAt = addMinutes(
    new Date(),
    EMAIL_VERIFICATION_EXPIRES_IN_MINUTES,
  );

  await createEmailVerificationToken({
    userId: params.userId,

    tokenHash,

    expiresAt,
  });

  const html = generateEmailVerificationTemplate({
    otp,
  });

  await emailProvider.sendEmail({
    to: params.email,

    subject: "Verify your email",

    html,
  });
};
