import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/auth/register")({
	component: RegisterRoute,
});

// function LeftPanel() {
// 	return (
// 		<div className="relative hidden flex-col justify-between overflow-hidden bg-zinc-950 p-12 lg:flex lg:w-[45%]">
// 			<div className="pointer-events-none absolute inset-0" aria-hidden>
// 				<div className="absolute -top-32 -right-32 h-[480px] w-[480px] rounded-full bg-indigo-600/20 blur-[120px]" />
// 				<div className="absolute -bottom-20 -left-20 h-[360px] w-[360px] rounded-full bg-violet-700/15 blur-[100px]" />
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
// 						Your team deserves
// 						<br />
// 						<span className="font-semibold">better support tools.</span>
// 					</h2>
// 					<p className="max-w-xs text-sm text-white/50 leading-relaxed">
// 						Set up in minutes. No credit card required. Cancel any time.
// 					</p>
// 				</div>

// 				<ul className="space-y-3">
// 					{[
// 						"14-day free trial, full access",
// 						"Onboarding support included",
// 						"Migrate from any helpdesk",
// 						"SOC 2 Type II certified",
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

function RegisterRoute() {
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false);

	const form = useForm({
		defaultValues: { name: "", email: "", password: "" },
		onSubmit: async ({ value }) => {
			await authClient.signUp.email(
				{ name: value.name, email: value.email, password: value.password },
				{
					onSuccess: () => {
						navigate({ to: "/dashboard" });
						toast.success("Account created — welcome aboard");
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(2, "Name must be at least 2 characters"),
				email: z.email("Invalid email address"),
				password: z.string().min(8, "Password must be at least 8 characters"),
			}),
		},
	});

	return (
		<div className="w-full max-w-sm">
			{/* Header */}
			<div className="mb-8">
				<h1 className="font-display text-2xl text-foreground tracking-tight">
					Create your account
				</h1>
				<p className="mt-1.5 text-muted-foreground text-sm">
					Start your 14-day free trial — no card required
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
				<form.Field name="name">
					{(field) => (
						<div className="space-y-1.5">
							<Label htmlFor={field.name}>Full name</Label>
							<div className="relative">
								<User className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									id={field.name}
									name={field.name}
									type="text"
									placeholder="Alex Johnson"
									className="pl-10"
									autoComplete="name"
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

				<form.Field name="email">
					{(field) => (
						<div className="space-y-1.5">
							<Label htmlFor={field.name}>Work email</Label>
							<div className="relative">
								<Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									id={field.name}
									name={field.name}
									type="email"
									placeholder="you@company.com"
									className="pl-10"
									autoComplete="email"
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

				<form.Field name="password">
					{(field) => (
						<div className="space-y-1.5">
							<Label htmlFor={field.name}>Password</Label>
							<div className="relative">
								<Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									id={field.name}
									name={field.name}
									type={showPassword ? "text" : "password"}
									placeholder="Min. 8 characters"
									className="pr-10 pl-10"
									autoComplete="new-password"
									aria-invalid={field.state.meta.errors.length > 0}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									aria-label={showPassword ? "Hide password" : "Show password"}
									className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
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
							{isSubmitting ? "Creating account…" : "Create account"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<p className="mt-5 text-center text-muted-foreground text-xs">
				By creating an account you agree to our{" "}
				<Link
					to="/legal/terms"
					className="underline underline-offset-4 transition-colors hover:text-foreground"
				>
					Terms of Service
				</Link>{" "}
				and{" "}
				<Link
					to="/security/privacy"
					className="underline underline-offset-4 transition-colors hover:text-foreground"
				>
					Privacy Policy
				</Link>
				.
			</p>

			{/* Divider */}
			<div className="my-5 flex items-center gap-3">
				<div className="h-px flex-1 bg-border" />
				<span className="text-muted-foreground text-xs">or</span>
				<div className="h-px flex-1 bg-border" />
			</div>

			<p className="text-center text-muted-foreground text-sm">
				Already have an account?{" "}
				<Link
					to="/auth/login"
					className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
				>
					Sign in
				</Link>
			</p>
		</div>
	);
}
