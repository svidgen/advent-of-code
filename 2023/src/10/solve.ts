// Windows failing to recognize `require` ... ? ... 

// @ts-ignore
const fs = require('fs');
// @ts-ignore
const process = require('process');

const raw = fs.readFileSync(process.argv[2], 'utf-8');
const lines = raw.split(/\n/) as string[];

console.log(raw.length);

type Direction = 'north' | 'south' | 'east' | 'west';

type Coord = { x: number, y: number };

class Pipe {
	north: boolean = false;
	south: boolean = false;
	east: boolean = false;
	west: boolean = false;

	constructor(...directions: Direction[]) {
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

	get isOrigin() {
		return true;
	}
}

const PipeSymbols = {
	'|': () => new Pipe('north', 'south'),
	'-': () => new Pipe('east', 'west'),
	'L': () => new Pipe('north', 'east'),
	'J': () => new Pipe('north', 'west'),
	'7': () => new Pipe('south', 'west'),
	'F': () => new Pipe('south', 'east'),
	'.': () => new Pipe(),
	'S': () => new Start()
} as const;

class PipeMap {
	// y, x mapped
	map: Pipe[][] = [];
	start!: Coord;

	constructor(lines: string[]) {
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

		if (pipe?.north) connected.push({x: coord.x, y: coord.y - 1});
		if (pipe?.south) connected.push({x: coord.x, y: coord.y + 1});
		if (pipe?.east) connected.push({x: coord.x + 1, y: coord.y});
		if (pipe?.west) connected.push({x: coord.x - 1, y: coord.y});

		return connected;
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
			const nextPipe = this.map.get(position);
			if (nextPipe?.isOpen && !this.visited.has(nextPipe)) {
				this.visited.add(nextPipe);
				this.path.push(position);
				this.position = position;
				return true;
			}
		}
		return false;
	}
}

const map = new PipeMap(lines);

function part1() {
	
	const creature = new Creature(map);
	while (creature.step()) {}
	return creature.path.length / 2;
}

async function part2() {
	return "not yet implemented";
}

(async () => {
	console.log({
		part1: await part1(),
		part2: await part2()
	});	
})();
