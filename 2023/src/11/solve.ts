const fs = require('fs');
const process = require('process');
const raw = fs.readFileSync(process.argv[2], 'utf-8');
const lines = raw.split(/\n/);

type Coord = {
	x: number;
	y: number;
}

class Grid {
	// [y][x]
	data: string[] = [];
	width: number = 0;
	height: number = 0;

	constructor(lines: string[]) {
		this.data = this.dilate(lines);
		this.height = this.data.length;
		this.width = this.data[y]!.length;
	}

	dilate(lines: string[]): string[] {
		const dilated: string[] = [];

		// first pass:
		//  1. expand vertically by doubling empty lines
		//  2. index columns that are empty

		// second pass
		//  1. insert characters into columns that are empty
	}

	get(coord: Coord): string | undefined {
		return this.data[coord.y]?.[coord.x];
	}

	get points(): Coord {
		const points: Coord[] = [];
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.data[y]!.length; x++) {
				if (this.get({x, y}) === '#') points.push({x, y});
			}
		}
		return points;
	}
}

function part1() {
	return lines;
}

function part2() {
	return "not yet implemented";
}

console.log({
	part1: part1(),
	part2: part2()
});
