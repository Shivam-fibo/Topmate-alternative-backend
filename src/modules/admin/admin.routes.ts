import { RoleType } from "@prisma/client";
import { Router } from "express";

import { requireRoles } from "../../middlewares/role.middleware";
import { asyncHandler } from "../../utils/async-handler";

import { getAdminMeController } from "./admin.controller";

const adminRouter = Router();

adminRouter.get(
  "/me",

  requireRoles([RoleType.ADMIN]),

  asyncHandler(getAdminMeController),
);

export { adminRouter };
