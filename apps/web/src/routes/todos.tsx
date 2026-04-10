import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/todos")({
	beforeLoad: () => {
		redirect({
			to: "/dashboard",
			throw: true,
		});
	},
	component: TodosRedirectRoute,
});

function TodosRedirectRoute() {
	return null;
}
