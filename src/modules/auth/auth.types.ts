export interface RegisterUserInput {
  email: string;

  password: string;

  role: "USER" | "MENTOR";
}

export interface CreateSessionParams {
  userId: string;

  refreshTokenHash: string;

  expiresAt: Date;

  userAgent?: string;

  ipAddress?: string;
}

export interface RotateSessionTokenParams {
  sessionId: string;

  refreshTokenHash: string;

  expiresAt: Date;
}

export interface CreateUserParams {
  email: string;

  passwordHash: string;
}

export interface AssignRoleParams {
  userId: string;

  roleId: string;
}

export interface CreateEmailVerificationTokenParams {
  userId: string;

  tokenHash: string;

  expiresAt: Date;
}
