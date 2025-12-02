import { lines } from '../common/index.js';

const DIAL_SIZE = 100;
const turns = lines.map(line =>
	line.startsWith('L') ? parseInt(line.substring(1)) * -1 :
	line.startsWith('R') ? parseInt(line.substring(1)) : undefined
).filter(d => typeof d === 'number' ? true : false) as number[];

function part1() {
	let atZero = 0;
	let position = 50;
	for (const turn of turns) {
		position = (position + turn) % DIAL_SIZE;
		if (position === 0) atZero++;
	}
	return atZero;
}

console.log('part 1', part1());