declare global {
	namespace App {}

	interface Window {
		pagefind?: {
			search(query: string): Promise<{
				results: Array<{
					data(): Promise<{ url: string }>;
				}>;
			}>;
		};
	}
}

export {};
