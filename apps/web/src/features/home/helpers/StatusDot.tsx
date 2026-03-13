const STATUS_DOT_CLASS: Record<string, string> = {
	urgent: "bg-destructive",
	resolved: "bg-primary",
	progress: "bg-primary/50",
	open: "bg-success",
};

export function statusDot(status: string) {
	return STATUS_DOT_CLASS[status] ?? "bg-border";
}
