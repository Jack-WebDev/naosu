import { auth } from "@naosu/auth";
import { db } from "@naosu/db";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { fromNodeHeaders } from "better-auth/node";
import { asc } from "drizzle-orm";

export async function createContext({ req }: CreateFastifyContextOptions) {
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
	});

	if (!session) {
		return {
			session: null,
			organization: null,
			membership: null,
			memberships: [],
		};
	}

	const memberships = await db.query.organizationMember.findMany({
		where(fields, { eq: eqFn }) {
			return eqFn(fields.userId, session.user.id);
		},
		with: {
			organization: true,
		},
		orderBy(fields) {
			return [asc(fields.createdAt)];
		},
	});

	const requestedOrgId = req.headers["x-organization-id"];
	const organizationId =
		typeof requestedOrgId === "string" ? requestedOrgId : undefined;
	const membership =
		memberships.find((entry) => entry.organizationId === organizationId) ??
		memberships[0] ??
		null;

	return {
		session,
		organization: membership?.organization ?? null,
		membership,
		memberships,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
