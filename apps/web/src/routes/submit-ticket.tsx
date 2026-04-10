import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

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
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/submit-ticket")({
	component: SubmitTicketRoute,
	validateSearch: (search: Record<string, unknown>) => ({
		workspace: typeof search.workspace === "string" ? search.workspace : "",
	}),
});

function SubmitTicketRoute() {
	const search = Route.useSearch();
	const [workspaceSlug, setWorkspaceSlug] = useState(search.workspace);
	const [requesterName, setRequesterName] = useState("");
	const [requesterEmail, setRequesterEmail] = useState("");
	const [subject, setSubject] = useState("");
	const [description, setDescription] = useState("");
	const [priority, setPriority] = useState("medium");

	const createPortalTicket = useMutation(
		trpc.intake.createPortalTicket.mutationOptions({
			onSuccess: () => {
				setRequesterName("");
				setRequesterEmail("");
				setSubject("");
				setDescription("");
			},
		}),
	);

	return (
		<div className="min-h-screen bg-muted/20 px-4 py-10">
			<div className="mx-auto max-w-2xl">
				<Card>
					<CardHeader>
						<CardTitle>Submit a support request</CardTitle>
						<CardDescription>
							This uses the same normalized intake pipeline as email.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-2">
							<Label htmlFor="workspace-slug">Workspace slug</Label>
							<Input
								id="workspace-slug"
								value={workspaceSlug}
								onChange={(e) => setWorkspaceSlug(e.target.value)}
								placeholder="acme-support"
							/>
						</div>
						<div className="grid gap-2 sm:grid-cols-2">
							<div className="grid gap-2">
								<Label htmlFor="requester-name">Your name</Label>
								<Input
									id="requester-name"
									value={requesterName}
									onChange={(e) => setRequesterName(e.target.value)}
									placeholder="Jane Doe"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="requester-email">Your email</Label>
								<Input
									id="requester-email"
									value={requesterEmail}
									onChange={(e) => setRequesterEmail(e.target.value)}
									placeholder="jane@company.com"
									type="email"
								/>
							</div>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="subject">Subject</Label>
							<Input
								id="subject"
								value={subject}
								onChange={(e) => setSubject(e.target.value)}
								placeholder="I need help updating billing details"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="priority">Priority</Label>
							<select
								id="priority"
								value={priority}
								onChange={(e) => setPriority(e.target.value)}
								className="h-10 rounded-md border bg-background px-3 text-sm"
							>
								<option value="low">Low</option>
								<option value="medium">Medium</option>
								<option value="high">High</option>
								<option value="urgent">Urgent</option>
							</select>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Share as much context as you can"
								className="min-h-40"
							/>
						</div>
						<Button
							className="w-full"
							onClick={() =>
								createPortalTicket.mutate({
									workspaceSlug,
									requesterName,
									requesterEmail,
									subject,
									description,
									priority: priority as "low" | "medium" | "high" | "urgent",
								})
							}
							disabled={
								createPortalTicket.isPending ||
								workspaceSlug.trim().length < 2 ||
								requesterName.trim().length < 2 ||
								requesterEmail.trim().length < 3 ||
								subject.trim().length < 3 ||
								description.trim().length < 10
							}
						>
							Submit request
						</Button>
						{createPortalTicket.data?.ticketId ? (
							<p className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
								Request submitted. Ticket ID: {createPortalTicket.data.ticketId}
							</p>
						) : null}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
