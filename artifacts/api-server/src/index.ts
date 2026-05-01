import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

// Load .env from the repo root (one source of truth for all envs).
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
// Fallback: also load any .env in cwd, without overriding values already set.
dotenv.config();

// Dynamic import so dotenv runs before any module reads process.env.
const { default: app } = await import("./app");
const { logger } = await import("./lib/logger");
const { startScheduler } = await import("./lib/scheduler");

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  // Kick off the expiry-reminder sweep. Single-instance only.
  startScheduler();
});
