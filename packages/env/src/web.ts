import { z } from "zod";

const envSchema = z.object({
	VITE_SERVER_URL: z.url(),
});

const parsed = envSchema.safeParse(import.meta.url);

if (!parsed.success) {
	console.error(z.treeifyError(parsed.error));
	throw new Error("Invalid environment variables");
}

export const env = parsed.data;
