const fs = require('fs');
const process = require('process');
const raw = fs.readFileSync(process.argv[2], 'utf-8');
const lines = raw.trim().split(/\n/);

function sum(values: number[]): number {
	let total = 0;
	for (const v of values) total+= v;
	return total;
}

function bitmap(str: string | string[], chr: string): number {
	let b = 0;
	for (const c of str) {
		b = b << 1;
		if (c === chr) b += 1;
	}
	return b;
}

function countBits(v: number): number {
	let count = 0;
	let n = v;
	while (n) {
		count += n & 1;
		n = n >> 1;
	}
	return count;
}

type Coord = {
	x: number;
	y: number;
}

class Grid {
	// [y][x]
	data: string[] = [];
	width: number = 0;
	height: number = 0;
	emptySpaces: { x: number[], y: number[] } | null = null;;

	constructor(lines: string[]) {
		this.data = lines;
		this.height = this.data.length;
		this.width = this.data[0]!.length;
	}

	static parse(lines: string[]): Grid[] {
		const grids: Grid[] = [];
		let _lines: string[] = [];

		for (const line of lines) {
			if (line.trim() === '') {
				grids.push(new Grid(_lines));
				_lines = [];
			} else {
				_lines.push(line);
			}
		}
		
		if (_lines.length > 0) grids.push(new Grid(_lines));
		
		return grids;
	}

	get(coord: Coord): string | undefined {
		return this.data[coord.y]?.[coord.x];
	}

	/**
	 * Returns the bitmap of the vertical from top to bottom.
	 */
	vertical(x: number): number {
		let chars: string[] = [];
		for (let y = 0; y < this.height; y++) {
			chars.push(this.get({x, y})!);
		}
		return bitmap(chars, '#');
	}

	/**
	 * Returns the bitmap of the horizontal from left to right.
	 */
	horizontal(y: number): number {
		let chars: string[] = [];
		for (let x = 0; x < this.width; x++) {
			chars.push(this.get({x, y})!);
		}
		return bitmap(chars, '#');
	}

	get verticals(): number[] {
		const result: number[] = [];
		for (let x = 0; x < this.width; x++) {
			result.push(this.vertical(x));
		}
		// console.log('verticals', result);
		return result;
	}

	get horizontals(): number[] {
		const result: number[] = [];
		for (let y = 0; y < this.height; y++) {
			result.push(this.horizontal(y));
		}
		// console.log('horizontals', result);
		return result;
	}
}

function mirrorIndex(values: number[], smudges: number): number {
	// console.log('mirrorIndex', values);
	for (let i = 1; i < values.length; i++) {
		const left = values.slice(0, i);
		const right = values.slice(i, values.length);
		if (areReflections(smudges, left, right)) {
			return i;
		}
	}
	
	// no reflection found
	return 0;
}

function areReflections(smudges: number, left: number[], right: number[]): boolean {
	let result = 0;
	const length = Math.min(left.length, right.length);
	for (let i = 0; i < length; i++) {
		const leftValue = left[(left.length - 1) - i];
		const rightValue = right[i];
		const diff = leftValue ^ rightValue;
		const bitdiff = countBits(diff);
		result += bitdiff;
		// console.log('comparing bits')
		// console.log(leftValue.toString(2));
		// console.log(rightValue.toString(2));
		// console.log('= ', bitdiff);
	}
	// console.log('comparing', left, right, result);
	return result === smudges;
}

const grids: Grid[] = Grid.parse(lines);

const part1 = (() => {
	const v = sum(grids.map(g => mirrorIndex(g.verticals, 0)));
	const h = sum(grids.map(g => mirrorIndex(g.horizontals, 0) * 100));
	const total = v + h;
	return { v, h, total };
})();

const part2 = (() => {
	const v = sum(grids.map(g => mirrorIndex(g.verticals, 1)));
	const h = sum(grids.map(g => mirrorIndex(g.horizontals, 1) * 100));
	const total = v + h;
	return { v, h, total };
})();

console.log(JSON.stringify({part1, part2}, null, 2));
