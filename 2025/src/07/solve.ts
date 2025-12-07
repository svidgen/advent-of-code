import { Grid, lines, sum, transposeArray } from '../common/index.js';

function part1() {
	let count = 0;
	let state : boolean[] | undefined = undefined;
	for (const line of lines) {
		if (state === undefined) {
			state = line.split('').map(c => c === 'S' ? true : false);
			continue;
		}

		const splits = line.split('').map(c => c === '^' ? true : false);
		for (let i = 0; i < splits.length; i++) {
			if (splits[i] && state[i]) {
				if (i > 0) state[i - 1] = true;
				if (i < state.length - 1) state[i + 1] = true;
				state[i] = false;
				count++;
			}
		}
	}
	return count;
}

function part2() {
}

console.log('part 1', part1());
console.log('part 2', part2());
