import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/auth/reset-password")({
	validateSearch: z.object({
		token: z.string().optional(),
	}),
	component: ResetPasswordRoute,
});

function ResetPasswordRoute() {
	const { token } = Route.useSearch();
	const [done, setDone] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);

	const form = useForm({
		defaultValues: { password: "", confirm: "" },
		onSubmit: async ({ value }) => {
			const { error } = await authClient.resetPassword({
				newPassword: value.password,
				token: token ?? "",
			});
			if (error) {
				toast.error(error.message || "Failed to reset password");
			} else {
				setDone(true);
			}
		},
		validators: {
			onSubmit: z
				.object({
					password: z.string().min(8, "Password must be at least 8 characters"),
					confirm: z.string(),
				})
				.refine((d) => d.password === d.confirm, {
					message: "Passwords don't match",
					path: ["confirm"],
				}),
		},
	});

	if (!token) {
		return (
			<div className="flex h-screen">
				<div className="flex flex-1 items-center justify-center p-8">
					<div className="w-full max-w-sm space-y-4 text-center">
						<h1 className="font-semibold text-2xl tracking-tight">
							Invalid link
						</h1>
						<p className="text-muted-foreground text-sm">
							This password reset link is missing a token. Please request a new
							one.
						</p>
						<Link
							to="/auth/forgot-password"
							className="inline-block font-medium text-foreground text-sm underline underline-offset-4 hover:no-underline"
						>
							Request a new link
						</Link>
					</div>
				</div>
			</div>
		);
	}

	if (done) {
		return (
			<div className="flex h-screen">
				<div className="flex flex-1 items-center justify-center p-8">
					<div className="w-full max-w-sm space-y-6 text-center">
						<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
							<CheckCircle2 className="h-7 w-7 text-primary" />
						</div>
						<div className="space-y-2">
							<h1 className="font-semibold text-2xl tracking-tight">
								Password updated
							</h1>
							<p className="text-muted-foreground text-sm">
								Your password has been reset successfully.
							</p>
						</div>
						<Link
							to="/auth/login"
							className="inline-block font-medium text-foreground text-sm underline underline-offset-4 hover:no-underline"
						>
							Sign in with new password →
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full max-w-sm">
			{/* Header */}
			<div className="mb-8">
				<h1 className="font-display text-2xl text-foreground tracking-tight">
					Set a new password
				</h1>
				<p className="mt-1.5 text-muted-foreground text-sm">
					Must be at least 8 characters
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
				<form.Field name="password">
					{(field) => (
						<div className="space-y-1.5">
							<Label htmlFor={field.name}>New password</Label>
							<div className="relative">
								<Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									id={field.name}
									name={field.name}
									type={showPassword ? "text" : "password"}
									placeholder="••••••••"
									className="pr-10 pl-10"
									autoComplete="new-password"
									autoFocus
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

				<form.Field name="confirm">
					{(field) => (
						<div className="space-y-1.5">
							<Label htmlFor={field.name}>Confirm password</Label>
							<div className="relative">
								<Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									id={field.name}
									name={field.name}
									type={showConfirm ? "text" : "password"}
									placeholder="••••••••"
									className="pr-10 pl-10"
									autoComplete="new-password"
									aria-invalid={field.state.meta.errors.length > 0}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
								<button
									type="button"
									onClick={() => setShowConfirm(!showConfirm)}
									aria-label={showConfirm ? "Hide confirm" : "Show confirm"}
									className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
								>
									{showConfirm ? (
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
							{isSubmitting ? "Updating…" : "Update password"}
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
