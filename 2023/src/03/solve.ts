const fs = require('fs');
const raw = fs.readFileSync(0, 'utf-8');
const lines = raw.split('\n') as string[];

type Location = {
	x: number;
	y: number;
};

/**
 * To help my tiny brain thing in terms of [x, y] coords.
 */
function charAt(x: number, y: number): string | undefined {
	return lines[y]?.[x];
}

/**
 * Also to help my tiny brain thing in terms of [x, y] coords.
 */
function stringAt(x: number, y: number): string | undefined {
	return lines[y]?.substring(x);
}

/**
 * Again, because my brain is tiny. A util function that takes an [x, y] coord
 * and attempts to parse the integer at that location.
 */
function numberAt(x: number, y: number): number | undefined {
	// just need to find the left-hand side of the number if (x, y) are part
	// of a number. parseInt() will consume int chars for us until it reaches
	// a non-int char.
	if (charAt(x, y)?.match(/\d/)) {
		if (charAt(x - 1, y)?.match(/\d/)) {
			return numberAt(x - 1, y);
		} else {
			return parseInt(stringAt(x, y) || '');
		}
	} else {
		return undefined;
	}
}

/**
 * Find all the part indicator locations.
 */
function partLocations() {
	const locations: Location[] = [];
	for (let y = 0; y < lines.length; y++) {
		for (let x = 0; x < lines[y].length; x++) {
			const c = charAt(x, y);
			if (c === '.' || c?.match(/\d/)) {
				// filler or part of a number: ignore.
			} else {
				// special character. signals a part.
				locations.push({x, y});
			}
		}
	}
	return locations;
}

/**
 * Given an [x, y] coord, searches all adjacent (including diagonal) locations
 * for part numbers.
 */
function numbersAround(x: number, y: number): number[] {
	const parts = new Set<number>();
	for (const xOffset of [-1, 0, 1]) {
		for (const yOffset of [-1, 0, 1]) {
			const partNumber = numberAt(x + xOffset, y + yOffset);
			if (partNumber) parts.add(partNumber);
		}
	}
	return [...parts];
}

function sum(values: number[]): number {
	return values.reduce((sum, v) => sum + v, 0);
}

function part1() {
	const locations = partLocations();
	const numbers = locations
		.map(loc => numbersAround(loc.x, loc.y))
		.reduce((agg, item) => agg.concat(item), [] as number[])
	;
	console.log(sum(numbers));
}

console.log({
	part1: part1(),
});
