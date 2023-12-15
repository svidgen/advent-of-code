const fs = require('fs');
const process = require('process');
const raw = fs.readFileSync(process.argv[2], 'utf-8');
const lines = raw.trim().split(/\n/);

function sum(values: number[]): number {
	let total = 0;
	for (const v of values) total+= v;
	return total;
}

type Coord = {
	x: number;
	y: number;
}

class Grid {
	// [y][x]
	data: string[][] = [];
	width: number = 0;
	height: number = 0;
	emptySpaces: { x: number[], y: number[] } | null = null;;

	constructor(lines: string[]) {
		this.data = lines.map(line => line.split(''));
		this.height = this.data.length;
		this.width = this.data[0]!.length;
	}

	get(coord: Coord): string | undefined {
		return this.data[coord.y]?.[coord.x];
	}

	set(coord: Coord, value: string) {
		// @ts-ignore
		this.data[coord.y][coord.x] = value;
	}

	vertical(x: number): string[] {
		let chars: string[] = [];
		for (let y = 0; y < this.height; y++) {
			chars.push(this.get({x, y})!);
		}
		return chars;
	}

	setVertical(x: number, v: string[]) {
		for (let y = 0; y < this.height; y++) {
			this.set({x,y}, v[y]);
		}
	}

	setHorizontal(y: number, h: string[]) {
		for (let x = 0; x < this.width; x++) {
			this.set({x,y}, h[x]);
		}
	}

	horizontal(y: number): string[] {
		let chars: string[] = [];
		for (let x = 0; x < this.height; x++) {
			chars.push(this.get({x, y})!);
		}
		return chars;
	}

	get verticals(): string[][] {
		const result: string[][] = [];
		for (let x = 0; x < this.width; x++) {
			result.push(this.vertical(x));
		}
		return result;
	}

	set verticals(v: string[][]) {
		for (let x = 0; x < this.width; x++) {
			this.setVertical(x, v[x]);
		}
	}

	get horizontals(): string[][] {
		const result: string[][] = [];
		for (let y = 0; y < this.height; y++) {
			result.push(this.horizontal(y));
		}
		return result;
	}

	set horizontals(h: string[][]) {
		for (let y = 0; y < this.height; y++) {
			this.setHorizontal(y, h[y]);
		}
	}

	shift(direction: string) {
		switch (direction) {
			case 'north':
				this.verticals = this.verticals.map(v => shift(v));
				break;
			case 'south':
				this.verticals = this.verticals.map(v => shift(v.reverse()).reverse());
				break;
			case 'west':
				this.horizontals = this.horizontals.map(h => shift(h));
				break;
			case 'east':
				this.horizontals = this.horizontals.map(h => shift(h.reverse()).reverse());
				break;
			default:
				break;
		}
	}

	rotate() {
		this.shift('north');
		this.shift('west');
		this.shift('south');
		this.shift('east');
	}

	get score() {
		let points = 0;
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const c = this.get({x, y});
				if (c === 'O') {
					points += this.height - y;
				}
			}
		}
		return points;
	}

	toString() {
		return this.data.map(line => line.join('')).join('\n');
	}

}

function shift(line: string[]): string[] {
	let shifted: string[] = [];
	let openIndex = 0;
	for (let i = 0; i < line.length; i++) {
		const c = line[i]!;
		switch (c) {
			case 'O':
				shifted[i] = '.';
				shifted[openIndex] = 'O';
				openIndex += 1;
				break;
			case '#':
				shifted[i] = '#';
				openIndex = i + 1;
				break;
			default:
				shifted[i] = '.';
				break;
		}
	}
	return shifted;
}

const part1 = (() => {
	const grid: Grid = new Grid(lines);
	grid.shift('north');
	return grid.score;
})();

const part2 = (() => {
	const grid: Grid = new Grid(lines);
	const MAX_ITERS = 1000;
	let i = 0;
	let scores: number[] = [0,1];
	while (scores.some(s => s !== scores[0]) && i < MAX_ITERS) {
		grid.rotate();
		scores.push(grid.score);
		if (scores.length > 100) scores.shift();
		i++;
	}
	return {scores: scores.map((v, idx) => `${idx}: ${v}`), i};
})();

console.log(JSON.stringify({part1, part2}, null, 2));
