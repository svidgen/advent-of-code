import { lines, sum } from '../common/index.js';

function solve() {
	/**
	 * Simple counter for the number of times a split occurs for part 1.
	 */
	let count = 0;

	/**
	 * State to count the number of beam "timelines" coming into each position
	 * individually.
	 * 
	 * For part 1, this would only need to be a boolean to track whether there
	 * *is* a beam. For part 2, we need to know specifically how many there are.
	 */
	let state : number[] | undefined = undefined;

	for (const line of lines) {
		if (state === undefined) {
			state = line.split('').map(c => c === 'S' ? 1 : 0);
			continue;
		}
		const splits = line.split('').map(c => c === '^' ? true : false);
		for (let i = 0; i < splits.length; i++) {
			if (splits[i] && state[i]) {
				if (i > 0) state[i - 1] += state[i];
				if (i < state.length - 1) state[i + 1] += state[i];
				state[i] = 0;
				count++; // part 1
			}
		}
	}
	return {
		part1: count,
		part2: sum(state!)
	};
}

const { part1, part2 } = solve();

console.log('part 1', part1);
console.log('part 2', part2);
