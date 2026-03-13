import type { QueryClient } from "@tanstack/react-query";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	useMatches,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import type { trpc } from "@/utils/trpc";

import "../index.css";

export interface RouterAppContext {
	trpc: typeof trpc;
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootComponent,
	head: () => ({
		meta: [
			{
				title: "naosu",
			},
			{
				name: "description",
				content: "naosu is a web application",
			},
		],
		links: [
			{
				rel: "icon",
				href: "/favicon.ico",
			},
		],
	}),
});

function RootComponent() {
	const isAuthRoute = useMatches({
		select(matches) {
			return matches.some(
				(match) =>
					match.pathname.startsWith("/auth/") || match.pathname === "/auth",
			);
		},
	});

	return (
		<>
			<HeadContent />
			<ThemeProvider
				attribute="class"
				defaultTheme="dark"
				disableTransitionOnChange
				storageKey="vite-ui-theme"
			>
				{isAuthRoute ? (
					<Outlet />
				) : (
					<div className="h-svh">
						<Outlet />
					</div>
				)}
				<Toaster
					richColors
					position="top-right"
					closeButton={true}
					invert={true}
					expand
				/>
			</ThemeProvider>
			{import.meta.env.DEV && <TanStackRouterDevtools position="bottom-left" />}
			{import.meta.env.DEV && (
				<ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
			)}
		</>
	);
}
