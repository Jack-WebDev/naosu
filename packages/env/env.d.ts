interface ImportMetaEnv {
	readonly VITE_SERVER_URL: string;
	readonly MODE?: string;
	readonly DEV?: boolean;
	readonly PROD?: boolean;
	readonly [key: string]: string | boolean | number | undefined;
}

// biome-ignore lint/correctness/noUnusedVariables: biome-ignore lint: false positive
interface ImportMeta {
	readonly env: ImportMetaEnv;
}
