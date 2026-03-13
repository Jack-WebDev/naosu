import { FEATURES } from "../utils";

export function FeaturesSection() {
	return (
		<section className="features-section">
			<div className="mx-auto max-w-5xl">
				<div className="section-header">
					<span className="section-eyebrow">Everything you need</span>
					<h2 className="section-title font-display">
						Designed for speed.{" "}
						<em className="section-title-muted">Built for scale.</em>
					</h2>
				</div>

				<div className="features-grid">
					{FEATURES.map((feature) => (
						<div key={feature.title} className="feature-card">
							<div className="feature-card-glow" />
							<div className="feature-icon">
								<feature.icon className="h-5 w-5" />
							</div>
							<h3 className="feature-title">{feature.title}</h3>
							<p className="feature-description">{feature.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
