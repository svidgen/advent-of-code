import { lines, Coord, Grid as BaseGrid } from '../common';

class Grid extends BaseGrid<string> {
	static parse(lines: string[]): Grid {
		return new Grid(BaseGrid.parse(lines).data);
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
	const grid: Grid = Grid.parse(lines);
	grid.shift('north');
	return grid.score;
})();

const part2 = (() => {
	const grid: Grid = Grid.parse(lines);
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
