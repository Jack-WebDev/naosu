import Fastify, { type FastifyInstance } from "fastify";
import { registerPlugins } from "./plugins";
import { registerRoutes } from "./routes";

export async function buildServer(): Promise<FastifyInstance> {
	const app = Fastify({
		logger: {
			level: process.env.LOG_LEVEL ?? "info",
			// Pino pretty-print in dev, structured JSON in prod
			transport:
				process.env.NODE_ENV === "development"
					? { target: "pino-pretty" }
					: undefined,
		},
	});

	await registerPlugins(app);
	await registerRoutes(app);
	registerShutdownHandlers(app);

	return app;
}

function registerShutdownHandlers(app: FastifyInstance) {
	const shutdown = async (signal: string) => {
		app.log.info({ signal }, "Shutdown signal received");
		try {
			await app.close();
			app.log.info("Server closed gracefully");
			process.exit(0);
		} catch (err) {
			app.log.error({ err }, "Error during shutdown");
			process.exit(1);
		}
	};

	process.once("SIGINT", () => shutdown("SIGINT"));
	process.once("SIGTERM", () => shutdown("SIGTERM"));
}
