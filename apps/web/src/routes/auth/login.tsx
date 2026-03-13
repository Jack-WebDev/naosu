import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/auth/login")({
	component: LoginRoute,
});

function LoginRoute() {
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false);

	const form = useForm({
		defaultValues: { email: "", password: "" },
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{ email: value.email, password: value.password },
				{
					onSuccess: () => {
						navigate({ to: "/dashboard" });
						toast.success("Welcome back");
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				email: z.email("Invalid email address"),
				password: z.string().min(1, "Password is required"),
			}),
		},
	});

	return (
		<div className="w-full max-w-sm">
			<div className="mb-8">
				<h1 className="font-display text-2xl text-foreground tracking-tight">
					Welcome back
				</h1>
				<p className="mt-1.5 text-muted-foreground text-sm">
					Sign in to your workspace
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

				<form.Field name="password">
					{(field) => (
						<div className="space-y-1.5">
							<div className="flex items-center justify-between">
								<Label htmlFor={field.name}>Password</Label>
								<Link
									to="/auth/forgot-password"
									className="text-muted-foreground text-xs transition-colors hover:text-foreground"
								>
									Forgot password?
								</Link>
							</div>
							<div className="relative">
								<Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									id={field.name}
									name={field.name}
									type={showPassword ? "text" : "password"}
									placeholder="••••••••"
									className="pr-10 pl-10"
									autoComplete="current-password"
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
							{isSubmitting ? "Signing in…" : "Sign in"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			{/* Divider */}
			<div className="my-6 flex items-center gap-3">
				<div className="h-px flex-1 bg-border" />
				<span className="text-muted-foreground text-xs">or</span>
				<div className="h-px flex-1 bg-border" />
			</div>

			<p className="text-center text-muted-foreground text-sm">
				Don't have an account?{" "}
				<Link
					to="/auth/register"
					className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
				>
					Create one
				</Link>
			</p>
		</div>
	);
}
