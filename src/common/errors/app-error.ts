export class AppError extends Error {
  public readonly statusCode: number;

  public readonly errorCode: string;

  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode = 500,
    errorCode = "INTERNAL_SERVER_ERROR",
    isOperational = true,
  ) {
    super(message);

    this.statusCode = statusCode;

    this.errorCode = errorCode;

    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}