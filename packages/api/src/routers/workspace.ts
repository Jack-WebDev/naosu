import { db } from "@naosu/db";
import {
	organization,
	organizationMember,
	team,
	ticket,
} from "@naosu/db/schema/support";
import { and, count, eq, isNull } from "drizzle-orm";
import z from "zod";

import { protectedProcedure, router, workspaceProcedure } from "../index";
import { createId } from "../lib/ids";
import { slugify } from "../lib/slug";

async function ensureUniqueSlug(baseSlug: string) {
	const initial = baseSlug || "workspace";
	let attempt = initial;
	let iteration = 1;

	while (true) {
		const existing = await db.query.organization.findFirst({
			where(fields, { eq: eqFn }) {
				return eqFn(fields.slug, attempt);
			},
		});

		if (!existing) {
			return attempt;
		}

		iteration += 1;
		attempt = `${initial}-${iteration}`;
	}
}

export const workspaceRouter = router({
	bootstrap: protectedProcedure.query(async ({ ctx }) => {
		if (!ctx.organization || !ctx.membership) {
			return {
				hasOrganization: false,
				activeOrganization: null,
				membership: null,
				organizations: [],
				agents: [],
				teams: [],
				stats: null,
			};
		}

		const activeOrganization = ctx.organization;

		const [agents, teams, openCount, unassignedCount, resolvedCount] =
			await Promise.all([
				db.query.organizationMember.findMany({
					where(fields, { eq: eqFn }) {
						return eqFn(fields.organizationId, activeOrganization.id);
					},
					with: {
						user: true,
					},
				}),
				db.query.team.findMany({
					where(fields, { eq: eqFn }) {
						return eqFn(fields.organizationId, activeOrganization.id);
					},
					orderBy(fields, { asc }) {
						return [asc(fields.name)];
					},
				}),
				db
					.select({ count: count() })
					.from(ticket)
					.where(
						and(
							eq(ticket.organizationId, activeOrganization.id),
							eq(ticket.status, "open"),
						),
					),
				db
					.select({ count: count() })
					.from(ticket)
					.where(
						and(
							eq(ticket.organizationId, activeOrganization.id),
							eq(ticket.status, "open"),
							isNull(ticket.assignedAgentId),
						),
					),
				db
					.select({ count: count() })
					.from(ticket)
					.where(
						and(
							eq(ticket.organizationId, activeOrganization.id),
							eq(ticket.status, "resolved"),
						),
					),
			]);

		return {
			hasOrganization: true,
			activeOrganization,
			membership: ctx.membership,
			organizations: ctx.memberships.map((entry) => ({
				id: entry.organization.id,
				name: entry.organization.name,
				slug: entry.organization.slug,
				role: entry.role,
			})),
			agents: agents.map((entry) => ({
				id: entry.user.id,
				name: entry.user.name,
				email: entry.user.email,
				role: entry.role,
			})),
			teams,
			stats: {
				open: openCount[0]?.count ?? 0,
				unassigned: unassignedCount[0]?.count ?? 0,
				resolved: resolvedCount[0]?.count ?? 0,
			},
		};
	}),

	createOrganization: protectedProcedure
		.input(
			z.object({
				name: z.string().min(2).max(64),
				slug: z.string().min(2).max(48).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const baseSlug = slugify(input.slug ?? input.name);
			const slug = await ensureUniqueSlug(baseSlug);
			const organizationId = createId("org");
			const defaultTeamId = createId("team");

			await db.transaction(async (tx) => {
				await tx.insert(organization).values({
					id: organizationId,
					name: input.name.trim(),
					slug,
					createdById: ctx.session.user.id,
				});

				await tx.insert(organizationMember).values({
					id: createId("org_member"),
					organizationId,
					userId: ctx.session.user.id,
					role: "owner",
				});

				await tx.insert(team).values({
					id: defaultTeamId,
					organizationId,
					name: "Support",
					description: "Default support team",
				});
			});

			const created = await db.query.organization.findFirst({
				where(fields, { eq: eqFn }) {
					return eqFn(fields.id, organizationId);
				},
			});

			return {
				organization: created,
			};
		}),

	searchOrganizations: protectedProcedure
		.input(
			z.object({
				query: z.string().trim().min(1),
			}),
		)
		.query(async ({ input, ctx }) => {
			return await db.query.organizationMember
				.findMany({
					where(fields, { eq: eqFn }) {
						return eqFn(fields.userId, ctx.session.user.id);
					},
					with: {
						organization: {
							columns: {
								id: true,
								name: true,
								slug: true,
							},
						},
					},
				})
				.then((entries) =>
					entries
						.map((entry) => entry.organization)
						.filter((entry) =>
							[entry.name, entry.slug].some((value) =>
								value.toLowerCase().includes(input.query.toLowerCase()),
							),
						),
				);
		}),

	listMembers: workspaceProcedure.query(async ({ ctx }) => {
		return await db.query.organizationMember.findMany({
			where(fields, { eq: eqFn }) {
				return eqFn(fields.organizationId, ctx.organization.id);
			},
			with: {
				user: {
					columns: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});
	}),
});
