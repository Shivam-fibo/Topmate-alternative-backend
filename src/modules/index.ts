import type { Router } from "express";

import { adminRouter } from "./admin/admin.routes";
import { onboardingCategoryPublicRouter } from "./onboarding/onboarding-category/onboarding-category.public.routes";
import { onboardingCategoryRouter } from "./onboarding/onboarding-category/onboarding-category.routes";
import { onboardingSubmissionRouter } from "./onboarding/onboarding-submission/onboarding-submission.routes";
import { uploadRouter } from "./upload/upload.routes";

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

  {
    path: "/admin/onboarding-categories",

    router: onboardingCategoryRouter,

    isPrivate: true,
  },

  {
    path: "/onboarding-categories",

    router: onboardingCategoryPublicRouter,
  },

  {
    path: "/uploads",

    router: uploadRouter,

    isPrivate: true,
  },

  {
    path: "/onboarding-submissions",

    router: onboardingSubmissionRouter,

    isPrivate: true,
  },
];
