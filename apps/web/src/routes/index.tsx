import { createFileRoute } from "@tanstack/react-router";

import {
	CTA,
	FeaturesSection,
	Footer,
	HeroSection,
	HowItWorks,
} from "@/features/home";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<div className="h-full overflow-y-auto bg-background">
			<HeroSection />

			<FeaturesSection />

			<HowItWorks />

			{/* <Testimonials /> */}

			<CTA />

			<Footer />
		</div>
	);
}
