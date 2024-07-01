export function isAlphanumeric(char: string) {
	// Use Unicode property escapes to match alphanumeric characters from any script
	const alphanumericPattern = /^[\p{Alphabetic}\p{Number}]+$/u;
	return alphanumericPattern.test(char);
}

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789"

export function generateRandomAlphanumeric(length: number, chars?: string): string {
	if (!chars) {
		chars = LOWERCASE + NUMBERS;
	}
    let result = '';
    const charactersLength = chars.length;

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Date.now() * Math.random() * charactersLength);
        result += chars.charAt(randomIndex);
    }

    return result;
}