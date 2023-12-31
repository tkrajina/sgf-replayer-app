export function isAlphanumeric(char: string) {
	// Use Unicode property escapes to match alphanumeric characters from any script
	const alphanumericPattern = /^[\p{Alphabetic}\p{Number}]+$/u;
	return alphanumericPattern.test(char);
}
