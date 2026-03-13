import { Bell, Inbox, LayoutDashboard, TrendingUp, Users } from "lucide-react";
import { statusDot } from "../helpers/StatusDot";
import { TICKETS } from "../utils";

export function ProductMockUp() {
	return (
		<div className="mockup-wrapper">
			<div className="mockup-glow-primary" />
			<div className="mockup-glow-accent" />

			<div className="mockup-window">
				{/* Browser chrome */}
				<div className="mockup-chrome">
					<div className="mockup-traffic-lights">
						<div className="mockup-traffic-light mockup-traffic-light--close" />
						<div className="mockup-traffic-light mockup-traffic-light--min" />
						<div className="mockup-traffic-light mockup-traffic-light--max" />
					</div>

					<div className="mockup-url-bar">
						<div className="mockup-url-bar-inner">
							<svg
								className="mockup-url-icon"
								viewBox="0 0 16 16"
								fill="currentColor"
								aria-hidden="true"
							>
								<path d="M8 1a4 4 0 0 1 4 4v1h.5A1.5 1.5 0 0 1 14 7.5v6A1.5 1.5 0 0 1 12.5 15h-9A1.5 1.5 0 0 1 2 13.5v-6A1.5 1.5 0 0 1 3.5 6H4V5a4 4 0 0 1 4-4zm0 1a3 3 0 0 0-3 3v1h6V5a3 3 0 0 0-3-3z" />
							</svg>
							app.naosu.io/inbox
						</div>
					</div>

					<div className="mockup-chrome-actions">
						<div className="mockup-bell-wrapper">
							<Bell className="h-3.5 w-3.5 text-muted-foreground" />
							<span className="mockup-bell-badge">3</span>
						</div>
						<div className="mockup-avatar">AR</div>
					</div>
				</div>

				{/* App body */}
				<div className="mockup-body">
					{/* Icon sidebar */}
					<div className="mockup-sidebar">
						<div className="mockup-sidebar-item mockup-sidebar-item--active">
							<Inbox className="h-4 w-4" />
						</div>
						<div className="mockup-sidebar-item mockup-sidebar-item--inactive">
							<LayoutDashboard className="h-4 w-4" />
						</div>
						<div className="mockup-sidebar-item mockup-sidebar-item--inactive">
							<Users className="h-4 w-4" />
						</div>
						<div className="mockup-sidebar-item mockup-sidebar-item--inactive">
							<TrendingUp className="h-4 w-4" />
						</div>
					</div>

					{/* Main panel */}
					<div className="mockup-panel">
						<div className="mockup-panel-header">
							<div className="mockup-panel-title-group">
								<h3 className="mockup-panel-title">All Tickets</h3>
								<span className="mockup-panel-badge">
									<span className="relative flex h-1.5 w-1.5">
										<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
										<span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
									</span>
									24 open
								</span>
							</div>
							<span className="mockup-panel-sort">Sort: Newest</span>
						</div>

						<div className="mockup-tickets">
							{TICKETS.map((ticket, i) => (
								<div
									key={ticket.id}
									className="mockup-ticket"
									style={{ opacity: Math.max(0.32, 1 - i * 0.13) }}
								>
									<div
										className={`h-2 w-2 shrink-0 rounded-full ${statusDot(ticket.status)}`}
									/>
									<span className="mockup-ticket-title">{ticket.title}</span>
									<span className="mockup-ticket-agent">{ticket.agent}</span>
									<span className="mockup-ticket-time">{ticket.time}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
