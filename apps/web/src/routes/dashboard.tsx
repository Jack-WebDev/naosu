import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import {
	Building2,
	LifeBuoy,
	Mail,
	MessageSquare,
	Plus,
	Search,
	Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ModeToggle } from "@/components/mode-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import UserMenu from "@/components/user-menu";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/dashboard")({
	component: DashboardRoute,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) {
			redirect({
				to: "/auth/login",
				throw: true,
			});
		}

		return { session };
	},
});

type QueuePreset = "all" | "unassigned" | "mine" | "open" | "resolved";

function DashboardRoute() {
	const { session } = Route.useRouteContext();
	const [queuePreset, setQueuePreset] = useState<QueuePreset>("all");
	const [search, setSearch] = useState("");
	const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
	const [workspaceName, setWorkspaceName] = useState("");
	const [workspaceSlug, setWorkspaceSlug] = useState("");
	const [requesterName, setRequesterName] = useState("");
	const [requesterEmail, setRequesterEmail] = useState("");
	const [subject, setSubject] = useState("");
	const [description, setDescription] = useState("");
	const [priority, setPriority] = useState("medium");
	const [tagInput, setTagInput] = useState("");
	const [replyBody, setReplyBody] = useState("");
	const [replyMode, setReplyMode] = useState<"agent_reply" | "internal_note">(
		"agent_reply",
	);

	const workspace = useQuery(trpc.workspace.bootstrap.queryOptions());

	const ticketFilters = useMemo(() => {
		switch (queuePreset) {
			case "unassigned":
				return {
					assignee: "unassigned",
					search,
					limit: 20,
				};
			case "mine":
				return {
					assignee: session.data?.user.id,
					search,
					limit: 20,
				};
			case "open":
				return {
					status: "open" as const,
					search,
					limit: 20,
				};
			case "resolved":
				return {
					status: "resolved" as const,
					search,
					limit: 20,
				};
			default:
				return {
					search,
					limit: 20,
				};
		}
	}, [queuePreset, search, session.data?.user.id]);

	const tickets = useQuery({
		...trpc.ticket.list.queryOptions(ticketFilters),
		enabled: workspace.data?.hasOrganization === true,
	});

	const selectedTicket = useQuery({
		...trpc.ticket.getById.queryOptions({
			ticketId: selectedTicketId ?? "",
		}),
		enabled:
			workspace.data?.hasOrganization === true && Boolean(selectedTicketId),
	});

	useEffect(() => {
		if (!selectedTicketId && tickets.data?.length) {
			setSelectedTicketId(tickets.data[0].id);
		}

		if (
			selectedTicketId &&
			tickets.data &&
			!tickets.data.some((ticket) => ticket.id === selectedTicketId)
		) {
			setSelectedTicketId(tickets.data[0]?.id ?? null);
		}
	}, [selectedTicketId, tickets.data]);

	const refreshWorkspace = async () => {
		await workspace.refetch();
		await tickets.refetch();
		if (selectedTicketId) {
			await selectedTicket.refetch();
		}
	};

	const createWorkspace = useMutation(
		trpc.workspace.createOrganization.mutationOptions({
			onSuccess: async () => {
				setWorkspaceName("");
				setWorkspaceSlug("");
				await refreshWorkspace();
			},
		}),
	);

	const createTicket = useMutation(
		trpc.ticket.create.mutationOptions({
			onSuccess: async (result) => {
				setRequesterName("");
				setRequesterEmail("");
				setSubject("");
				setDescription("");
				setTagInput("");
				setSelectedTicketId(result.ticketId);
				await refreshWorkspace();
			},
		}),
	);

	const updateTicket = useMutation(
		trpc.ticket.update.mutationOptions({
			onSuccess: refreshWorkspace,
		}),
	);

	const assignTicket = useMutation(
		trpc.ticket.assign.mutationOptions({
			onSuccess: refreshWorkspace,
		}),
	);

	const addMessage = useMutation(
		trpc.ticket.addMessage.mutationOptions({
			onSuccess: async () => {
				setReplyBody("");
				await refreshWorkspace();
			},
		}),
	);

	if (workspace.isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p className="text-muted-foreground">Loading workspace…</p>
			</div>
		);
	}

	if (!workspace.data?.hasOrganization) {
		return (
			<div className="min-h-screen bg-background px-4 py-8">
				<div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
					<div>
						<p className="font-medium text-muted-foreground text-sm">
							naosu workspace setup
						</p>
						<h1 className="font-semibold text-3xl tracking-tight">
							Create your first support workspace
						</h1>
					</div>
					<div className="flex items-center gap-3">
						<ModeToggle />
						<UserMenu />
					</div>
				</div>

				<div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
					<Card>
						<CardHeader>
							<CardTitle>Turn auth into a real helpdesk</CardTitle>
							<CardDescription>
								Your account is ready. The next step is creating a workspace so
								teams, contacts, tickets, and intake channels have a tenant to
								live in.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-2">
								<Label htmlFor="workspace-name">Workspace name</Label>
								<Input
									id="workspace-name"
									value={workspaceName}
									onChange={(e) => setWorkspaceName(e.target.value)}
									placeholder="Acme Support"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="workspace-slug">Workspace slug</Label>
								<Input
									id="workspace-slug"
									value={workspaceSlug}
									onChange={(e) => setWorkspaceSlug(e.target.value)}
									placeholder="acme-support"
								/>
							</div>
							<Button
								onClick={() =>
									createWorkspace.mutate({
										name: workspaceName,
										slug: workspaceSlug || undefined,
									})
								}
								disabled={
									createWorkspace.isPending || workspaceName.trim().length < 2
								}
							>
								<Building2 className="mr-2 h-4 w-4" />
								Create workspace
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>What this unlocks</CardTitle>
							<CardDescription>
								The first workspace becomes the home for your inbox and public
								intake endpoint.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3 text-muted-foreground text-sm">
							<p>Multi-tenant org membership and role-aware APIs.</p>
							<p>
								Shared ticket inbox for triage, replies, and internal notes.
							</p>
							<p>
								Public form and email ingestion wired into the same pipeline.
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	const activeOrganization = workspace.data.activeOrganization;
	const currentTicket = selectedTicket.data;
	const agents = workspace.data.agents;
	const teams = workspace.data.teams;
	const publicSubmissionUrl = `/submit-ticket?workspace=${activeOrganization?.slug ?? ""}`;

	return (
		<div className="min-h-screen bg-muted/30">
			<div className="border-b bg-background/95 backdrop-blur">
				<div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
					<div>
						<p className="font-medium text-muted-foreground text-sm">
							{activeOrganization?.name}
						</p>
						<h1 className="font-semibold text-2xl tracking-tight">
							Support workspace
						</h1>
					</div>
					<div className="flex items-center gap-3">
						<Badge variant="outline">{workspace.data.membership?.role}</Badge>
						<ModeToggle />
						<UserMenu />
					</div>
				</div>
			</div>

			<div className="mx-auto max-w-7xl px-4 py-6">
				<div className="grid gap-4 md:grid-cols-3">
					<MetricCard
						icon={LifeBuoy}
						label="Open tickets"
						value={workspace.data.stats?.open ?? 0}
						helper="Active queue"
					/>
					<MetricCard
						icon={Users}
						label="Unassigned"
						value={workspace.data.stats?.unassigned ?? 0}
						helper="Needs ownership"
					/>
					<MetricCard
						icon={MessageSquare}
						label="Resolved"
						value={workspace.data.stats?.resolved ?? 0}
						helper="Completed work"
					/>
				</div>

				<div className="mt-6 grid gap-6 xl:grid-cols-[320px_minmax(340px,420px)_minmax(420px,1fr)]">
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>New ticket</CardTitle>
								<CardDescription>
									Create agent-originated tickets to seed and test the workflow.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								<Input
									value={requesterName}
									onChange={(e) => setRequesterName(e.target.value)}
									placeholder="Requester name"
								/>
								<Input
									value={requesterEmail}
									onChange={(e) => setRequesterEmail(e.target.value)}
									placeholder="requester@company.com"
									type="email"
								/>
								<Input
									value={subject}
									onChange={(e) => setSubject(e.target.value)}
									placeholder="Ticket subject"
								/>
								<textarea
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									placeholder="Describe the issue"
									className="min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm"
								/>
								<div className="grid gap-3 sm:grid-cols-2">
									<select
										value={priority}
										onChange={(e) => setPriority(e.target.value)}
										className="h-10 rounded-md border bg-background px-3 text-sm"
									>
										<option value="low">Low</option>
										<option value="medium">Medium</option>
										<option value="high">High</option>
										<option value="urgent">Urgent</option>
									</select>
									<Input
										value={tagInput}
										onChange={(e) => setTagInput(e.target.value)}
										placeholder="Tags: billing, vip"
									/>
								</div>
								<Button
									className="w-full"
									onClick={() =>
										createTicket.mutate({
											requesterName,
											requesterEmail,
											subject,
											description,
											priority: priority as
												| "low"
												| "medium"
												| "high"
												| "urgent",
											tagNames: tagInput
												.split(",")
												.map((value) => value.trim())
												.filter(Boolean),
										})
									}
									disabled={
										createTicket.isPending ||
										requesterName.trim().length < 2 ||
										requesterEmail.trim().length < 3 ||
										subject.trim().length < 3 ||
										description.trim().length < 10
									}
								>
									<Plus className="mr-2 h-4 w-4" />
									Create ticket
								</Button>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Public intake</CardTitle>
								<CardDescription>
									Form and email flow through the same intake service.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3 text-sm">
								<div className="rounded-lg border bg-background p-3">
									<p className="font-medium">Submission link</p>
									<p className="mt-1 break-all text-muted-foreground">
										{publicSubmissionUrl}
									</p>
								</div>
								<div className="rounded-lg border bg-background p-3">
									<p className="font-medium">Email intake stub</p>
									<p className="mt-1 text-muted-foreground">
										Inbound email creation is wired behind the API and outbound
										replies use a provider adapter boundary, currently backed by
										a stub implementation.
									</p>
								</div>
							</CardContent>
						</Card>
					</div>

					<Card className="overflow-hidden">
						<CardHeader className="border-b bg-background">
							<div className="flex items-center justify-between gap-3">
								<div>
									<CardTitle>Inbox</CardTitle>
									<CardDescription>
										Filter by ownership and triage the live queue.
									</CardDescription>
								</div>
								<Badge variant="outline">
									{tickets.data?.length ?? 0} shown
								</Badge>
							</div>
							<div className="relative mt-4">
								<Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									placeholder="Search subject, description, requester"
									className="pl-9"
								/>
							</div>
							<div className="mt-4 flex flex-wrap gap-2">
								{[
									["all", "All"],
									["unassigned", "Unassigned"],
									["mine", "My tickets"],
									["open", "Open"],
									["resolved", "Resolved"],
								].map(([value, label]) => (
									<Button
										key={value}
										variant={queuePreset === value ? "default" : "outline"}
										size="sm"
										onClick={() => setQueuePreset(value as QueuePreset)}
									>
										{label}
									</Button>
								))}
							</div>
						</CardHeader>
						<CardContent className="max-h-[calc(100vh-18rem)] overflow-y-auto p-0">
							{tickets.data?.length ? (
								<ul className="divide-y">
									{tickets.data.map((ticket) => (
										<li key={ticket.id}>
											<button
												type="button"
												onClick={() => setSelectedTicketId(ticket.id)}
												className={`w-full px-4 py-4 text-left transition hover:bg-muted/50 ${
													selectedTicketId === ticket.id ? "bg-muted/70" : ""
												}`}
											>
												<div className="flex items-start justify-between gap-3">
													<div>
														<p className="font-medium text-sm">
															{ticket.subject}
														</p>
														<p className="mt-1 text-muted-foreground text-xs">
															{ticket.requesterName} · {ticket.requesterEmail}
														</p>
													</div>
													<PriorityBadge priority={ticket.priority} />
												</div>
												<p className="mt-3 line-clamp-2 text-muted-foreground text-sm">
													{ticket.description}
												</p>
												<div className="mt-3 flex flex-wrap items-center gap-2">
													<StatusBadge status={ticket.status} />
													<Badge variant="outline">{ticket.source}</Badge>
													{ticket.tags.map((tag) => (
														<Badge key={tag.id} variant="secondary">
															{tag.name}
														</Badge>
													))}
												</div>
											</button>
										</li>
									))}
								</ul>
							) : (
								<div className="px-6 py-12 text-center text-muted-foreground text-sm">
									No tickets match this queue yet.
								</div>
							)}
						</CardContent>
					</Card>

					<Card className="overflow-hidden">
						<CardHeader className="border-b bg-background">
							{currentTicket ? (
								<>
									<div className="flex flex-wrap items-start justify-between gap-3">
										<div>
											<CardTitle>{currentTicket.subject}</CardTitle>
											<CardDescription className="mt-1">
												{currentTicket.requester.name} ·{" "}
												{currentTicket.requester.email}
											</CardDescription>
										</div>
										<div className="flex flex-wrap gap-2">
											<StatusBadge status={currentTicket.status} />
											<PriorityBadge priority={currentTicket.priority} />
											<Badge variant="outline">{currentTicket.source}</Badge>
										</div>
									</div>
									<div className="mt-4 grid gap-3 md:grid-cols-3">
										<select
											value={currentTicket.status}
											onChange={(e) =>
												updateTicket.mutate({
													ticketId: currentTicket.id,
													status: e.target.value as
														| "open"
														| "pending"
														| "resolved"
														| "closed",
												})
											}
											className="h-10 rounded-md border bg-background px-3 text-sm"
										>
											<option value="open">Open</option>
											<option value="pending">Pending</option>
											<option value="resolved">Resolved</option>
											<option value="closed">Closed</option>
										</select>
										<select
											value={currentTicket.priority}
											onChange={(e) =>
												updateTicket.mutate({
													ticketId: currentTicket.id,
													priority: e.target.value as
														| "low"
														| "medium"
														| "high"
														| "urgent",
												})
											}
											className="h-10 rounded-md border bg-background px-3 text-sm"
										>
											<option value="low">Low</option>
											<option value="medium">Medium</option>
											<option value="high">High</option>
											<option value="urgent">Urgent</option>
										</select>
										<select
											value={currentTicket.assignedAgentId ?? ""}
											onChange={(e) =>
												assignTicket.mutate({
													ticketId: currentTicket.id,
													assignedAgentId: e.target.value || null,
												})
											}
											className="h-10 rounded-md border bg-background px-3 text-sm"
										>
											<option value="">Unassigned</option>
											{agents.map((agent) => (
												<option key={agent.id} value={agent.id}>
													{agent.name}
												</option>
											))}
										</select>
										<select
											value={currentTicket.assignedTeamId ?? ""}
											onChange={(e) =>
												assignTicket.mutate({
													ticketId: currentTicket.id,
													assignedTeamId: e.target.value || null,
												})
											}
											className="h-10 rounded-md border bg-background px-3 text-sm"
										>
											<option value="">No team</option>
											{teams.map((team) => (
												<option key={team.id} value={team.id}>
													{team.name}
												</option>
											))}
										</select>
									</div>
								</>
							) : (
								<>
									<CardTitle>Ticket detail</CardTitle>
									<CardDescription>
										Select a ticket from the inbox to inspect the thread.
									</CardDescription>
								</>
							)}
						</CardHeader>
						<CardContent className="max-h-[calc(100vh-18rem)] overflow-y-auto p-6">
							{currentTicket ? (
								<div className="space-y-6">
									<div className="space-y-2">
										<div className="flex flex-wrap gap-2">
											{currentTicket.tags.map((tag) => (
												<Badge key={tag.tagId} variant="secondary">
													{tag.name}
												</Badge>
											))}
										</div>
										<p className="text-sm leading-6">
											{currentTicket.description}
										</p>
									</div>

									<div>
										<h2 className="font-medium text-sm">Conversation</h2>
										<div className="mt-3 space-y-3">
											{currentTicket.messages.map((message) => (
												<div
													key={message.id}
													className={`rounded-xl border p-4 ${
														message.messageType === "internal_note"
															? "border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/40"
															: "bg-background"
													}`}
												>
													<div className="flex flex-wrap items-center gap-2">
														<Badge
															variant={
																message.messageType === "internal_note"
																	? "secondary"
																	: "outline"
															}
														>
															{message.messageType.replaceAll("_", " ")}
														</Badge>
														<p className="text-muted-foreground text-xs">
															{message.authorUser?.name ??
																message.authorContact?.name ??
																"System"}
														</p>
													</div>
													<p className="mt-3 whitespace-pre-wrap text-sm leading-6">
														{message.body}
													</p>
												</div>
											))}
										</div>
									</div>

									<div>
										<h2 className="font-medium text-sm">Activity</h2>
										<div className="mt-3 space-y-2">
											{currentTicket.activities.map((activity) => (
												<div
													key={activity.id}
													className="rounded-lg border bg-background px-3 py-2 text-sm"
												>
													<p>{activity.body}</p>
													<p className="mt-1 text-muted-foreground text-xs">
														{activity.actorUser?.name ?? "System"}
													</p>
												</div>
											))}
										</div>
									</div>

									<div className="rounded-2xl border bg-muted/30 p-4">
										<div className="mb-3 flex gap-2">
											<Button
												size="sm"
												variant={
													replyMode === "agent_reply" ? "default" : "outline"
												}
												onClick={() => setReplyMode("agent_reply")}
											>
												<Mail className="mr-2 h-4 w-4" />
												Agent reply
											</Button>
											<Button
												size="sm"
												variant={
													replyMode === "internal_note" ? "default" : "outline"
												}
												onClick={() => setReplyMode("internal_note")}
											>
												<MessageSquare className="mr-2 h-4 w-4" />
												Internal note
											</Button>
										</div>
										<Textarea
											value={replyBody}
											onChange={(e) => setReplyBody(e.target.value)}
											placeholder={
												replyMode === "agent_reply"
													? "Write a reply to the requester"
													: "Leave internal context for teammates"
											}
										/>
										<Button
											className="mt-3"
											onClick={() =>
												addMessage.mutate({
													ticketId: currentTicket.id,
													body: replyBody,
													messageType: replyMode,
												})
											}
											disabled={
												addMessage.isPending || replyBody.trim().length === 0
											}
										>
											{replyMode === "agent_reply" ? "Send reply" : "Save note"}
										</Button>
									</div>
								</div>
							) : (
								<div className="py-12 text-center text-muted-foreground text-sm">
									No ticket selected.
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

function MetricCard({
	icon: Icon,
	label,
	value,
	helper,
}: {
	icon: typeof Building2;
	label: string;
	value: number;
	helper: string;
}) {
	return (
		<Card>
			<CardContent className="flex items-center justify-between p-5">
				<div>
					<p className="text-muted-foreground text-sm">{label}</p>
					<p className="mt-1 font-semibold text-3xl tracking-tight">{value}</p>
					<p className="mt-1 text-muted-foreground text-xs">{helper}</p>
				</div>
				<div className="rounded-full border bg-muted p-3">
					<Icon className="h-5 w-5" />
				</div>
			</CardContent>
		</Card>
	);
}

function StatusBadge({ status }: { status: string }) {
	const variant =
		status === "resolved"
			? "secondary"
			: status === "closed"
				? "outline"
				: status === "pending"
					? "default"
					: "outline";

	return <Badge variant={variant}>{status}</Badge>;
}

function PriorityBadge({ priority }: { priority: string }) {
	const variant =
		priority === "urgent"
			? "destructive"
			: priority === "high"
				? "default"
				: "secondary";

	return <Badge variant={variant}>{priority}</Badge>;
}
