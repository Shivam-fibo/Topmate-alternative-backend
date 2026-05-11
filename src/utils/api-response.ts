import { Response } from "express";

interface SuccessResponse<T> {
  success: true;

  message: string;

  data: T;

  timestamp: string;
}

export const sendSuccessResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T,
): Response<SuccessResponse<T>> => {
  return res.status(statusCode).json({
    success: true,

    message,

    data,

    timestamp: new Date().toISOString(),
  });
};