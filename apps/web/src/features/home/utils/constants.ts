import { Globe, Inbox, Shield, TrendingUp, Users, Zap } from "lucide-react";

export const FEATURES = [
	{
		icon: Inbox,
		title: "Unified Inbox",
		description:
			"Every channel flows into one intelligent workspace. Email, chat, API — never miss a message again.",
	},
	{
		icon: Zap,
		title: "Smart Routing",
		description:
			"AI assigns the right agent instantly. Cut response time by 60% starting on day one.",
	},
	{
		icon: TrendingUp,
		title: "Real-time Analytics",
		description:
			"Live dashboards track SLAs, CSAT, and team performance as it happens — not hours later.",
	},
	{
		icon: Shield,
		title: "Enterprise Security",
		description:
			"SOC 2 Type II, 256-bit encryption, zero-trust architecture. Security your enterprise demands.",
	},
	{
		icon: Users,
		title: "Team Collaboration",
		description:
			"Private notes, @mentions, and shared views keep every agent aligned on every ticket.",
	},
	{
		icon: Globe,
		title: "Global Scale",
		description:
			"99.99% uptime, 30+ edge regions, unlimited volume. Built to grow as fast as you do.",
	},
];

export const STEPS = [
	{
		number: "01",
		title: "Connect your channels",
		description:
			"Link email, live chat, social, and APIs in minutes. No engineering required.",
	},
	{
		number: "02",
		title: "Tickets route automatically",
		description:
			"Smart routing assigns tickets by skills, load, and SLA urgency — hands free.",
	},
	{
		number: "03",
		title: "Resolve and delight",
		description:
			"Powerful tools, full context, and AI suggestions help your team close tickets fast.",
	},
];

export const STATS = [
	{ value: "50k+", label: "Teams worldwide" },
	{ value: "99.9%", label: "Uptime SLA" },
	{ value: "4 min", label: "Avg. response time" },
	{ value: "60%", label: "Faster resolution" },
];

export const TICKETS = [
	{
		id: "4821",
		status: "urgent",
		title: "Payment gateway timeout on checkout",
		agent: "AR",
		time: "just now",
	},
	{
		id: "4820",
		status: "open",
		title: "Can't export reports to CSV format",
		agent: "SK",
		time: "4m",
	},
	{
		id: "4819",
		status: "progress",
		title: "API rate limiting behaving unexpectedly",
		agent: "TM",
		time: "12m",
	},
	{
		id: "4818",
		status: "resolved",
		title: "Mobile app crash on iOS 17.2 update",
		agent: "PL",
		time: "1h",
	},
	{
		id: "4817",
		status: "open",
		title: "Wrong currency displayed for EU customers",
		agent: "JD",
		time: "2h",
	},
];

export const TESTIMONIALS = [
	{
		quote:
			"Naosu cut our first-response time from 40 minutes to under 4. Our CSAT went from 72% to 96% in six weeks.",
		author: "Sarah K.",
		role: "Head of Support, Vercel",
		initials: "SK",
	},
	{
		quote:
			"We evaluated 12 ticketing platforms. Naosu was the only one that felt built for teams who move fast.",
		author: "James D.",
		role: "VP Engineering, Stripe",
		initials: "JD",
	},
	{
		quote:
			"The smart routing alone saved us two full-time hires. It just works, every single time.",
		author: "Priya L.",
		role: "CX Director, Linear",
		initials: "PL",
	},
];

export const CTAInfo = [
	"Set up in under 10 minutes",
	"No engineering required",
	"Cancel or downgrade any time",
];
