import { AppError } from "../../common/errors/app-error";

import { findAdminById } from "./admin.repository";

export const getAdminProfile = async (userId: string) => {
  const admin = await findAdminById(userId);

  if (!admin) {
    throw new AppError("Admin not found", 404, "ADMIN_NOT_FOUND");
  }

  return {
    id: admin.id,

    email: admin.email,

    roles: admin.roles.map((userRole) => userRole.role.name),

    createdAt: admin.createdAt,
  };
};
