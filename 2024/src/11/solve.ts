import { raw, sum } from '../common/index.js';

const stones = raw.trim().split(' ').map(n => BigInt(n));

const memos = new Map<string, number>();

/**
 * Performs the "blink" operation against a single stone a number of times,
 * returning the *number* of stones present after the blink.
 * 
 * @param stone The number on the stone.
 * @param times The number of times to blink.
 */
function blink(stone: BigInt, times: number): number {
	if (times === 0) return 1;

	if (stone === 0n) {
		return blink(1n, times - 1);
	}

	const key = `${times}x${stone}`;
	if (memos.has(key)) {
		return memos.get(key)!;
	}

	let result = 0;
	const asString = stone.toString();
	if (asString.length % 2 === 0) {
		const left = BigInt(asString.substring(0, (asString.length) / 2));
		const right = BigInt(asString.substring(asString.length / 2));
		// return [...blink(left, times - 1), ...blink(right, times - 1)];
		// @ts-ignore
		result = blink(left, times - 1) + blink(right, times - 1);
	} else {
		// @ts-ignore TS doesn't like the BigInt multiplication.
		result = blink(stone * 2024n, times - 1);
	}

	memos.set(key, result);
	return result;
}

// function test() {
// 	for (let i = 0; i <= 6; i++) {
// 		console.log(i, stones.map(s => blink(s, i)));
// 	}
// }

function part1() {
	return sum(stones.map(s => blink(s, 25)));
}

function part2() {
	return sum(stones.map(s => blink(s, 75)));
}

console.log(part1());
console.log(part2());