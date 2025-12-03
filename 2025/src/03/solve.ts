import { digitsFrom, lines, sum } from '../common/index.js';

console.log(lines);

class DigitSearch {
	/**
	 * Highest value looking to the right starting at the given index.
	 */
	maxLookingRight: number[] = [];
	
	constructor(
		public values: number[],
	) {
		this.index();
	}

	index() {
		let max = 0;
		for (let i = this.values.length - 1; i >= 0; i--) {
			if (this.values[i] > max) max = this.values[i];
			this.maxLookingRight[i] = max;
		}
	}

	findBiggestTwoDigitInt() {
		let max: number = 0;
		for (let i = 0; i < this.values.length - 1; i++) {
			const v = this.values[i] * 10 + this.maxLookingRight[i + 1];
			if (v > max) max = v;
		}
		return max;
	}
}

function maxJoltage(bank: number[]) {
	const w = new DigitSearch(bank);
	return w.findBiggestTwoDigitInt();
}

function part1() {
	const banks = lines.map(line => digitsFrom(line));
	const joltages = banks.map(b => maxJoltage(b));
	return sum(joltages);
}

console.log('part 1', part1());