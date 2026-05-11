import { Router } from "express";

export interface ModuleRouteDefinition {
  path: string;
  router: Router;
}

export const moduleRoutes: ModuleRouteDefinition[] =
  [];
