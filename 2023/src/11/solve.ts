const fs = require('fs');
const process = require('process');
const raw = fs.readFileSync(process.argv[2], 'utf-8');
const lines = raw.trim().split(/\n/);

type Coord = {
	x: number;
	y: number;
}

class Grid {
	// [y][x]
	data: string[] = [];
	width: number = 0;
	height: number = 0;
	emptySpaces: { x: number[], y: number[] };

	constructor(lines: string[]) {
		// this.data = this.dilate(lines);
		this.data = lines;
		this.height = this.data.length;
		this.width = this.data[0]!.length;
		this.emptySpaces = this.findEmptySpaces(lines);
	}

	findEmptySpaces(lines: string[]): {x: number[], y: number[]} {
		const x: number[] = [];
		const y: number[] = [];

		for (let _y = 0; _y < lines.length; _y++) {
			if (lines[_y].split('').every(c => c === '.')) {
				y.push(_y)
			}
		}

		for (let _x = 0; _x < lines[0].length; _x++) {
			const colChars = lines.map(line => line[_x]);
			if (colChars.every(c => c === '.')) {
				x.push(_x);
			}
		}

		return {x, y};
	}

	// naive original solution used for part 1
	dilate(lines: string[]): string[] {
		const dilated: string[] = [];

		//  1. expand vertically by doubling empty lines
		for (let y = 0; y < lines.length; y++) {
			dilated.push(lines[y]);
			if (lines[y].split('').every(c => c === '.')) {
				dilated.push(lines[y]);
			}
		}

		//  2. index columns that are empty
		const emptyColumns: number[] = [];
		for (let x = 0; x < lines[0].length; x++) {
			const colChars = lines.map(line => line[x]);
			if (colChars.every(c => c === '.')) {
				// we record the original column position *plus* the number of
				// columns that will have been inserted already. this makes the
				// process of actually inserting column characters simple.
				emptyColumns.push(x + emptyColumns.length);
			}
		}

		//  3. insert characters into columns that are empty
		for (let y = 0; y < dilated.length; y++) {
			const d = dilated[y].split('');
			for (const x of emptyColumns) {
				d.splice(x, 0, '.');
			}
			dilated[y] = d.join('');
		}

		return dilated;
	}

	get(coord: Coord): string | undefined {
		return this.data[coord.y]?.[coord.x];
	}

	findPoints(expansionFactor: number): Coord[] {
		const points: Coord[] = [];
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.data[y]!.length; x++) {
				if (this.get({x, y}) === '#') {
					points.push({
						x: x + this.emptySpaces.x
							.filter(_x => _x < x).length * (expansionFactor - 1),
						y: y + this.emptySpaces.y
							.filter(_y => _y < y).length * (expansionFactor - 1)
					});
				}
			}
		}
		return points;
	}

	getDistances(expansionFactor: number) {
		let distances: number[] = [];
		let totalDistance: number = 0;
		const points = this.findPoints(expansionFactor);
		for (let i = 0; i < points.length; i++) {
			const a = points[i];
			for (let j = i; j < points.length; j++) {
				const b = points[j];
				const distance = Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
				distances.push(distance);
				totalDistance += distance;
			}
		}

		return { distances, totalDistance };
	}
}

const grid = new Grid(lines);

function part1() {
	console.log('lines', '\n' + lines.join('\n'));
	console.log('grid', '\n' + grid.data.join('\n'));
	console.log('empty', grid.emptySpaces);
	// console.log('points', grid.findPoints());

	return grid.getDistances(2);
}

function part2() {
	return grid.getDistances(1_000_000);
}

console.log({
	part1: part1(),
	part2: part2()
});
