import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	jsonb,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

export const organizationRoleValues = ["owner", "admin", "agent"] as const;
export const ticketStatusValues = [
	"open",
	"pending",
	"resolved",
	"closed",
] as const;
export const ticketPriorityValues = [
	"low",
	"medium",
	"high",
	"urgent",
] as const;
export const ticketSourceValues = ["web_form", "email", "agent"] as const;
export const ticketMessageTypeValues = [
	"customer_reply",
	"agent_reply",
	"internal_note",
	"system_event",
] as const;
export const ticketActivityTypeValues = [
	"ticket_created",
	"status_changed",
	"priority_changed",
	"assignment_changed",
	"team_changed",
	"tag_added",
	"tag_removed",
	"message_added",
] as const;

export type OrganizationRole = (typeof organizationRoleValues)[number];
export type TicketStatus = (typeof ticketStatusValues)[number];
export type TicketPriority = (typeof ticketPriorityValues)[number];
export type TicketSource = (typeof ticketSourceValues)[number];
export type TicketMessageType = (typeof ticketMessageTypeValues)[number];
export type TicketActivityType = (typeof ticketActivityTypeValues)[number];

export const organizationRoleEnum = pgEnum(
	"organization_role",
	organizationRoleValues,
);
export const ticketStatusEnum = pgEnum("ticket_status", ticketStatusValues);
export const ticketPriorityEnum = pgEnum(
	"ticket_priority",
	ticketPriorityValues,
);
export const ticketSourceEnum = pgEnum("ticket_source", ticketSourceValues);
export const ticketMessageTypeEnum = pgEnum(
	"ticket_message_type",
	ticketMessageTypeValues,
);
export const ticketActivityTypeEnum = pgEnum(
	"ticket_activity_type",
	ticketActivityTypeValues,
);

export const organization = pgTable(
	"organization",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		slug: text("slug").notNull(),
		createdById: text("created_by_id")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),
		createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex("organization_slug_idx").on(table.slug),
		index("organization_created_by_id_idx").on(table.createdById),
	],
);

export const organizationMember = pgTable(
	"organization_member",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		role: organizationRoleEnum("role").default("agent").notNull(),
		createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("organization_member_organization_id_idx").on(table.organizationId),
		index("organization_member_user_id_idx").on(table.userId),
		uniqueIndex("organization_member_org_user_idx").on(
			table.organizationId,
			table.userId,
		),
	],
);

export const team = pgTable(
	"team",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		description: text("description"),
		createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("team_organization_id_idx").on(table.organizationId),
		uniqueIndex("team_org_name_idx").on(table.organizationId, table.name),
	],
);

export const teamMember = pgTable(
	"team_member",
	{
		teamId: text("team_id")
			.notNull()
			.references(() => team.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.teamId, table.userId] }),
		index("team_member_user_id_idx").on(table.userId),
	],
);

export const contact = pgTable(
	"contact",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		email: text("email").notNull(),
		createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("contact_organization_id_idx").on(table.organizationId),
		uniqueIndex("contact_org_email_idx").on(table.organizationId, table.email),
	],
);

export const ticket = pgTable(
	"ticket",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		requesterId: text("requester_id")
			.notNull()
			.references(() => contact.id, { onDelete: "restrict" }),
		subject: text("subject").notNull(),
		description: text("description").notNull(),
		status: ticketStatusEnum("status").default("open").notNull(),
		priority: ticketPriorityEnum("priority").default("medium").notNull(),
		source: ticketSourceEnum("source").default("agent").notNull(),
		assignedAgentId: text("assigned_agent_id").references(() => user.id, {
			onDelete: "set null",
		}),
		assignedTeamId: text("assigned_team_id").references(() => team.id, {
			onDelete: "set null",
		}),
		createdById: text("created_by_id").references(() => user.id, {
			onDelete: "set null",
		}),
		externalThreadId: text("external_thread_id"),
		externalMessageId: text("external_message_id"),
		createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
		resolvedAt: timestamp("resolved_at", { mode: "date", withTimezone: true }),
		closedAt: timestamp("closed_at", { mode: "date", withTimezone: true }),
	},
	(table) => [
		index("ticket_organization_id_idx").on(table.organizationId),
		index("ticket_requester_id_idx").on(table.requesterId),
		index("ticket_assigned_agent_id_idx").on(table.assignedAgentId),
		index("ticket_assigned_team_id_idx").on(table.assignedTeamId),
		index("ticket_status_idx").on(table.status),
		index("ticket_priority_idx").on(table.priority),
		index("ticket_source_idx").on(table.source),
	],
);

export const ticketMessage = pgTable(
	"ticket_message",
	{
		id: text("id").primaryKey(),
		ticketId: text("ticket_id")
			.notNull()
			.references(() => ticket.id, { onDelete: "cascade" }),
		messageType: ticketMessageTypeEnum("message_type").notNull(),
		body: text("body").notNull(),
		authorUserId: text("author_user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		authorContactId: text("author_contact_id").references(() => contact.id, {
			onDelete: "set null",
		}),
		externalMessageId: text("external_message_id"),
		externalThreadId: text("external_thread_id"),
		isFromEmail: boolean("is_from_email").default(false).notNull(),
		createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("ticket_message_ticket_id_idx").on(table.ticketId),
		index("ticket_message_type_idx").on(table.messageType),
	],
);

export const ticketActivity = pgTable(
	"ticket_activity",
	{
		id: text("id").primaryKey(),
		ticketId: text("ticket_id")
			.notNull()
			.references(() => ticket.id, { onDelete: "cascade" }),
		type: ticketActivityTypeEnum("type").notNull(),
		actorUserId: text("actor_user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		body: text("body").notNull(),
		metadata: jsonb("metadata").$type<Record<string, string | null>>(),
		createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [index("ticket_activity_ticket_id_idx").on(table.ticketId)],
);

export const tag = pgTable(
	"tag",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		color: text("color"),
		createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("tag_organization_id_idx").on(table.organizationId),
		uniqueIndex("tag_org_name_idx").on(table.organizationId, table.name),
	],
);

export const ticketTag = pgTable(
	"ticket_tag",
	{
		ticketId: text("ticket_id")
			.notNull()
			.references(() => ticket.id, { onDelete: "cascade" }),
		tagId: text("tag_id")
			.notNull()
			.references(() => tag.id, { onDelete: "cascade" }),
	},
	(table) => [primaryKey({ columns: [table.ticketId, table.tagId] })],
);

export const organizationRelations = relations(
	organization,
	({ one, many }) => ({
		createdBy: one(user, {
			fields: [organization.createdById],
			references: [user.id],
		}),
		members: many(organizationMember),
		teams: many(team),
		contacts: many(contact),
		tickets: many(ticket),
		tags: many(tag),
	}),
);

export const organizationMemberRelations = relations(
	organizationMember,
	({ one }) => ({
		organization: one(organization, {
			fields: [organizationMember.organizationId],
			references: [organization.id],
		}),
		user: one(user, {
			fields: [organizationMember.userId],
			references: [user.id],
		}),
	}),
);

export const teamRelations = relations(team, ({ one, many }) => ({
	organization: one(organization, {
		fields: [team.organizationId],
		references: [organization.id],
	}),
	members: many(teamMember),
	tickets: many(ticket),
}));

export const teamMemberRelations = relations(teamMember, ({ one }) => ({
	team: one(team, {
		fields: [teamMember.teamId],
		references: [team.id],
	}),
	user: one(user, {
		fields: [teamMember.userId],
		references: [user.id],
	}),
}));

export const contactRelations = relations(contact, ({ one, many }) => ({
	organization: one(organization, {
		fields: [contact.organizationId],
		references: [organization.id],
	}),
	tickets: many(ticket),
	messages: many(ticketMessage),
}));

export const ticketRelations = relations(ticket, ({ one, many }) => ({
	organization: one(organization, {
		fields: [ticket.organizationId],
		references: [organization.id],
	}),
	requester: one(contact, {
		fields: [ticket.requesterId],
		references: [contact.id],
	}),
	assignedAgent: one(user, {
		fields: [ticket.assignedAgentId],
		references: [user.id],
		relationName: "assigned_agent",
	}),
	assignedTeam: one(team, {
		fields: [ticket.assignedTeamId],
		references: [team.id],
	}),
	createdBy: one(user, {
		fields: [ticket.createdById],
		references: [user.id],
		relationName: "ticket_created_by",
	}),
	messages: many(ticketMessage),
	activities: many(ticketActivity),
	tags: many(ticketTag),
}));

export const ticketMessageRelations = relations(ticketMessage, ({ one }) => ({
	ticket: one(ticket, {
		fields: [ticketMessage.ticketId],
		references: [ticket.id],
	}),
	authorUser: one(user, {
		fields: [ticketMessage.authorUserId],
		references: [user.id],
		relationName: "ticket_message_author_user",
	}),
	authorContact: one(contact, {
		fields: [ticketMessage.authorContactId],
		references: [contact.id],
	}),
}));

export const ticketActivityRelations = relations(ticketActivity, ({ one }) => ({
	ticket: one(ticket, {
		fields: [ticketActivity.ticketId],
		references: [ticket.id],
	}),
	actorUser: one(user, {
		fields: [ticketActivity.actorUserId],
		references: [user.id],
		relationName: "ticket_activity_actor_user",
	}),
}));

export const tagRelations = relations(tag, ({ one, many }) => ({
	organization: one(organization, {
		fields: [tag.organizationId],
		references: [organization.id],
	}),
	tickets: many(ticketTag),
}));

export const ticketTagRelations = relations(ticketTag, ({ one }) => ({
	ticket: one(ticket, {
		fields: [ticketTag.ticketId],
		references: [ticket.id],
	}),
	tag: one(tag, {
		fields: [ticketTag.tagId],
		references: [tag.id],
	}),
}));
