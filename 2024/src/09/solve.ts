import { raw, digitsFrom, sum } from '../common/index.js';

const diskMap = digitsFrom(raw);

class Fragment {
	constructor(
		public blockStart: number,
		public fileNumber: number,

		/**
		 * The number of blocks.
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
	 * @param fileId 
	 * @param blockStart 
	 * @param blockWidth 
	 * @returns 
	 */
	public sum() {
		return this.fileNumber * (
			this.blockStart * this.size
			+ ( this.size * (this.size + 1) ) / 2
		);
	}
}

let i_left = 0;
let i_right = diskMap.length - 1;
let currentBlock = 0;
let sumOfBlocks = 0;
while (i_left < i_right) {
	// A "fragment" shall be a set of contiguous blocks belonging to a single file.

	// firstly, if the left-hand index points to already-defined file-space, we just
	// need to compute the "score" for that fragment and move the pointer. the index
	// belongs to a file already if it's even.
	if (i_left % 2 === 0) {
		// the index indicates the file ID. but, because indexes alternate
		// between files and free blocks, the file ID is *half* of the index.
		sumOfBlocks += fragmentSum(i_left / 2, currentBlock, diskMap[i_left]);

		// we're now looking at the block 
	}

	// secondly, if the right-hand index points to free space, we can just scan past it.
	// and, it indicates free space if it's an odd-numbered index.
	if (i_right % 2 === 1) {
		i_right--;
		continue;
	}
	

	// when moving blocks from the right to the left, we need to move the smaller of the
	// AVAILABLE blocks and the FREE blocks.
	const available = diskMap[i_right];
	const free = diskMap[i_left];
	const blocksToMove = Math.min(available, free);
}
