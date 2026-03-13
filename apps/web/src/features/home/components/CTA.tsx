import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckIcon, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CTAInfo } from "../utils";

export function CTA() {
	return (
		<section className="cta-section section-grain">
			<div className="cta-section-bg">
				<div className="cta-section-bg-bottom" />
				<div className="cta-section-bg-top" />
				<div className="cta-section-bg-grid" />
				<div className="cta-section-bg-rule-top" />
				<div className="cta-section-bg-rule-bottom" />
			</div>

			<div className="cta-content">
				<h2 className="cta-headline font-display">
					Transform your support,
					<br />
					<em>starting today.</em>
				</h2>

				<p className="cta-sub">
					Join teams already delivering exceptional support with Naosu.
				</p>

				<ul className="cta-checklist">
					{CTAInfo.map((item) => (
						<li key={item} className="cta-check-item">
							<span className="cta-check-icon">
								<CheckIcon className="h-3 w-3" />
							</span>
							{item}
						</li>
					))}
				</ul>

				<div className="cta-actions">
					<Button size="lg" asChild className="btn-cta-primary">
						<Link to="/auth/register">
							Get started free <ArrowRight className="h-4 w-4" />
						</Link>
					</Button>
					<Button size="lg" variant="ghost" asChild className="btn-cta-ghost">
						<Link to="/auth/login">
							Already have an account? Sign in{" "}
							<ChevronRight className="h-4 w-4" />
						</Link>
					</Button>
				</div>
			</div>
		</section>
	);
}
