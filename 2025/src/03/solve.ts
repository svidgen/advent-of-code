import { digitsFrom, lines, sum } from '../common/index.js';

const banks = lines.map(line => digitsFrom(line));

class DigitSearch {
	/**
	 * Highest value looking to the right with `n` digits starting at the given index `i`.
	 * 
	 * [n][i]
	 */
	maxLookingRight: number[][] = [];
	
	constructor(
		public values: number[],
	) {
		this.index();
	}

	index() {
		let max = 0;
		for (let n = 1; n <= 12; n++) {
			for (let i = this.values.length - n; i >= 0; i--) {
				this.maxLookingRight[n] = this.maxLookingRight[n] || [];
				const v = n === 1 ? this.values[i] : (10**(n-1) * this.values[i]) + (this.maxLookingRight[n - 1][i + 1] || 0);
				if (v > max) max = v;
				this.maxLookingRight[n][i] = max;
			}
		}
	}	

	findBiggestNDigitInt(n: number) {
		return this.maxLookingRight[n][0];
	}
}

function maxJoltage(bank: number[], digits: number) {
	const w = new DigitSearch(bank);
	return w.findBiggestNDigitInt(digits);
}

function part1() {
	const joltages = banks.map(b => maxJoltage(b, 2));
	return sum(joltages);
}

function part2() {
	const joltages = banks.map(b => maxJoltage(b, 12));
	return sum(joltages);
}

console.log('part 1', part1());
console.log('part 2', part2());