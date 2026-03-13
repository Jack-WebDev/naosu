import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/security/privacy")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/security/privacy"!</div>;
}
