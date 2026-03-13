export function statusDot(status: string) {
	if (status === "urgent") return "bg-destructive";
	if (status === "resolved") return "bg-primary";
	if (status === "progress") return "bg-primary/50";
	return "bg-border";
}
