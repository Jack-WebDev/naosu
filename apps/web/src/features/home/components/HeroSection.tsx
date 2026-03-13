import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductMockUp } from "./ProductMockUp";

export function HeroSection() {
	return (
		<section className="hero section-grain">
			<div className="hero-content">
				<h1 className="hero-headline animate-fade-up font-display delay-2">
					Support that moves
					<br />
					<em className="text-shimmer not-italic">at your speed.</em>
				</h1>

				<p className="hero-sub animate-fade-up delay-3">
					One inbox. Every channel. Zero chaos.{" "}
					<span className="hero-sub-highlight">Naosu</span> is the ticketing
					platform built for teams that refuse to be slow.
				</p>

				<div className="hero-ctas animate-fade-up delay-4">
					<Button size="lg" asChild className="btn-primary-glow">
						<Link to="/auth/register">
							Sign Up <ArrowRight className="h-4 w-4" />
						</Link>
					</Button>
					<Button
						size="lg"
						variant="outline"
						asChild
						className="btn-outline-hover"
					>
						<Link to="/auth/login">
							Sign in <ChevronRight className="h-4 w-4" />
						</Link>
					</Button>
				</div>

				<p className="hero-fine-print animate-fade-in delay-5">
					No credit card required ·{" "}
					<span className="hero-fine-print-bold">50,000+</span> teams trust
					Naosu · Cancel anytime
				</p>

				<div className="hero-mockup animate-scale-in delay-6">
					<ProductMockUp />
				</div>
			</div>
		</section>
	);
}
