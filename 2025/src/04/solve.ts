import { lines, Grid, Coord } from '../common/index.js';

const ROLL = '@';

const map = Grid.parse(lines);

function countPopulatedNeighbors(coord) {
	return Array.from(
		map.neighbors(coord).filter(c => map.get(c) === ROLL)
	).length;
}

function canBeAccessed(coord) {
	if (map.get(coord) !== ROLL) return false;
	return countPopulatedNeighbors(coord) < 4;
}

function part1() {
	let total = 0;
	for (const coord of map.coords) {
		total += canBeAccessed(coord) ? 1 : 0;
	}
	return total;
}

function part2() {
	let totalRemoved = 0;
	let removalList: Coord[] = [];

	do {
		totalRemoved += removalList.length;

		// separate remove aggregation from actual removal to prevent
		// removal from changing the math (counting) as we go.
		removalList = Array.from(map.coords).filter(c => canBeAccessed(c));
		for (const c of removalList) {
			map.set(c, '.');
		}
	} while (removalList.length > 0);

	return totalRemoved;
}

console.log('part 1', part1());
console.log('part 2', part2());