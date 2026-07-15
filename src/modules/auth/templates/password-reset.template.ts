interface PasswordResetTemplateParams {
  otp: string;
}

export const generatePasswordResetTemplate = (
  params: PasswordResetTemplateParams,
): string => {
  return `
    <html>
      <body>
        <h2>Password Reset</h2>

        <p>
          Use the OTP below to reset your password.
        </p>

        <h1>
          ${params.otp}
        </h1>

        <p>
          This OTP will expire in
          15 minutes.
        </p>

        <p>
          If you did not request a password reset,
          please ignore this email.
        </p>
      </body>
    </html>
  `;
};
