export function normalizeString(n: string): string {
	return String(n).trim().replace(/\s+/g, " ").toLowerCase();
}