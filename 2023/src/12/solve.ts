const process = require('process');
const fs = require('fs');
const raw = fs.readFileSync(process.argv[2], 'utf-8');
const lines = raw.trim().split(/\n/);

function sum(values: number[]): number {
	let s = 0;
	for (const v of values) s += v;
	return s;
}

function bitmap(str: string, chr: string): number {
	let b = 0;
	for (const c of str) {
		b = b << 1;
		if (c === chr) b += 1;
	}
	return b;
}

function bitClusters(n: number): number[] {
	return n.toString(2).split(/0+/).map(s => s.length).filter(l => l > 0);
}

function arraysMatch<T>(a: T[], b: T[]): boolean {
	if (a.length !== b.length) return false;
	for (const i in a) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}

class Entry {
	max: number;
	maskHash: number;
	maskDot: number;

	constructor(
		public springs: string,
		public checksums: number[]
	) {
		this.max = Math.pow(2, this.springs.trim().length) - 1;
		this.maskHash = bitmap(this.springs, '#');
		this.maskDot = bitmap(this.springs, '.');
	}

	static parse(lines: string[]): Entry[] {
		const records: Entry[] = [];
		for (const line of lines) {
			const [springs, checksumsString] = line.split(' ');
			const checksums = checksumsString.split(',').map(s => parseInt(s));
			records.push(new Entry(springs, checksums));
		}
		return records;
	}

	matches(n: number): boolean {
		if ((n & this.maskHash) !== this.maskHash) {
			// console.log(`no hash match: \n${n.toString(2)}\n${this.maskHash.toString(2)}`);
			return false;
		}

		if ((~n& this.maskDot) !== this.maskDot) {
			// console.log(`no dot match: \n${(~n).toString(2)}\n${this.maskDot.toString(2)}`);
			return false;
		}

		if (!arraysMatch(bitClusters(n), this.checksums)) {
			// console.log(`no checksum match: ${n.toString(2)}\n${bitClusters(n)}\n${this.checksums}`);
			return false;
		}

		return true;
	}

	countPermutations(): number {
		let count = 0;
		for (let i = 0; i <= this.max; i++) {
			if (this.matches(i)) count++
		}
		return count;
	}
}

const records = Entry.parse(lines);

const part1 = (() => {
	let count = 0;
	for (const r of records) {
		/*
		console.log(JSON.stringify({
			...r,
			max: r.max.toString(2),
			maskHash: r.maskHash.toString(2),
			maskDot: r.maskDot.toString(2),
		}, null, 2));
		*/
		count += r.countPermutations();
	}
	console.log({count});
	// return sum([...records.map(r => r.generatePermutations().length)]);
})();

const part2 = (() => {
})();

console.log(JSON.stringify({
	part1, part2
}, null, 2));
