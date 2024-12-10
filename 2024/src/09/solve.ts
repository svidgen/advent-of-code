import { raw, digitsFrom } from '../common/index.js';

/**
 * A set of contiguous blocks belonging to one file.
 */
class Fragment {
	constructor(
		public fileNumber: number,
		public size: number,
		public free: number = 0
	) {}

	public sum(blockStart: number) {
		let sum = 0;
		for (let i = 0; i < this.size; i++) {
			sum += this.fileNumber * (blockStart + i);
		}
		return sum;
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
		return 0;
	}
	return idx / 2;
}

function isFreeSpaceIndex(idx: number): boolean {
	return idx % 2 === 1;
}

function part1() {
	const diskMap = digitsFrom(raw);
	const fragments: Fragment[] = [];

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
	return fragments;
}

function part2() {
	const diskMap = digitsFrom(raw);
	const fragments: Fragment[] = [];

	for (let i = 0; i < diskMap.length; i++) {
		fragments.push(new Fragment(
			isFreeSpaceIndex(i) ? 0 : i / 2,
			diskMap[i],
			isFreeSpaceIndex(i) ? diskMap[i] : 0
		));
	}

	for (const rightFrag of [...fragments].reverse()) {
		if (rightFrag.fileNumber === 0) continue;
		for (const leftFrag of fragments) {
			if (leftFrag === rightFrag) break;
			if (leftFrag.free === rightFrag.size) {
				leftFrag.free = 0;
				leftFrag.fileNumber = rightFrag.fileNumber;
				rightFrag.fileNumber = 0;
				break;
			} else if (leftFrag.free > rightFrag.size) {
				// split it ... :/ ...
				const splitOutSize = leftFrag.size - rightFrag.size;
				leftFrag.size = rightFrag.size;
				leftFrag.free = 0;
				leftFrag.fileNumber = rightFrag.fileNumber;
				fragments.splice(fragments.indexOf(leftFrag) + 1, 0, new Fragment(
					0,
					splitOutSize,
					splitOutSize
				));
				rightFrag.fileNumber = 0;
				// fragment split means we need to adjust i.
				break;
			}
		}
	}
	
	return fragments;
}

function checksum(fragments: Fragment[]): number {
	let sum = 0;
	let blockStart = 0;
	for (const fragment of fragments) {
		sum += fragment.sum(blockStart);
		blockStart += fragment.size;
	}
	return sum;
}

// console.log(diskMap, fragments, sum);
console.log('part 1', checksum(part1()));
console.log('part 2', checksum(part2()));