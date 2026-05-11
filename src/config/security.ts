import cors, { CorsOptions } from "cors";

import helmet from "helmet";

import { config } from "./index";

const isProduction =
  config.nodeEnv === "production";

export const corsConfig: CorsOptions = {
  origin: [config.clientUrl],

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
  ],
};

export const helmetConfig = helmet({
  crossOriginResourcePolicy: isProduction
    ? { policy: "same-site" }
    : false,
});