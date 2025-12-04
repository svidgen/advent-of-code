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

console.log('part 1', part1());