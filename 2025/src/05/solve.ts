import { blocks, Range } from '../common/index.js';

const [
	{ lines: linesOfFreshRanges },
	{ lines: linesOfAvailable }
] = blocks;

const freshIngredientRanges = linesOfFreshRanges.map(l => Range.parse(l));
const availableIngredients = linesOfAvailable.map(l => parseInt(l));

function part1() {
	const fresh = availableIngredients
		.map(i => freshIngredientRanges.some(r => r.includes(i, { inclusiveEnd: true })))
		.filter(Boolean);
	return fresh.length;
}

console.log('part 1', part1());