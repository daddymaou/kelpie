export interface CliRenderer {
	print(line: string): void;
	printError(line: string): void;
	clear(): void;
}

export class PlainRenderer implements CliRenderer {
	print(line: string): void {
		process.stdout.write(`${line}\n`);
	}

	printError(line: string): void {
		process.stderr.write(`${line}\n`);
	}

	clear(): void {
		// No-op for plain output.
	}
}
