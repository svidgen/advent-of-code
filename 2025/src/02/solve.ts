import { raw } from '../common/index.js';

/**
 * If the ID consists entirely of a pair of repeating digits.
 * 
 * E.g.,
 * 
 * 11
 * 22
 * 1212
 * 123123
 * 4545
 * 
 * However, repetition of digits within a valid ID is OK. These are fine:
 * 
 * 110
 * 12123
 * 45454
 * 
 * Necessarily, IDs that are an odd-number of digits long are valid.
 * 
 * @param id 
 * @returns 
 */
function isInvalidPart1(id: number) {
	const asString = id.toString();

	// odd number of digits
	if (asString.length % 2 === 1) return false;

	const left = asString.substring(0, asString.length / 2);
	const right = asString.substring(asString.length / 2);

	// invalid if both halves are the same
	return left === right
}

/**
 * If the ID consists entirely of repeated sequences.
 * 
 * E.g.,
 * 
 * 11
 * 22
 * 111     // 1 three times
 * 121212  // 12 three times
 * 123123
 * 4545
 * 
 * However, repetition of digits within a valid ID is OK. These are fine:
 * 
 * 110
 * 12123
 * 45454
 * 
 * @param id 
 * @returns 
 */
function isInvalidPart2(id: number) {
	const asString = id.toString();
	for (let i = 1; i <= asString.length / 2; i++) {
		const candidateReptition = asString.length / i;
		if (!Number.isInteger(candidateReptition)) continue;
		const candidatePattern = asString.substring(0, i);
		const candidateMatch = Array(candidateReptition).fill(null).map(() => candidatePattern).join('');
		if (candidateMatch === asString) return true;
	}
	return false;
}

const rangeStrings = raw.trim().split(',');
const ranges = rangeStrings.map(s => s.split('-').map(p => parseInt(p)));

function run(isValid: (n: number) => boolean) {
	let total = 0;
	for (const [a, b] of ranges) {
		for (let id = a; id <= b; id++) {
			if (isValid(id)) total += id;
		}
	}
	return total;
}

console.log('part 1:', run(isInvalidPart1));
console.log('part 2:', run(isInvalidPart2));