// Windows failing to recognize `require` ... ? ... 

// @ts-ignore
const fs = require('fs');
// @ts-ignore
const process = require('process');

const raw = fs.readFileSync(process.argv[2], 'utf-8');
const lines = raw.split(/\n/) as string[];

// const rawExpected = fs.readFileSync(process.argv[2] + '-expected', 'utf-8');
// const linesExpected = rawExpected.split(/\n/) as string[];

// console.log(raw.length);

type Direction = 'north' | 'south' | 'east' | 'west';

type Coord = { x: number, y: number };

class Pipe {
	char: string = '';
	north: boolean = false;
	south: boolean = false;
	east: boolean = false;
	west: boolean = false;

	constructor(char: string, ...directions: Direction[]) {
		this.char = char;
		for (const d of directions) {
			this[d] = true;
		}
	}

	get isOrigin() {
		return false;
	}

	get isOpen() {
		return this.north || this.south || this.east || this.west;
	}
};

class Start extends Pipe {
	north: boolean = true;
	south: boolean = true;
	east: boolean = true;
	west: boolean = true;

	constructor() {
		super('S');
	}

	get isOrigin() {
		return true;
	}
}

const PipeSymbols = {
	'|': () => new Pipe('║', 'north', 'south'),
	'-': () => new Pipe('═', 'east', 'west'),
	'L': () => new Pipe('╚', 'north', 'east'),
	'J': () => new Pipe('╝', 'north', 'west'),
	'7': () => new Pipe('╗', 'south', 'west'),
	'F': () => new Pipe('╔', 'south', 'east'),
	'.': () => new Pipe('.'),
	'S': () => new Start()
} as const;

class PipeMap {
	// y, x mapped
	map: Pipe[][] = [];
	start!: Coord;
	width: number = 0;
	height: number = 0;

	constructor(lines: string[]) {
		this.height = lines.length;
		for (let y = 0; y < lines.length; y++) {
			const row: Pipe[] = [];
			this.map[y] = row;
			const rowData = lines[y];
			for (let x = 0; x < rowData.length; x++) {
				const c = rowData[x];
				const pipe = PipeSymbols[c as keyof typeof PipeSymbols]();
				row[x] = pipe;
				if (pipe.isOrigin) this.start = { x, y };
			}
			this.width = Math.max(this.width, row.length);
		}
	}

	/**
	 * Get a Pipe entry from a specific x, y coord.
	 */
	get(coord: Coord): Pipe | undefined {
		return this.map[coord.y]?.[coord.x];
	}

	/**
	 * Get a list of Pipe entries connected to a given x, y coord.
	 * 
	 * @param x 
	 * @param y 
	 */
	connected(coord: Coord): Coord[] {
		const connected: Coord[] = [];
		const pipe = this.get(coord);

		if (pipe?.north) {
			const c = {x: coord.x, y: coord.y - 1};
			const q = this.get(c);
			if (q?.south) connected.push(c);
		};
		
		if (pipe?.south) {
			const c = {x: coord.x, y: coord.y + 1};
			const p = this.get(c);
			if (p?.north) connected.push(c);
		};

		if (pipe?.east) {
			const c = {x: coord.x + 1, y: coord.y};
			const p = this.get(c);
			if (p?.west) connected.push(c);
		};

		if (pipe?.west) {
			const c = {x: coord.x - 1, y: coord.y}
			const p = this.get(c);
			connected.push(c);
		}

		return connected;
	}

	adjacent(coord: Coord): Pipe[] {
		return [
			this.get({x: coord.x, y: coord.y - 1}),
			this.get({x: coord.x, y: coord.y + 1}),
			this.get({x: coord.x - 1, y: coord.y}),
			this.get({x: coord.x + 1, y: coord.y})
		].filter(p => p) as Pipe[]
	}

	toGrid() {
		// console.log(`${this.width} x ${this.height}`);
		const output: string[] = [];
		for (let y = 0; y < this.height; y++) {
			const line: string[] = [];
			for (let x = 0; x < this.width; x++) {
				const pipe = this.get({x, y})!;
				line.push(pipe.char);
			}
			output.push(line.join(''));
		}
		return output;
	}
}

class RawMap {
	// y, x mapped
	map: string[][] = [];
	width: number = 0;
	height: number = 0;

	constructor(lines: string[]) {
		this.height = lines.length;
		for (let y = 0; y < lines.length; y++) {
			const row: string[] = [];
			this.map[y] = row;
			const rowData = lines[y];
			for (let x = 0; x < rowData.length; x++) {
				const c = rowData[x];
				row[x] = c;
			}
			this.width = Math.max(this.width, row.length);
		}
	}

	/**
	 * Get a Pipe entry from a specific x, y coord.
	 */
	get(coord: Coord): string | undefined {
		return this.map[coord.y]?.[coord.x];
	}

	isInside(coord: Coord): boolean {
		return this.get(coord) === 'I';
	}
}

class Creature {
	path: Coord[] = [];
	visited = new Set<Pipe>();
	position: Coord;
	
	constructor(public map: PipeMap) {
		this.position = map.start;
		this.path.push(this.position);
		this.visited.add(this.map.get(this.position)!)
	}

	step() {
		const connected = this.map.connected(this.position);
		for (const position of connected) {
			const nextPipe = this.map.get(position)!;
			if (!this.visited.has(nextPipe)) {
				this.visited.add(nextPipe);
				this.path.push(position);
				this.position = position;
				return true;
			}
		}
		// console.log(this.position, connected, connected.filter(c => this.visited.has(this.map.get(c)!)));
		return false;
	}

	toGrid(hightlight: Set<Pipe>, marker: string) {
		// console.log(`${this.map.width} x ${this.map.height}`);
		const output: string[] = [];
		for (let y = 0; y < this.map.height; y++) {
			const line: string[] = [];
			for (let x = 0; x < this.map.width; x++) {
				const pipe = this.map.get({x, y})!;
				if (this.visited.has(pipe)) {
					if (hightlight.has(pipe)) {
						line.push('X'); // conflict
					} else {
						line.push(pipe.char);
					}
				} else {
					if (hightlight.has(pipe)) {
						line.push(marker);
					} else {
						line.push('.');
					}
				}
			}
			output.push(line.join(''));
		}
		return output;
	}
}

function countEastLinesLookingNorth(creature: Creature, coord: Coord): number {
	let count = 0;
	for (let y = 0; y < coord.y; y++) {
		const pipe = map.get({x: coord.x, y});
		if (pipe && creature.visited.has(pipe) && pipe.east) count++;
	}
	return count;
}

function isEven(v: number): boolean {
	return v % 2 === 0;
}

function isOnTheEdge(coord: Coord): boolean {
	return (
		coord.x === 0
		|| coord.y === 0
		|| coord.x === map.width - 1
		|| coord.y === map.height - 1
	);
}

// const expecteds = new RawMap(linesExpected);
const map = new PipeMap(lines);
const creature = new Creature(map);
while (creature.step()) {}

function part1() {
	return creature.path.length / 2;
}

function part2() {
	// console.log(map.toGrid(), creature.path);
	const outsiders = new Set<Pipe>();
	const insiders = new Set<Pipe>();
	for (let x = 0; x < map.width; x++) {
		for (let y = 0; y < map.height; y++) {
			const coord = {x, y};
			const pipe = map.get(coord);

			if (!pipe) {
				// console.log(`no pipe at ${x}, ${y}`);
				// if (expecteds.isInside(coord)) console.log(`MISMATCH! A ${x}, ${y}`);
				continue
			};

			// ultimately, a coord is "inside" the loop if it crosses an odd number
			// of lines along both axes. we can make the search a little shorter if we
			// we short circuit (SC) in a couple of ways first.
			
			// if the coord is on the path, it's "outside", but not "outside" for
			// the purposes of adjancy checks. so, we skip it.
			if (creature.visited.has(pipe)) {
				// console.log(`pipe at ${x}, ${y} is on the path`);
				// if (expecteds.isInside(coord)) console.log(`MISMATCH! B ${x}, ${y}`);
				continue
			};

			// SC: if the coord is on the edge, it's outside.
			if (isOnTheEdge(coord)) {
				// console.log(`pipe at ${x}, ${y} is on the edge`);
				// if (expecteds.isInside(coord)) console.log(`MISMATCH! C ${x}, ${y}`);
				outsiders.add(pipe);
				continue;
			}

			// two potential adjancy checks to follow
			const adjacentPipes = map.adjacent(coord);

			// SC: if the coord is adjacent to an outside coord, it's outside.
			if (adjacentPipes.some(p => outsiders.has(p))) {
				// console.log(`pipe at ${x}, ${y} is adjacent to an outsider`);
				// if (expecteds.isInside(coord)) {
				// 	console.log(`MISMATCH! D ${x}, ${y}`, adjacentPipes.filter(p => outsiders.has(p)));
				// }
				outsiders.add(pipe);
				continue;
			}

			// SC: if the coord is adjacent to an inside coord, it's inside.
			if (adjacentPipes.some(p => insiders.has(p))) {
				// console.log(`pipe at ${x}, ${y} is adjacent to an insider`);
				insiders.add(pipe);
				continue;
			}

			// if the coord crosses an even number of lines to any edge, it's outside.
			// for simplicity, we'll just search to the north and count the number of
			// pipes open to the "east" we cross. north+south pipes aren't "lines" that
			// intersect our north/south traversal. and if we encounter an corner, it
			// only counts as an intersecting line if it has a corresponding corner to
			// the opposite east/west direction. whenever this isn't the case, it means
			// there's a vertical line above us that enters and leaves from the same
			// direction, and has no bearing on whether we're inside or outside.
			const linesCrossed = countEastLinesLookingNorth(creature, coord);
			if (isEven(linesCrossed)) {
				// console.log(`pipe at ${x}, ${y} is outside, crosses even number of lines(${linesCrossed})`);
				// if (expecteds.isInside(coord)) console.log(`MISMATCH! E ${x}, ${y}`);
				outsiders.add(pipe);
			} else {
				// if no "outside" conditions have been met, it's "inside".
				// console.log(`pipe at ${x}, ${y} is inside, crosses odd number of lines(${linesCrossed})`);
				insiders.add(pipe);
			}
		}
	}
	// console.log(creature.toGrid(insiders, 'I'))
	return insiders.size;
}

(async () => {
	console.log({
		part1: await part1(),
		part2: await part2()
	});	
})();
