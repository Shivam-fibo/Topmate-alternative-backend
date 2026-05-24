import type { Request, Response } from "express";

import { AppError } from "../../common/errors/app-error";
import { storageService } from "../../storage/storage.service";
import { sendSuccessResponse } from "../../utils/api-response";

export const uploadFileController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.file) {
    throw new AppError("File is required", 400, "FILE_REQUIRED");
  }

  const uploadedFile = await storageService.uploadFile({
    file: req.file.buffer,

    fileName: req.file.originalname,

    contentType: req.file.mimetype,

    folder: "mentor-onboarding",
  });

  sendSuccessResponse(res, 201, "File uploaded successfully", uploadedFile);
};
