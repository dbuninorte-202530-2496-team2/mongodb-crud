export function normalizeString(n) {
	return String(n).trim().replace(/\s+/g, " ").toLowerCase();
}
