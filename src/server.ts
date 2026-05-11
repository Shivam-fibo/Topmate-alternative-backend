import app from "./app";
import { startHttpServer } from "./bootstrap/http-server";
import { registerProcessHandlers } from "./bootstrap/process-handlers";

const server = startHttpServer(app);

registerProcessHandlers(server);
