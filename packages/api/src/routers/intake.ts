import { db } from "@naosu/db";
import z from "zod";

import { publicProcedure, router } from "../index";
import { createTicketFromIntake } from "../services/ticket-intake";

const intakeInput = z.object({
	workspaceSlug: z.string().min(2).max(48),
	requesterName: z.string().min(2).max(64),
	requesterEmail: z.email(),
	subject: z.string().min(3).max(120),
	description: z.string().min(10).max(5000),
	priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
});

export const intakeRouter = router({
	createPortalTicket: publicProcedure
		.input(intakeInput)
		.mutation(async ({ input }) => {
			const workspace = await db.query.organization.findFirst({
				where(fields, { eq: eqFn }) {
					return eqFn(fields.slug, input.workspaceSlug);
				},
			});

			if (!workspace) {
				throw new Error("Workspace not found");
			}

			return await db.transaction(async (tx) => {
				const result = await createTicketFromIntake(tx, {
					organizationId: workspace.id,
					requesterName: input.requesterName,
					requesterEmail: input.requesterEmail,
					subject: input.subject,
					description: input.description,
					priority: input.priority,
					source: "web_form",
				});

				return {
					ticketId: result.ticketId,
				};
			});
		}),

	ingestEmail: publicProcedure
		.input(
			z.object({
				workspaceSlug: z.string().min(2).max(48),
				fromName: z.string().min(2).max(64),
				fromEmail: z.email(),
				subject: z.string().min(3).max(120),
				body: z.string().min(1).max(5000),
				threadId: z.string().max(255).optional(),
				messageId: z.string().max(255).optional(),
			}),
		)
		.mutation(async ({ input }) => {
			const workspace = await db.query.organization.findFirst({
				where(fields, { eq: eqFn }) {
					return eqFn(fields.slug, input.workspaceSlug);
				},
			});

			if (!workspace) {
				throw new Error("Workspace not found");
			}

			return await db.transaction(async (tx) => {
				const result = await createTicketFromIntake(tx, {
					organizationId: workspace.id,
					requesterName: input.fromName,
					requesterEmail: input.fromEmail,
					subject: input.subject,
					description: input.body,
					source: "email",
					externalThreadId: input.threadId,
					externalMessageId: input.messageId,
				});

				return {
					ticketId: result.ticketId,
				};
			});
		}),
});
