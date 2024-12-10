import { raw, digitsFrom } from '../common/index.js';

const diskMap = digitsFrom(raw);
console.log(diskMap, diskMap.length);

const fragments: Fragment[] = [];

/**
 * A set of contiguous blocks belonging to one file.
 */
class Fragment {
	constructor(
		public fileNumber: number,

		/**
		 * The number of blocks in the fragment
		 */
		public size: number
	) {}

	/**
	 * The checksum for each "block" is fileID * block number.
	 * 
	 * If there are `B` blocks from file `F` starting as position `P`, where
	 * `N = B - 1` (we start counting from 0):
	 * 
	 * ```
	 * f(N, F, P) = F * P + F * (P + 1) + F * (P + 2) + ... + F * (P + N)
	 * ```
	 * 
	 * If we factor `F` out, that's:
	 * 
	 * ```
	 * f(N, F, P) = F * [P + (P + 1) + (P + 2) + ... + (P + N)]
	 *            = F * [P + (P + 1) + (P + 2) + ... + (P + N)]
	 *            = F * [(P * B) + (0 + 1 + 2 + ... N)]
	 *            = F * {(P * B) + [N(N + 1)/2]}
	 * ```
	 * 
	 * For the last simplification step, this is just the closed form of `sum(0 ... N)`.
	 * 
	 * For our purposes, this probably doesn't save any meaningful computation (if at all).
	 * But, since we *can* use some math here, may as well exercise the math muscle a litte.
	 * 
	 * @param blockStart 
	 * @returns 
	 */
	public sum(blockStart: number) {
		const F = this.fileNumber;
		const P = blockStart;
		const S = this.size;
		const N = S - 1;
		return F * ( P * S + ( N * (N + 1) ) / 2);
	}

	toString() {
		return new Array(this.size).fill(this.fileNumber).join('');
	}
}

function isFileIndex(idx: number): boolean {
	return idx % 2 === 0;
}

function fileId(idx: number): number {
	if (!isFileIndex(idx)) {
		throw new Error(`Tried to get filename from non-file index: ${idx}.`)
	}

	return idx / 2;
}

function isFreeSpaceIndex(idx: number): boolean {
	return idx % 2 === 1;
}

let i_left = 0;
let i_right = diskMap.length - 1;
while (i_left <= i_right) {
	if (isFileIndex(i_left)) {
		fragments.push(new Fragment(fileId(i_left), diskMap[i_left]));
		diskMap[i_left] = 0; // so we can see what has been consumed
		i_left++;
		continue;
	}

	if (diskMap[i_left] === 0) {
		i_left++;
		continue;
	}

	if (isFreeSpaceIndex(i_right) || diskMap[i_right] === 0) {
		diskMap[i_right] = 0;
		i_right--;
		continue;
	}

	// figure out how many blocks we can move
	const fileBlocks = diskMap[i_right];
	const freeBlocks = diskMap[i_left];
	const blocksToMove = Math.min(fileBlocks, freeBlocks);

	// push the fragment
	fragments.push(new Fragment(fileId(i_right), blocksToMove));

	// "move the blocks" (update the disk map)
	diskMap[i_left] -= blocksToMove;
	diskMap[i_right] -= blocksToMove;
}

let sum = 0;
let blockStart = 0;
for (const fragment of fragments) {
	console.log(`block ${blockStart}, fragment ${fragment}, score ${fragment.sum(blockStart)}`);
	sum += fragment.sum(blockStart);
	blockStart += fragment.size;
}

console.log(diskMap, fragments, sum);