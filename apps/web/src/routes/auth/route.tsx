import {
	createFileRoute,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import { CheckIcon, LogsIcon } from "lucide-react";
import { useEffect, useState } from "react";

type RoutePanelProps = {
	headlineTop: string;
	headlineBottom: string;
	sub: string;
	features: string[];
};

export const Route = createFileRoute("/auth")({
	component: RouteComponent,
});

const ROUTE_CONTENT: Record<string, RoutePanelProps> = {
	"/auth/login": {
		headlineTop: "Pick up right",
		headlineBottom: "where you left off.",
		sub: "Your customers are waiting. Every second counts — jump back in and keep your team moving.",
		features: [
			"All your conversations, instantly synced",
			"Real-time team activity feed",
			"SLA timers that never sleep",
			"One-click context on every ticket",
		],
	},
	"/auth/register": {
		headlineTop: "Support that scales",
		headlineBottom: "with your ambition.",
		sub: "Set up in minutes. No credit card required. Join teams who've cut response times by 60%.",
		features: [
			"Unified inbox for every channel",
			"Intelligent ticket routing & tagging",
			"SLA tracking & real-time alerts",
			"Deep team performance analytics",
		],
	},
	"/auth/forgot-password": {
		headlineTop: "Back in action",
		headlineBottom: "in under 2 minutes.",
		sub: "We'll send a secure reset link straight to your inbox. No waiting, no hassle.",
		features: [
			"Instant secure email delivery",
			"Link expires after 15 minutes",
			"Two-factor setup on next login",
			"Full audit log of account access",
		],
	},
	"/auth/reset-password": {
		headlineTop: "New password,",
		headlineBottom: "fresh start.",
		sub: "Choose something strong. We'll verify it meets our security standards as you type.",
		features: [
			"256-bit AES encryption at rest",
			"Zero-knowledge password storage",
			"Session invalidation on all devices",
			"Instant breach detection alerts",
		],
	},
};

const DEFAULT_CONTENT = ROUTE_CONTENT["/auth/login"];

function LeftPanel() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const content = ROUTE_CONTENT[pathname] ?? DEFAULT_CONTENT;

	const [displayed, setDisplayed] = useState(content);
	const [animKey, setAnimKey] = useState(0);

	useEffect(() => {
		setDisplayed(content);
		setAnimKey((k) => k + 1);
	}, [content]);

	return (
		<div className="relative hidden h-svh w-[45%] flex-col overflow-hidden bg-[#141412] px-14 py-12 lg:flex">
			{/* Background */}
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -top-40 -right-16 h-130 w-130 rounded-full bg-primary/20 blur-[140px]" />
				<div className="absolute -bottom-16 -left-32 h-105 w-105 rounded-full bg-primary/10 blur-[120px]" />
				<div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-size-[26px_26px]" />
			</div>

			{/* Logo */}
			<div className="relative z-10 flex items-center gap-3">
				<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/40">
					<LogsIcon className="h-4 w-4 text-primary-foreground" />
				</div>
				<span className="font-display text-lg text-white">naosu</span>
			</div>

			{/* Animated content — vertically centered in remaining space */}
			<div className="relative z-10 flex flex-1 items-center">
				<div key={animKey} className="w-full max-w-md animate-fade-up">
					{/* Headline */}
					<h2 className="mb-4 font-display text-4xl text-white leading-[1.08] tracking-tight">
						{displayed.headlineTop}
						<br />
						<em className="font-light text-primary italic">
							{displayed.headlineBottom}
						</em>
					</h2>

					<p className="mb-10 text-sm text-white/50 leading-relaxed">
						{displayed.sub}
					</p>

					{/* Features */}
					<div className="space-y-2.5">
						{displayed.features.map((feature) => (
							<div
								key={feature}
								className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm transition-colors duration-200 hover:border-primary/40 hover:bg-primary/10"
							>
								<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
									<CheckIcon className="h-3.5 w-3.5" />
								</div>
								<p className="text-sm text-white/60 transition-colors duration-200 group-hover:text-white/90">
									{feature}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

function RouteComponent() {
	return (
		<div className="flex min-h-screen">
			<LeftPanel />
			<div className="flex flex-1 items-center justify-center bg-background p-8">
				<Outlet />
			</div>
		</div>
	);
}
