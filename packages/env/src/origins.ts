function getLoopbackVariants(origin: string) {
	const url = new URL(origin);

	if (url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
		return [origin];
	}

	const localHosts = ["localhost", "127.0.0.1"];

	return localHosts.map((hostname) => {
		const variant = new URL(origin);
		variant.hostname = hostname;
		return variant.toString().replace(/\/$/, "");
	});
}

export function getAllowedOrigins(primaryOrigin: string) {
	return [...new Set(getLoopbackVariants(primaryOrigin))];
}
