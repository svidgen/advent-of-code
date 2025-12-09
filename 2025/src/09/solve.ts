import { byValue, lines, selfJoin } from '../common/index.js';

const coords = lines.map(line => line.split(',').map(n => parseInt(n)));

/**
 * Different than "real" area, since we're measuring between blocks; not *points*.
 * 
 * I.e., 1,1 -> 1,2 has a width of 2 and a height of 1. If we were dealing with
 * *points*, it would have a width of 1 and a height of 0. :D
 * 
 * @param a 
 * @param b 
 * @returns 
 */
function blockArea(a: number[], b: number[]) {
	const width = Math.abs(1 + a[0] - b[0]);
	const height = Math.abs(1 + a[1] - b[1]);
	return width * height;
}

function part1() {
	return selfJoin(coords)
		.map(({ a, b }) => blockArea(a, b))
		.sort(byValue).pop();
}

console.log('part 1', part1())