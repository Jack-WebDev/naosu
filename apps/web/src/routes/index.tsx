import { createFileRoute } from "@tanstack/react-router";

import {
	CTA,
	FeaturesSection,
	Footer,
	HeroSection,
	HowItWorks,
	Testimonials,
} from "@/features/home";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

export function HomeComponent() {
	return (
		<div className="h-full overflow-y-auto bg-background">
			<HeroSection />

			<FeaturesSection />

			<HowItWorks />

			<Testimonials />

			<CTA />

			<Footer />
		</div>
	);
}
