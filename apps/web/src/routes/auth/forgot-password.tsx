import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Mail } from "lucide-react";
import { useState } from "react";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth/forgot-password")({
	component: ForgotPasswordRoute,
});

// function LeftPanel() {
// 	return (
// 		<div className="relative hidden flex-col justify-between overflow-hidden bg-zinc-950 p-12 lg:flex lg:w-[45%]">
// 			<div className="pointer-events-none absolute inset-0" aria-hidden>
// 				<div className="absolute -top-32 -right-32 h-120 w-120 rounded-full bg-indigo-600/20 blur-[120px]" />
// 				<div className="absolute -bottom-20 -left-20 h-90 w-90 rounded-full bg-violet-700/15 blur-[100px]" />
// 				<div
// 					className="absolute inset-0 opacity-20"
// 					style={{
// 						backgroundImage:
// 							"radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
// 						backgroundSize: "28px 28px",
// 					}}
// 				/>
// 			</div>

// 			<div className="relative z-10">
// 				<span className="font-semibold text-lg text-white tracking-tight">
// 					naosu
// 				</span>
// 			</div>

// 			<div className="relative z-10 space-y-8">
// 				<div className="space-y-3">
// 					<h2 className="font-light text-4xl text-white leading-tight">
// 						We've got
// 						<br />
// 						<span className="font-semibold">your back.</span>
// 					</h2>
// 					<p className="max-w-xs text-sm text-white/50 leading-relaxed">
// 						Password resets are quick and secure. You'll be back in your
// 						workspace in no time.
// 					</p>
// 				</div>

// 				<ul className="space-y-3">
// 					{[
// 						"Link expires after 1 hour",
// 						"Single-use for your security",
// 						"Contact support if you need help",
// 					].map((feature) => (
// 						<li
// 							key={feature}
// 							className="flex items-center gap-3 text-sm text-white/60"
// 						>
// 							<div className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
// 							{feature}
// 						</li>
// 					))}
// 				</ul>
// 			</div>

// 			<div className="relative z-10 grid grid-cols-3 gap-6 border-white/10 border-t pt-8">
// 				{[
// 					{ value: "50k+", label: "Companies" },
// 					{ value: "98%", label: "CSAT score" },
// 					{ value: "4 min", label: "Avg. response" },
// 				].map(({ value, label }) => (
// 					<div key={label}>
// 						<p className="font-semibold text-white text-xl">{value}</p>
// 						<p className="mt-0.5 text-white/40 text-xs">{label}</p>
// 					</div>
// 				))}
// 			</div>
// 		</div>
// 	);
// }

function ForgotPasswordRoute() {
	const [submitted, setSubmitted] = useState(false);

	const form = useForm({
		defaultValues: { email: "" },
		onSubmit: async ({ value }) => {
			// const { error } = await authClient.resetPassword({
			// 	email: value.email,
			// 	redirectTo: `${window.location.origin}/auth/reset-password`,
			// });
			// if (error) {
			// 	toast.error(error.message || "Failed to send reset email");
			// } else {
			// 	setSubmitted(true);
			// }

			console.log(value);
		},
		validators: {
			onSubmit: z.object({
				email: z.email("Invalid email address"),
			}),
		},
	});

	if (submitted) {
		return (
			<div className="w-full max-w-sm space-y-6 text-center">
				<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
					<CheckCircle2 className="h-7 w-7 text-primary" />
				</div>

				<div className="space-y-2">
					<h1 className="font-display text-2xl text-foreground tracking-tight">
						Check your inbox
					</h1>
					<p className="text-muted-foreground text-sm">
						We sent a password reset link to your email. The link expires in 1
						hour.
					</p>
				</div>

				<p className="text-muted-foreground text-sm">
					Didn't receive it?{" "}
					<button
						type="button"
						onClick={() => setSubmitted(false)}
						className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
					>
						Try again
					</button>
				</p>

				<Link
					to="/auth/login"
					className="block text-muted-foreground text-sm transition-colors hover:text-foreground"
				>
					← Back to sign in
				</Link>
			</div>
		);
	}

	return (
		<div className="w-full max-w-sm">
			<div className="mb-8">
				<h1 className="font-display text-2xl text-foreground tracking-tight">
					Reset your password
				</h1>
				<p className="mt-1.5 text-muted-foreground text-sm">
					Enter your email and we'll send you a reset link
				</p>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-5"
			>
				<form.Field name="email">
					{(field) => (
						<div className="space-y-1.5">
							<Label htmlFor={field.name}>Email</Label>
							<div className="relative">
								<Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									id={field.name}
									name={field.name}
									type="email"
									placeholder="you@company.com"
									className="pl-10"
									autoComplete="email"
									autoFocus
									aria-invalid={field.state.meta.errors.length > 0}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</div>
							{field.state.meta.errors[0] && (
								<p className="text-destructive text-xs">
									{field.state.meta.errors[0]?.message}
								</p>
							)}
						</div>
					)}
				</form.Field>

				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
				>
					{([canSubmit, isSubmitting]) => (
						<Button
							type="submit"
							className="w-full rounded-full"
							disabled={!canSubmit || isSubmitting}
						>
							{isSubmitting ? "Sending…" : "Send reset link"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<p className="mt-6 text-center text-sm">
				<Link
					to="/auth/login"
					className="text-muted-foreground transition-colors hover:text-foreground"
				>
					← Back to sign in
				</Link>
			</p>
		</div>
	);
}
