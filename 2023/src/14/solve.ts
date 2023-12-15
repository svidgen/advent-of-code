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

	vertical(x: number): string {
		let chars: string[] = [];
		for (let y = 0; y < this.height; y++) {
			chars.push(this.get({x, y})!);
		}
		return chars.join('');
	}

	get verticals(): string[] {
		const result: string[] = [];
		for (let x = 0; x < this.width; x++) {
			result.push(this.vertical(x));
		}
		return result;
	}
}

function score(line: string): number {
	let points = 0;
	let openIndex = 0;
	for (let i = 0; i < line.length; i++) {
		const c = line[i]!;
		switch (c) {
			case 'O':
				// this is a rock that can slide up to the next open space.
				// simulate its slide by awarding points and "consuming" the openIndex.
				points += line.length - openIndex;

				// the rock then "fills" the open spot.
				openIndex += 1;
				break;
			case '#':
				// no points awarded for this rock, which is fixed in place. instead of
				// sliding up, it just sets the new open space, since any subsequent rocks
				// cannot slide past it.
				openIndex = i + 1;
				break;
			default:
				// nothing happens. we're in empty space.
		}
	}
	return points;
}

const grid: Grid = new Grid(lines);

const part1 = (() => {
	return sum(grid.verticals.map(v => score(v)));
})();

const part2 = (() => {
})();

console.log(JSON.stringify({part1, part2}, null, 2));
