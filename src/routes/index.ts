import { Router } from "express";

import { authMiddleware } from "../middlewares/auth.middleware";
import { moduleRoutes } from "../modules";
import { authRouter } from "../modules/auth/auth.routes";

import healthRouter from "./health.route";

interface RouteDefinition {
  path: string;

  router: Router;

  isPrivate?: boolean;
}

const routeDefinitions: RouteDefinition[] = [
  {
    path: "/health",

    router: healthRouter,
  },

  {
    path: "/auth",

    router: authRouter,
  },

  ...moduleRoutes,
];

export const routes = Router();

routeDefinitions.forEach(({ path, router, isPrivate }) => {
  if (isPrivate) {
    routes.use(path, authMiddleware, router);

    return;
  }

  routes.use(path, router);
});
