import { blocks, InclusiveRange, sum } from '../common/index.js';

const [
	{ lines: linesOfFreshRanges },
	{ lines: linesOfAvailable }
] = blocks;

const freshIngredientRanges = linesOfFreshRanges.map(l => InclusiveRange.parse(l));
const availableIngredients = linesOfAvailable.map(l => parseInt(l));

function part1() {
	const fresh = availableIngredients
		.map(i => freshIngredientRanges.some(r => r.includes(i)))
		.filter(Boolean);
	return fresh.length;
}

/**
 * I initially made an assumption about ranges here that *just so happens* to work on my data.
 * I assumed that if a range overlaps with the previous range, I can just combine those two.
 * However, data could exist where range N overlaps with N - 1 and N - 2 (and more). E.g.,
 * 
 * ```
 * 2-4, 6-8, 3-9
 * ```
 * 
 * These three should boil down to 2-9. My initial solution would have boiled them down into
 * two ranges: 2-4, 3-9, which creates an overlap of 2. (3 and 4)
 * 
 * So, the algorithm here is more aggressive than is necessary for the 
 * 
 * I assumed that, after sorting ranges, 
 */
function part2() {
	const combinedRanges = InclusiveRange.boil(freshIngredientRanges);
	return sum(combinedRanges.map(r => r.length));
}

console.log('part 1', part1());
console.log('part 2', part2());