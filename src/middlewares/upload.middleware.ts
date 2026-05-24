import multer from "multer";

import { AppError } from "../common/errors/app-error";

const allowedMimeTypes = ["image/jpeg", "image/png", "application/pdf"];

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      callback(new AppError("Unsupported file type", 400, "INVALID_FILE_TYPE"));

      return;
    }

    callback(null, true);
  },
});
