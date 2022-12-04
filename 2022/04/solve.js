const fs = require('fs');
const data = fs.readFileSync(0, 'utf-8');
const lines = data.trim().split('\n');

class Range {
	start;
	end;

	constructor(repr) {
		([this.start, this.end] = repr.split('-').map(v => Number(v)));
	}

	contains(b) {
		return this.start <= b.start && this.end >= b.end;
	}

	containsAny(b) {
		return this.start <= b.end && this.end >= b.start;
	}
}

class Pair {
	a;
	b;

	constructor(repr) {
		([this.a, this.b] = repr.split(',').map(p => new Range(p)));
	}

	get hasFullOverlap() {
		return this.a.contains(this.b) || this.b.contains(this.a);
	}

	get hasAnyOverlap() {
		return this.a.containsAny(this.b) || this.b.containsAny(this.a);
	}
}

const pairs = lines.map(line => new Pair(line));

const fulloverlaps = pairs.filter(p => p.hasFullOverlap);
const fulloverlapCounts = fulloverlaps.length;

const overlaps = pairs.filter(p => p.hasAnyOverlap);
const overlapCounts = overlaps.length;

console.log(JSON.stringify({
	pairs,
	fulloverlaps,
	fulloverlapCounts,
	overlaps,
	overlapCounts
}, null, 2));
