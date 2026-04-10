CREATE TYPE "public"."organization_role" AS ENUM('owner', 'admin', 'agent');--> statement-breakpoint
CREATE TYPE "public"."ticket_activity_type" AS ENUM('ticket_created', 'status_changed', 'priority_changed', 'assignment_changed', 'team_changed', 'tag_added', 'tag_removed', 'message_added');--> statement-breakpoint
CREATE TYPE "public"."ticket_message_type" AS ENUM('customer_reply', 'agent_reply', 'internal_note', 'system_event');--> statement-breakpoint
CREATE TYPE "public"."ticket_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."ticket_source" AS ENUM('web_form', 'email', 'agent');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('open', 'pending', 'resolved', 'closed');--> statement-breakpoint
CREATE TABLE "contact" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_by_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_member" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "organization_role" DEFAULT 'agent' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tag" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"color" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_member" (
	"team_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team_member_team_id_user_id_pk" PRIMARY KEY("team_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "ticket" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"requester_id" text NOT NULL,
	"subject" text NOT NULL,
	"description" text NOT NULL,
	"status" "ticket_status" DEFAULT 'open' NOT NULL,
	"priority" "ticket_priority" DEFAULT 'medium' NOT NULL,
	"source" "ticket_source" DEFAULT 'agent' NOT NULL,
	"assigned_agent_id" text,
	"assigned_team_id" text,
	"created_by_id" text,
	"external_thread_id" text,
	"external_message_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	"closed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ticket_activity" (
	"id" text PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"type" "ticket_activity_type" NOT NULL,
	"actor_user_id" text,
	"body" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_message" (
	"id" text PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"message_type" "ticket_message_type" NOT NULL,
	"body" text NOT NULL,
	"author_user_id" text,
	"author_contact_id" text,
	"external_message_id" text,
	"external_thread_id" text,
	"is_from_email" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_tag" (
	"ticket_id" text NOT NULL,
	"tag_id" text NOT NULL,
	CONSTRAINT "ticket_tag_ticket_id_tag_id_pk" PRIMARY KEY("ticket_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "contact" ADD CONSTRAINT "contact_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization" ADD CONSTRAINT "organization_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tag" ADD CONSTRAINT "tag_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "team_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_requester_id_contact_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."contact"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_assigned_agent_id_user_id_fk" FOREIGN KEY ("assigned_agent_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_assigned_team_id_team_id_fk" FOREIGN KEY ("assigned_team_id") REFERENCES "public"."team"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_activity" ADD CONSTRAINT "ticket_activity_ticket_id_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."ticket"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_activity" ADD CONSTRAINT "ticket_activity_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_message" ADD CONSTRAINT "ticket_message_ticket_id_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."ticket"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_message" ADD CONSTRAINT "ticket_message_author_user_id_user_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_message" ADD CONSTRAINT "ticket_message_author_contact_id_contact_id_fk" FOREIGN KEY ("author_contact_id") REFERENCES "public"."contact"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_tag" ADD CONSTRAINT "ticket_tag_ticket_id_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."ticket"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_tag" ADD CONSTRAINT "ticket_tag_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contact_organization_id_idx" ON "contact" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "contact_org_email_idx" ON "contact" USING btree ("organization_id","email");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_slug_idx" ON "organization" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "organization_created_by_id_idx" ON "organization" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "organization_member_organization_id_idx" ON "organization_member" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "organization_member_user_id_idx" ON "organization_member" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_member_org_user_idx" ON "organization_member" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "tag_organization_id_idx" ON "tag" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tag_org_name_idx" ON "tag" USING btree ("organization_id","name");--> statement-breakpoint
CREATE INDEX "team_organization_id_idx" ON "team" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "team_org_name_idx" ON "team" USING btree ("organization_id","name");--> statement-breakpoint
CREATE INDEX "team_member_user_id_idx" ON "team_member" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ticket_organization_id_idx" ON "ticket" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "ticket_requester_id_idx" ON "ticket" USING btree ("requester_id");--> statement-breakpoint
CREATE INDEX "ticket_assigned_agent_id_idx" ON "ticket" USING btree ("assigned_agent_id");--> statement-breakpoint
CREATE INDEX "ticket_assigned_team_id_idx" ON "ticket" USING btree ("assigned_team_id");--> statement-breakpoint
CREATE INDEX "ticket_status_idx" ON "ticket" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ticket_priority_idx" ON "ticket" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "ticket_source_idx" ON "ticket" USING btree ("source");--> statement-breakpoint
CREATE INDEX "ticket_activity_ticket_id_idx" ON "ticket_activity" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "ticket_message_ticket_id_idx" ON "ticket_message" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "ticket_message_type_idx" ON "ticket_message" USING btree ("message_type");