import { RoleType } from "@prisma/client";
import { Router } from "express";


import { requireRoles } from "../../middlewares/role.middleware";
import { uploadMiddleware } from "../../middlewares/upload.middleware";
import { asyncHandler } from "../../utils/async-handler";

import { uploadFileController } from "./upload.controller";

const uploadRouter = Router();

uploadRouter.post(
  "/",

  requireRoles([RoleType.ADMIN, RoleType.MENTOR]),

  uploadMiddleware.single("file"),

  asyncHandler(uploadFileController),
);

export { uploadRouter };
