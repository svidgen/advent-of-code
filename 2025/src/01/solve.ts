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
		// technically wrong, as this produces negatives. but, doesn't actually
		// matter for our purposes whether we refer to 90 as 90 or -10. 🤷
		position = (position + turn + DIAL_SIZE) % DIAL_SIZE;
		if (position === 0) atZero++;
	}
	return atZero;
}

function part2() {
	let atZero = 0;
	let position = 50;
	const log: Record<string, any>[] = [];
	for (const turn of turns) {
		// For this one, it makes more sense to my brain to care about the actual
		// position of the dial and eliminate the negative orientation.

		const newPosition = Math.abs((position + turn + DIAL_SIZE) % DIAL_SIZE);

		// account for number of FULL rotations
		const fullTurns = Math.floor(Math.abs(turn) / DIAL_SIZE);

		// account for additional zero-crossings
		const leftoverTurn = turn % DIAL_SIZE;
		const crossesRight = turn > 0 && (position + leftoverTurn) >= DIAL_SIZE ? 1 : 0;
		const crossesLeft = position > 0 && turn < 0 && (position + leftoverTurn) <= 0 ? 1 : 0;
		const totalCrosses = crossesLeft + crossesRight + fullTurns;
		const newAtZero = atZero + totalCrosses;

		// weird. example works. created tests cases and logged all edge cases i could think of.
		// seems right, but still the wrong answer ... 🤔 ... what am i missing?
		log.push({
			position,
			turn,
			newPosition,
			totalCrosses,
			newAtZero,
		});

		// new position.
		position = newPosition;
		atZero = newAtZero;
	}
	console.table(log);
	return atZero;
}

console.log('part 1: ', part1());
console.log('part 2: ', part2());