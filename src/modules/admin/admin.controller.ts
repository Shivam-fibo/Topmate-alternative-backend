import type { Request, Response } from "express";

import { sendSuccessResponse } from "../../utils/api-response";

import { getAdminProfile } from "./admin.service";

export const getAdminMeController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const admin = await getAdminProfile(req.user!.userId);

  sendSuccessResponse(res, 200, "Admin profile fetched successfully", admin);
};
