import { db } from "@naosu/db";
import { user } from "@naosu/db/schema/auth";
import {
	contact,
	tag,
	ticket,
	ticketActivity,
	ticketMessage,
	ticketPriorityValues,
	ticketStatusValues,
	ticketTag,
} from "@naosu/db/schema/support";
import { and, desc, eq, ilike, inArray, isNull, or } from "drizzle-orm";
import z from "zod";

import { router, workspaceProcedure } from "../index";
import { createId } from "../lib/ids";
import { emailDeliveryAdapter } from "../services/email";
import { createTicketFromIntake } from "../services/ticket-intake";

const ticketListInput = z.object({
	status: z.enum(ticketStatusValues).optional(),
	priority: z.enum(ticketPriorityValues).optional(),
	assignee: z.string().optional(),
	team: z.string().optional(),
	tag: z.string().optional(),
	search: z.string().trim().optional(),
	limit: z.number().min(1).max(50).default(20),
});

function buildTicketListWhere(
	organizationId: string,
	input: z.infer<typeof ticketListInput>,
) {
	const clauses = [eq(ticket.organizationId, organizationId)];

	if (input.status) {
		clauses.push(eq(ticket.status, input.status));
	}

	if (input.priority) {
		clauses.push(eq(ticket.priority, input.priority));
	}

	if (input.assignee === "unassigned") {
		clauses.push(isNull(ticket.assignedAgentId));
	} else if (input.assignee) {
		clauses.push(eq(ticket.assignedAgentId, input.assignee));
	}

	if (input.team) {
		clauses.push(eq(ticket.assignedTeamId, input.team));
	}

	if (input.search) {
		const value = `%${input.search}%`;
		const searchClause = or(
			ilike(ticket.subject, value),
			ilike(ticket.description, value),
			ilike(contact.name, value),
			ilike(contact.email, value),
		);
		if (searchClause) {
			clauses.push(searchClause);
		}
	}

	return and(...clauses);
}

export const ticketRouter = router({
	list: workspaceProcedure
		.input(ticketListInput)
		.query(async ({ ctx, input }) => {
			const baseWhere = buildTicketListWhere(ctx.organization.id, input);
			const rows = await db
				.select({
					id: ticket.id,
					subject: ticket.subject,
					description: ticket.description,
					status: ticket.status,
					priority: ticket.priority,
					source: ticket.source,
					assignedAgentId: ticket.assignedAgentId,
					assignedTeamId: ticket.assignedTeamId,
					createdAt: ticket.createdAt,
					updatedAt: ticket.updatedAt,
					requesterId: contact.id,
					requesterName: contact.name,
					requesterEmail: contact.email,
				})
				.from(ticket)
				.innerJoin(contact, eq(ticket.requesterId, contact.id))
				.where(baseWhere)
				.orderBy(desc(ticket.updatedAt))
				.limit(input.limit);

			const filteredRows =
				input.tag && rows.length > 0
					? await db
							.select({
								ticketId: ticketTag.ticketId,
							})
							.from(ticketTag)
							.innerJoin(tag, eq(ticketTag.tagId, tag.id))
							.where(
								and(
									inArray(
										ticketTag.ticketId,
										rows.map((entry) => entry.id),
									),
									eq(tag.name, input.tag),
								),
							)
					: [];

			const allowedTagIds =
				input.tag && filteredRows.length > 0
					? new Set(filteredRows.map((entry) => entry.ticketId))
					: null;
			const ticketIds = rows
				.filter((entry) => (allowedTagIds ? allowedTagIds.has(entry.id) : true))
				.map((entry) => entry.id);

			const ticketTags =
				ticketIds.length > 0
					? await db
							.select({
								ticketId: ticketTag.ticketId,
								tagId: tag.id,
								tagName: tag.name,
								tagColor: tag.color,
							})
							.from(ticketTag)
							.innerJoin(tag, eq(ticketTag.tagId, tag.id))
							.where(inArray(ticketTag.ticketId, ticketIds))
					: [];

			const tagsByTicket = new Map<
				string,
				{ id: string; name: string; color: string | null }[]
			>();
			for (const entry of ticketTags) {
				const collection = tagsByTicket.get(entry.ticketId) ?? [];
				collection.push({
					id: entry.tagId,
					name: entry.tagName,
					color: entry.tagColor,
				});
				tagsByTicket.set(entry.ticketId, collection);
			}

			return rows
				.filter((entry) => (allowedTagIds ? allowedTagIds.has(entry.id) : true))
				.map((entry) => ({
					...entry,
					tags: tagsByTicket.get(entry.id) ?? [],
				}));
		}),

	getById: workspaceProcedure
		.input(z.object({ ticketId: z.string() }))
		.query(async ({ ctx, input }) => {
			const selected = await db.query.ticket.findFirst({
				where(fields, { and: andFn, eq: eqFn }) {
					return andFn(
						eqFn(fields.id, input.ticketId),
						eqFn(fields.organizationId, ctx.organization.id),
					);
				},
				with: {
					requester: true,
					assignedTeam: true,
				},
			});

			if (!selected) {
				throw new Error("Ticket not found");
			}

			const [messages, activities, tags] = await Promise.all([
				db.query.ticketMessage.findMany({
					where(fields, { eq: eqFn }) {
						return eqFn(fields.ticketId, selected.id);
					},
					with: {
						authorContact: true,
					},
					orderBy(fields, { asc }) {
						return [asc(fields.createdAt)];
					},
				}),
				db.query.ticketActivity.findMany({
					where(fields, { eq: eqFn }) {
						return eqFn(fields.ticketId, selected.id);
					},
					orderBy(fields, { desc: descFn }) {
						return [descFn(fields.createdAt)];
					},
				}),
				db
					.select({
						tagId: tag.id,
						name: tag.name,
						color: tag.color,
					})
					.from(ticketTag)
					.innerJoin(tag, eq(ticketTag.tagId, tag.id))
					.where(eq(ticketTag.ticketId, selected.id)),
			]);

			const userIds = [
				selected.assignedAgentId,
				selected.createdById,
				...messages.map((entry) => entry.authorUserId),
				...activities.map((entry) => entry.actorUserId),
			].filter((value): value is string => Boolean(value));

			const users =
				userIds.length > 0
					? await db
							.select({
								id: user.id,
								name: user.name,
								email: user.email,
							})
							.from(user)
							.where(inArray(user.id, [...new Set(userIds)]))
					: [];

			const usersById = new Map(users.map((entry) => [entry.id, entry]));

			return {
				...selected,
				tags,
				assignedAgent: selected.assignedAgentId
					? (usersById.get(selected.assignedAgentId) ?? null)
					: null,
				createdBy: selected.createdById
					? (usersById.get(selected.createdById) ?? null)
					: null,
				messages: messages.map((entry) => ({
					...entry,
					authorUser: entry.authorUserId
						? (usersById.get(entry.authorUserId) ?? null)
						: null,
				})),
				activities: activities.map((entry) => ({
					...entry,
					actorUser: entry.actorUserId
						? (usersById.get(entry.actorUserId) ?? null)
						: null,
				})),
			};
		}),

	create: workspaceProcedure
		.input(
			z.object({
				requesterName: z.string().min(2).max(64),
				requesterEmail: z.email(),
				subject: z.string().min(3).max(120),
				description: z.string().min(10).max(5000),
				priority: z.enum(ticketPriorityValues).default("medium"),
				assignedAgentId: z.string().optional(),
				assignedTeamId: z.string().optional(),
				tagNames: z.array(z.string().min(1).max(24)).default([]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return await db.transaction(async (tx) => {
				const result = await createTicketFromIntake(tx, {
					organizationId: ctx.organization.id,
					requesterName: input.requesterName,
					requesterEmail: input.requesterEmail,
					subject: input.subject,
					description: input.description,
					priority: input.priority,
					source: "agent",
					createdById: ctx.session.user.id,
					assignedAgentId: input.assignedAgentId,
					assignedTeamId: input.assignedTeamId,
					tagNames: input.tagNames,
				});

				return {
					ticketId: result.ticketId,
				};
			});
		}),

	update: workspaceProcedure
		.input(
			z.object({
				ticketId: z.string(),
				status: z.enum(ticketStatusValues).optional(),
				priority: z.enum(ticketPriorityValues).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const existing = await db.query.ticket.findFirst({
				where(fields, { and: andFn, eq: eqFn }) {
					return andFn(
						eqFn(fields.id, input.ticketId),
						eqFn(fields.organizationId, ctx.organization.id),
					);
				},
			});

			if (!existing) {
				throw new Error("Ticket not found");
			}

			const nextStatus = input.status ?? existing.status;
			const updateValues = {
				status: nextStatus,
				priority: input.priority ?? existing.priority,
				resolvedAt:
					nextStatus === "resolved" && existing.status !== "resolved"
						? new Date()
						: nextStatus !== "resolved"
							? null
							: existing.resolvedAt,
				closedAt:
					nextStatus === "closed" && existing.status !== "closed"
						? new Date()
						: nextStatus !== "closed"
							? null
							: existing.closedAt,
			};

			await db
				.update(ticket)
				.set(updateValues)
				.where(eq(ticket.id, existing.id));

			if (input.status && input.status !== existing.status) {
				await db.insert(ticketActivity).values({
					id: createId("activity"),
					ticketId: existing.id,
					type: "status_changed",
					actorUserId: ctx.session.user.id,
					body: `Status changed from ${existing.status} to ${input.status}`,
					metadata: {
						from: existing.status,
						to: input.status,
					},
				});
			}

			if (input.priority && input.priority !== existing.priority) {
				await db.insert(ticketActivity).values({
					id: createId("activity"),
					ticketId: existing.id,
					type: "priority_changed",
					actorUserId: ctx.session.user.id,
					body: `Priority changed from ${existing.priority} to ${input.priority}`,
					metadata: {
						from: existing.priority,
						to: input.priority,
					},
				});
			}

			return {
				ok: true,
			};
		}),

	assign: workspaceProcedure
		.input(
			z.object({
				ticketId: z.string(),
				assignedAgentId: z.string().nullable().optional(),
				assignedTeamId: z.string().nullable().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const existing = await db.query.ticket.findFirst({
				where(fields, { and: andFn, eq: eqFn }) {
					return andFn(
						eqFn(fields.id, input.ticketId),
						eqFn(fields.organizationId, ctx.organization.id),
					);
				},
			});

			if (!existing) {
				throw new Error("Ticket not found");
			}

			await db
				.update(ticket)
				.set({
					assignedAgentId:
						input.assignedAgentId === undefined
							? existing.assignedAgentId
							: input.assignedAgentId,
					assignedTeamId:
						input.assignedTeamId === undefined
							? existing.assignedTeamId
							: input.assignedTeamId,
				})
				.where(eq(ticket.id, existing.id));

			await db.insert(ticketActivity).values({
				id: createId("activity"),
				ticketId: existing.id,
				type: "assignment_changed",
				actorUserId: ctx.session.user.id,
				body: "Ticket assignment updated",
				metadata: {
					assignedAgentId: input.assignedAgentId ?? existing.assignedAgentId,
					assignedTeamId: input.assignedTeamId ?? existing.assignedTeamId,
				},
			});

			return {
				ok: true,
			};
		}),

	addMessage: workspaceProcedure
		.input(
			z.object({
				ticketId: z.string(),
				body: z.string().min(1).max(5000),
				messageType: z.enum(["agent_reply", "internal_note"]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const selected = await db.query.ticket.findFirst({
				where(fields, { and: andFn, eq: eqFn }) {
					return andFn(
						eqFn(fields.id, input.ticketId),
						eqFn(fields.organizationId, ctx.organization.id),
					);
				},
				with: {
					requester: true,
				},
			});

			if (!selected) {
				throw new Error("Ticket not found");
			}

			if (
				selected.status === "closed" &&
				input.messageType === "internal_note"
			) {
				throw new Error("Closed tickets must be reopened before adding notes");
			}

			let externalMessageId: string | null = null;
			if (input.messageType === "agent_reply" && selected.source === "email") {
				const delivery = await emailDeliveryAdapter.sendReply({
					to: selected.requester.email,
					subject: `Re: ${selected.subject}`,
					body: input.body,
					threadId: selected.externalThreadId,
					messageId: selected.externalMessageId,
				});
				externalMessageId = delivery.externalMessageId ?? null;
			}

			await db.insert(ticketMessage).values({
				id: createId("message"),
				ticketId: selected.id,
				messageType: input.messageType,
				body: input.body.trim(),
				authorUserId: ctx.session.user.id,
				externalThreadId: selected.externalThreadId,
				externalMessageId,
				isFromEmail:
					input.messageType === "agent_reply" && selected.source === "email",
			});

			await db.insert(ticketActivity).values({
				id: createId("activity"),
				ticketId: selected.id,
				type: "message_added",
				actorUserId: ctx.session.user.id,
				body:
					input.messageType === "internal_note"
						? "Internal note added"
						: "Agent reply sent",
				metadata: {
					messageType: input.messageType,
				},
			});

			if (selected.status === "resolved") {
				await db
					.update(ticket)
					.set({
						status: "open",
						resolvedAt: null,
						closedAt: null,
					})
					.where(eq(ticket.id, selected.id));
			}

			return {
				ok: true,
			};
		}),

	listActivities: workspaceProcedure
		.input(z.object({ ticketId: z.string() }))
		.query(async ({ ctx, input }) => {
			const selected = await db.query.ticket.findFirst({
				where(fields, { and: andFn, eq: eqFn }) {
					return andFn(
						eqFn(fields.id, input.ticketId),
						eqFn(fields.organizationId, ctx.organization.id),
					);
				},
			});

			if (!selected) {
				throw new Error("Ticket not found");
			}

			return await db.query.ticketActivity.findMany({
				where(fields, { eq: eqFn }) {
					return eqFn(fields.ticketId, input.ticketId);
				},
				orderBy(fields, { desc: descFn }) {
					return [descFn(fields.createdAt)];
				},
			});
		}),
});
