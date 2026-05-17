interface EmailVerificationTemplateParams {
  otp: string;
}

export const generateEmailVerificationTemplate = (
  params: EmailVerificationTemplateParams,
): string => {
  return `
    <html>
      <body>
        <h2>Email Verification</h2>

        <p>
          Use the OTP below to verify
          your email address.
        </p>

        <h1>
          ${params.otp}
        </h1>

        <p>
          This OTP will expire in
          15 minutes.
        </p>

        <p>
          If you did not create this account,
          please ignore this email.
        </p>
      </body>
    </html>
  `;
};
