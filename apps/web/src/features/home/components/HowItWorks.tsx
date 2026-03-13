import { STEPS } from "../utils";

export function HowItWorks() {
	return (
		<section className="steps-section">
			<div className="steps-section-bg" />
			<div className="steps-content">
				<div className="section-header">
					<span className="section-eyebrow">How it works</span>
					<h2 className="section-title font-display">
						Up and running in minutes.
					</h2>
				</div>

				<div className="steps-grid">
					{STEPS.map((step, i) => (
						<div key={step.number} className="step-item">
							{i < STEPS.length - 1 && <div className="step-connector" />}
							<div className="step-ring">{step.number}</div>
							<h3 className="step-title">{step.title}</h3>
							<p className="step-description">{step.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
