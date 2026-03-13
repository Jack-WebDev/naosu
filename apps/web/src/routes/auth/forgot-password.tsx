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
