const fs = require('fs');
const raw = fs.readFileSync(0, 'utf-8');
const lines = raw.split('\n') as string[];

class SeedMap {
	constructor(
		public seeds: Seed[],
		public maps: CompoundMap[]
	) {}

	static parse(lines: string[]): SeedMap {
		const seeds = Seed.parse(lines.shift()!);

		// empty line
		lines.shift();

		const maps: CompoundMap[] = [];
		let m = CompoundMap.parse(lines);
		while (m) {
			maps.push(m);
			m = CompoundMap.parse(lines);
		}

		return new SeedMap(seeds, maps);
	}

	map(start: number): number {
		let end: number = start;
		for (const mapper of this.maps) {
			end = mapper.map(end);
		}
		return end;
	}

	get mapped() {
		return this.seeds.map(s => new Seed(this.map(s.id)));
	}
}

class Seed {
	constructor(
		public id: number
	) {}

	static parse(line: string): Seed[] {
		if (!line.startsWith('seeds:')) {
			throw new Error("Seeds data not found!");
		}
		const [_boiler, seedsText] = line.split(': ') as [string, string];
		const seeds = seedsText.split(/\s+/).map(s => new Seed(parseInt(s)));
		return seeds;
	}
}

class CompoundMap {
	constructor(
		public fromItem: string,
		public toItem: string,
		public maps: RangeMap[]
	) {}

	static parse(lines: string[]): CompoundMap | null {
		const peek = lines[0]?.match(/^([a-z])+-to-([a-z])+ map:/);
		if (!peek) return null

		// consume the line we already peeked.
		lines.shift();

		const [_, fromItem, toItem] = peek;

		const maps: RangeMap[] = [];
		let m = RangeMap.parse(lines);
		while (m) {
			maps.push(m);
			m = RangeMap.parse(lines);
		}

		return new CompoundMap(fromItem, toItem, maps);
	}

	map(v: number): number {
		for (const mapper of this.maps) {
			if (mapper.contains(v)) {
				return mapper.map(v);
			}
		}
		return v;
	}
}

class RangeMap {
	delta: number;
	rangeEnd: number;

	constructor(
		public source: number,
		public dest: number,
		public length: number
	) {
		this.delta = this.dest - this.source;
		this.rangeEnd = this.source + this.length;
	}

	static parse(lines: string[]): RangeMap | null {
		const line = lines.shift();
		if (!line || !line.trim()) return null;

		const [dest, source, length] = line
			.split(' ')
			.map(v => parseInt(v)) as [number, number, number]
		;

		return new RangeMap(source, dest, length);
	}

	contains(v: number): boolean {
		return v >= this.source && v < this.rangeEnd;
	}

	map(v: number): number {
		if (this.contains(v)) {
			console.log(`Map ${v} to ${v + this.delta} using`, this);
			return v + this.delta;
		}
		return v;
	}
}

const map = SeedMap.parse(lines);

function part1() {
	return Math.min(
		...map.mapped.map(s => s.id)
	);
}

console.log({
	part1: part1(),
});
