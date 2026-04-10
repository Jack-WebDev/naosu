import { initTRPC, TRPCError } from "@trpc/server";

import type { Context } from "./context";

export const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.session) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Authentication required",
			cause: "No session",
		});
	}
	return next({
		ctx: {
			...ctx,
			session: ctx.session,
		},
	});
});

export const workspaceProcedure = protectedProcedure.use(({ ctx, next }) => {
	if (!ctx.organization || !ctx.membership) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Active organization required",
		});
	}

	return next({
		ctx: {
			...ctx,
			organization: ctx.organization,
			membership: ctx.membership,
		},
	});
});
