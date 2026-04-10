import type { db } from "@naosu/db";
import {
	contact,
	type TicketPriority,
	type TicketSource,
	type TicketStatus,
	tag,
	ticket,
	ticketActivity,
	ticketMessage,
	ticketTag,
} from "@naosu/db/schema/support";
import { and, eq, inArray } from "drizzle-orm";

import { createId } from "../lib/ids";

interface TicketIntakeInput {
	organizationId: string;
	requesterName: string;
	requesterEmail: string;
	subject: string;
	description: string;
	priority?: TicketPriority;
	source: TicketSource;
	createdById?: string | null;
	assignedAgentId?: string | null;
	assignedTeamId?: string | null;
	tagNames?: string[];
	externalThreadId?: string | null;
	externalMessageId?: string | null;
	initialStatus?: TicketStatus;
}

interface DatabaseLike {
	insert: typeof db.insert;
	select: typeof db.select;
	update: typeof db.update;
	delete: typeof db.delete;
	query: typeof db.query;
}

async function upsertContact(
	tx: DatabaseLike,
	organizationId: string,
	name: string,
	email: string,
) {
	const normalizedEmail = email.trim().toLowerCase();
	const existing = await tx.query.contact.findFirst({
		where(fields, { and: andFn, eq: eqFn }) {
			return andFn(
				eqFn(fields.organizationId, organizationId),
				eqFn(fields.email, normalizedEmail),
			);
		},
	});

	if (existing) {
		if (existing.name !== name.trim()) {
			await tx
				.update(contact)
				.set({ name: name.trim() })
				.where(eq(contact.id, existing.id));
		}
		return existing;
	}

	const contactId = createId("contact");
	await tx.insert(contact).values({
		id: contactId,
		organizationId,
		name: name.trim(),
		email: normalizedEmail,
	});

	return {
		id: contactId,
		organizationId,
		name: name.trim(),
		email: normalizedEmail,
	};
}

async function attachTags(
	tx: DatabaseLike,
	organizationId: string,
	ticketId: string,
	tagNames: string[] | undefined,
) {
	const uniqueNames = [...new Set((tagNames ?? []).map((name) => name.trim()))]
		.filter(Boolean)
		.slice(0, 6);

	if (uniqueNames.length === 0) {
		return [];
	}

	const existingTags = await tx.query.tag.findMany({
		where(fields, { and: andFn, eq: eqFn, inArray: inArrayFn }) {
			return andFn(
				eqFn(fields.organizationId, organizationId),
				inArrayFn(fields.name, uniqueNames),
			);
		},
	});

	const existingByName = new Map(
		existingTags.map((entry) => [entry.name, entry]),
	);
	const createdTags = [];

	for (const name of uniqueNames) {
		const found = existingByName.get(name);
		if (found) {
			createdTags.push(found);
			continue;
		}

		const tagId = createId("tag");
		const created = {
			id: tagId,
			organizationId,
			name,
			color: null,
		};
		await tx.insert(tag).values(created);
		createdTags.push(created);
	}

	const ids = createdTags.map((entry) => entry.id);
	const existingLinks =
		ids.length > 0
			? await tx
					.select()
					.from(ticketTag)
					.where(
						and(
							inArray(ticketTag.tagId, ids),
							eq(ticketTag.ticketId, ticketId),
						),
					)
			: [];

	const existingLinkIds = new Set(existingLinks.map((entry) => entry.tagId));
	const values = createdTags
		.filter((entry) => !existingLinkIds.has(entry.id))
		.map((entry) => ({
			ticketId,
			tagId: entry.id,
		}));

	if (values.length > 0) {
		await tx.insert(ticketTag).values(values);
	}

	return createdTags;
}

export async function createTicketFromIntake(
	tx: DatabaseLike,
	input: TicketIntakeInput,
) {
	const requester = await upsertContact(
		tx,
		input.organizationId,
		input.requesterName,
		input.requesterEmail,
	);

	const ticketId = createId("ticket");

	await tx.insert(ticket).values({
		id: ticketId,
		organizationId: input.organizationId,
		requesterId: requester.id,
		subject: input.subject.trim(),
		description: input.description.trim(),
		status: input.initialStatus ?? "open",
		priority: input.priority ?? "medium",
		source: input.source,
		assignedAgentId: input.assignedAgentId ?? null,
		assignedTeamId: input.assignedTeamId ?? null,
		createdById: input.createdById ?? null,
		externalThreadId: input.externalThreadId ?? null,
		externalMessageId: input.externalMessageId ?? null,
	});

	await tx.insert(ticketMessage).values({
		id: createId("message"),
		ticketId,
		messageType: "customer_reply",
		body: input.description.trim(),
		authorContactId: requester.id,
		externalThreadId: input.externalThreadId ?? null,
		externalMessageId: input.externalMessageId ?? null,
		isFromEmail: input.source === "email",
	});

	await tx.insert(ticketActivity).values({
		id: createId("activity"),
		ticketId,
		type: "ticket_created",
		actorUserId: input.createdById ?? null,
		body:
			input.source === "email"
				? "Ticket created from email intake"
				: "Ticket created from ticket intake",
		metadata: {
			source: input.source,
			requesterEmail: requester.email,
		},
	});

	const tags = await attachTags(
		tx,
		input.organizationId,
		ticketId,
		input.tagNames,
	);

	return {
		ticketId,
		requester,
		tags,
	};
}
