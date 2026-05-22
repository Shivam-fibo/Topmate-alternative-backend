import type { Router } from "express";

export interface ModuleRouteDefinition {
  path: string;

  router: Router;

  isPrivate?: boolean;
}
