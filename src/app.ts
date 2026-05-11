import express, { Express } from "express";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import hpp from "hpp";

import { requestLoggerMiddleware } from "./middlewares/request-logger.middleware";
import { requestIdMiddleware } from "./middlewares/request-id.middleware";
import { notFoundMiddleware } from "./middlewares/not-found.middleware";
import { globalErrorMiddleware } from "./middlewares/error.middleware";
import { apiRateLimiter } from "./middlewares/rate-limit.middleware";
import { routes } from "./routes";

import {
  corsConfig,
  helmetConfig,
} from "./config/security";

import { config } from "./config";

const app: Express = express();

app.set(
  "trust proxy",
  config.trustProxy,
);

app.use(requestIdMiddleware);

app.use(requestLoggerMiddleware);

app.use(helmetConfig);

app.use(cors(corsConfig));

app.use(compression());

app.use(cookieParser());

app.use(hpp());

app.use(
  express.json({
    limit: "10kb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  }),
);

app.use(apiRateLimiter);

app.use(
  config.apiPrefix,
  routes,
);

app.use(notFoundMiddleware);

app.use(globalErrorMiddleware);

export default app;
