const fs = require('fs');
const process = require('process');
const raw = fs.readFileSync(process.argv[2], 'utf-8');
const lines = raw.trim().split(/\n/);

class HashMap {
	buckets = [...Array(256)].map(b => new Bucket());

	ingest(lens: Lens) {
		const idx = hash(lens.label);
		this.buckets[idx].ingest(lens);
	}

	checksum(): number {
		let total = 0;
		for (let i = 0; i < this.buckets.length; i++) {
			total += this.buckets[i].checksum(i + 1);
		}
		return total;
	}
}

class Bucket {
	lenses = new Array<Lens>();

	ingest(lens: Lens) {
		const idx = this.lenses.findIndex(i => i.label === lens.label);
		if (lens.op === '-') {
			if (idx >= 0) this.lenses.splice(idx, 1);
		} else if (lens.op === '=') {
			if (idx >= 0) {
				this.lenses[idx] = lens;
			} else {
				this.lenses.push(lens);
			}
		}
	}

	checksum(factor: number): number {
		let total = 0;
		for (let i = 0; i < this.lenses.length; i++) {
			total += factor * (i + 1) * this.lenses[i].focalLength;
		}
		return total;
	}
}

class Lens {
	label: string;
	op: string;
	focalLength: number = 0;

	constructor(s: string) {
		const [_, label, op] = s.match(/^([a-z]+)(-|=\d+)$/)!;
		this.label = label;
		this.op = op === '-' ? '-' : '=';
		if (this.op === '=') this.focalLength = parseInt(op.substring(1));
	}
}

function hash(s: string): number {
	let h = 0;
	for (const c of s) {
		h += c.charCodeAt(0);
		h *= 17;
		h = h % 256;
	}
	return h;
}

let part1 = 0;
const part2 = new HashMap();
for (const line of lines) {
	for (const part of line.split(',')) {
		part1 += hash(part);
		part2.ingest(new Lens(part));
	}
}

console.log('part1', part1);
console.log('part2', part2.checksum());
