import { blocks, InclusiveRange, sum } from '../common/index.js';

const [
	{ lines: linesOfFreshRanges },
	{ lines: linesOfAvailable }
] = blocks;

const freshIngredientRanges = InclusiveRange.sortByRangeEndAscending(
	linesOfFreshRanges.map(l => InclusiveRange.parse(l))
);
const availableIngredients = linesOfAvailable.map(l => parseInt(l));

function part1() {
	const fresh = availableIngredients
		.map(i => freshIngredientRanges.some(r => r.includes(i)))
		.filter(Boolean);
	return fresh.length;
}

function part2() {
	const combinedRanges: InclusiveRange[] = [];
	for (const range of freshIngredientRanges) { 		// already sorted
		const last = combinedRanges[combinedRanges.length - 1];
		if (last?.overlaps(range)) {
			combinedRanges[combinedRanges.length - 1] = last.combine(range);
		} else {
			combinedRanges.push(range);
		}
	}
	return sum(combinedRanges.map(r => r.length));
}

console.log('part 1', part1());
console.log('part 2', part2());