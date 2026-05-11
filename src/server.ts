import app from "./app";
import { config } from "./config";

app.listen(config.port, () => {
  process.stdout.write(
    `Server running on port ${config.port}\n`,
  );
});