const fs = require('fs');
const raw = fs.readFileSync(0, 'utf-8');
const lines = raw.split('\n') as string[];

/**
 * Takes a list of lists of SeedRange and flattens it down into a list of SeedRanges
 */
function flatten(ranges: SeedRange[][]): SeedRange[] {
	const flattened: SeedRange[] = [];
	for (const range of ranges) {
		flattened.push(...range);
	}
	return flattened;
}

class SeedMap {
	constructor(
		public seeds: SeedRange[],
		public maps: CompoundMap[]
	) {}

	static parse(lines: string[]): SeedMap {
		const seeds = SeedRange.parse(lines.shift()!);

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

	get mapped() {
		let inputs: SeedRange[] = this.seeds;
		let outputs: SeedRange[] = [];
		for (const mapper of this.maps) {
			console.log(`mapping ${mapper.fromItem} -> ${mapper.toItem} ...`);
			outputs = [];
			for (const map of inputs) {
				console.log('  ' + JSON.stringify(map));
				outputs.push(...mapper.map(map));
			}
			inputs = outputs
		}
		return outputs;
	}
}

class SeedRange {
	constructor(
		public start: number,
		public length: number
	) {}

	static parse(line: string): SeedRange[] {
		if (!line.startsWith('seeds:')) {
			throw new Error("Seeds data not found!");
		}

		const [_boiler, seedsText] = line.split(': ') as [string, string];
		const data = seedsText.split(/\s+/).map(s => parseInt(s)) as [number, number];
		const ranges: SeedRange[] = [];

		while (data.length > 0) {
			const start = data.shift()!;
			const length = data.shift()!;
			ranges.push(new SeedRange(start, length));
		}

		return ranges;
	}

	get end(): number {
		return this.start + this.length;
	}

	get isEmpty(): boolean {
		return this.length === 0;
	}

	/**
	 * Returns the [preceding, selected, following] ranges.
	 */
	split(start: number, length: number): [SeedRange, SeedRange, SeedRange] {
		const end = start + length;
		const preceding = this.extract(0, start - 1);
		const selected = this.extract(start, end);
		const following = this.extract(end + 1, Number.MAX_SAFE_INTEGER);
		return [preceding, selected, following];
	}

	extract(start: number, end: number): SeedRange {
		const extractedStart = start > this.start ? start : this.start;
		const extractedEnd = end < this.end ? end : this.end;
		const extractedLength = extractedEnd - extractedStart;
		const isValidRange = extractedLength > 0;

		return isValidRange ?
			new SeedRange(extractedStart, extractedLength) :
			new SeedRange(0, 0)
		;
	}
}

class CompoundMap {
	constructor(
		public fromItem: string,
		public toItem: string,
		public maps: RangeMap[]
	) {}

	static parse(lines: string[]): CompoundMap | null {
		const peek = lines[0]?.match(/^([a-z]+)-to-([a-z]+) map:/);
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

	map(range: SeedRange): SeedRange[] {
		const remapped: SeedRange[] = [];
		const unmapped: SeedRange[] = [range];

		while (unmapped.length > 0) {
			const r = unmapped.shift()!;
			let r_wasMapped = false;
			for (const mapper of this.maps) {
				if (mapper.contains(r)) {
					r_wasMapped = true;
					const [pre, mapped, post] = mapper.map(r);
					remapped.push(mapped);
					
					// do not attempt to remap empty ranges, as this will
					// lead to infinity ... and pretty well beyond.
					if (!pre.isEmpty) unmapped.push(pre);
					if (!post.isEmpty) unmapped.push(post);
					break;
				}
			}

			// if not remapped, we get to use it as-is.
			if (!r_wasMapped) remapped.push(r);
		}

		return remapped;
	}
}

class RangeMap {
	delta: number;
	start: number;
	end: number;

	constructor(
		public source: number,
		public dest: number,
		public length: number
	) {
		this.delta = this.dest - this.source;
		this.start = this.source;
		this.end = this.source + this.length;
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

	contains(range: SeedRange): boolean {
		return range.start <= this.end && range.end >= this.source;
	}

	/**
	 * Returns the [preceeding, remapped, following] ranges.
	 */
	map(range: SeedRange): [SeedRange, SeedRange, SeedRange] {
		if (this.contains(range)) {
			const [pre, remapped, post] = range.split(this.start, this.length);
			remapped.start += this.delta;
			return [pre, remapped, post];
		}
		throw new Error("Range does not overlap the RangeMap");
	}
}

const map = SeedMap.parse(lines);

function part2() {
	return Math.min(
		...map.mapped.map(s => s.start)
	);
}

console.log({
	part2: part2(),
});
