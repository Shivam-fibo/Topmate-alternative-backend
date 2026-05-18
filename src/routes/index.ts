import { Router } from "express";

import { moduleRoutes } from "../modules";
import { authRouter } from "../modules/auth/auth.routes";

import healthRouter from "./health.route";

interface RouteDefinition {
  path: string;
  router: Router;
}

const routeDefinitions: RouteDefinition[] = [
  {
    path: "/health",
    router: healthRouter,
  },
  ...moduleRoutes,
  {
    path: "/auth",
    router: authRouter,
  },
];

export const routes = Router();

routeDefinitions.forEach(({ path, router }) => {
  routes.use(path, router);
});
