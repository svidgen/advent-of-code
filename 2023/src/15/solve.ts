const fs = require('fs');
const process = require('process');
const raw = fs.readFileSync(process.argv[2], 'utf-8');
const lines = raw.trim().split(/\n/);

function hash(s: string): number {
	// Algo from AOC 15:
	// Determine the ASCII code for the current character of the string.
	// Increase the current value by the ASCII code you just determined.
	// Set the current value to itself multiplied by 17.
	// Set the current value to the remainder of dividing itself by 256.
	let h = 0;
	for (const c of s) {
		h += c.charCodeAt(0);
		h *= 17;
		h = h % 256;
	}
	return h;
}

// part 1
let part1 = 0;
for (const line of lines) {
	for (const part of line.split(',')) {
		part1 += hash(part);
	}
}
console.log('part1', part1);
