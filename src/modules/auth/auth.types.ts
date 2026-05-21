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

  currentTokenVersion: number;

  nextTokenVersion: number;

  userAgent?: string;

  ipAddress?: string;
}

export interface RefreshTokenInput {
  refreshToken: string;

  userAgent?: string;

  ipAddress?: string;
}

export interface LogoutInput {
  refreshToken: string;
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

export interface LoginUserInput {
  email: string;

  password: string;

  userAgent?: string;

  ipAddress?: string;
}

export interface AuthResponse {
  accessToken: string;

  refreshToken: string;

  user: {
    id: string;

    email: string;

    isEmailVerified: boolean;

    roles: string[];
  };
}
