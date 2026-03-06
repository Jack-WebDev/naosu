import { auth } from "@naosu/auth";
import type { FastifyInstance } from "fastify";

export async function authRoutes(app: FastifyInstance) {
	app.route({
		method: ["GET", "POST"],
		url: "/*",
		async handler(request, reply) {
			// Safely build the full URL - request.url is always relative,
			// so we need the host header to reconstruct it.
			const host = request.headers.host;
			if (!host) {
				return reply.status(400).send({ error: "Missing host header" });
			}

			const protocol = request.headers["x-forwarded-proto"] ?? "http";
			const url = new URL(request.url, `${protocol}://${host}`);

			const headers = new Headers();
			for (const [key, value] of Object.entries(request.headers)) {
				// value can be string | string[] | undefined
				if (Array.isArray(value)) {
					value.forEach((v) => {
						headers.append(key, v);
					});
				} else if (value !== undefined) {
					headers.set(key, value);
				}
			}

			// Only attach a body for methods that support it
			const hasBody = request.method !== "GET" && request.method !== "HEAD";

			const req = new Request(url.toString(), {
				method: request.method,
				headers,
				body: hasBody && request.body ? JSON.stringify(request.body) : null,
			});

			let response: Response;
			try {
				response = await auth.handler(req);
			} catch (err) {
				app.log.error({ err, url: url.toString() }, "Auth handler threw");
				return reply.status(500).send({
					error: "Internal authentication error",
					code: "AUTH_FAILURE",
				});
			}

			reply.status(response.status);
			response.headers.forEach((value, key) => {
				reply.header(key, value);
			});
			// Avoid reading the body if there's nothing there
			const body = response.body ? await response.text() : null;
			return reply.send(body);
		},
	});
}
