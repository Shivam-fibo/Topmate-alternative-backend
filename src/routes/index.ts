import { Router } from "express";

import { moduleRoutes } from "../modules";

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
];

export const routes = Router();

routeDefinitions.forEach(({ path, router }) => {
  routes.use(path, router);
});
