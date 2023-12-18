const fs = require('fs');
const raw = fs.readFileSync(0, 'utf-8');
const lines = raw.split('\n') as string[];

const S = lines
	.filter(x => x)
	.map(line =>
		line.trim().split(/\s+/).map(t => parseInt(t))
	);

function getDiffs(series: number[]): number[] {
	const diffs: number[] = [];
	let last: number | null = null;
	for (const n of series) {
		if (last !== null) {
			diffs.push(n - last);
		}
		last = n;
	}
	return diffs;
}

function next(series: number[]): number {
	if (series.length === 0) {
		return 0;
	} else {
		const diff = next(getDiffs(series));
		return series[series.length - 1] + diff;
	}
}

function part1() {
	const nexts = S.map(s => next(s));
	const sum = nexts.reduce((sum, v) => sum + v, 0);
	return sum;
}

function part2() {
	const nexts = S.map(s => s.reverse()).map(s => next(s));
	const sum = nexts.reduce((sum, v) => sum + v, 0);
	return sum;
}

console.log({
	part1: part1(),
	part2: part2()
});
