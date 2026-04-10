import { protectedProcedure, publicProcedure, router } from "../index";
import { intakeRouter } from "./intake";
import { ticketRouter } from "./ticket";
import { workspaceRouter } from "./workspace";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	viewer: protectedProcedure.query(({ ctx }) => {
		return {
			user: ctx.session.user,
			organization: ctx.organization,
			membership: ctx.membership,
		};
	}),
	workspace: workspaceRouter,
	ticket: ticketRouter,
	intake: intakeRouter,
});
export type AppRouter = typeof appRouter;
