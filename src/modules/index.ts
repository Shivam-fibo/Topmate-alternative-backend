import type { Router } from "express";

import { adminRouter } from "./admin/admin.routes";

export interface ModuleRouteDefinition {
  path: string;

  router: Router;

  isPrivate?: boolean;
}

export const moduleRoutes: ModuleRouteDefinition[] = [
  {
    path: "/admin",

    router: adminRouter,

    isPrivate: true,
  },
];
