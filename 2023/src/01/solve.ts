const fs = require('fs');
const raw = fs.readFileSync(0, 'utf-8');
const lines = raw.split('\n') as string[];

const DIGITS = {
	'0': '0',
	'1': '1',
	'2': '2',
	'3': '3',
	'4': '4',
	'5': '5',
	'6': '6',
	'7': '7',
	'8': '8',
	'9': '9',
	'zero': '0',
	'one': '1',
	'two': '2',
	'three': '3',
	'four': '4',
	'five': '5',
	'six': '6',
	'seven': '7',
	'eight': '8',
	'nine': '9',
} as const;

function sum(values: number[]) {
	let total = 0;
	for (const v of values) {
		total += v;
	}
	return total;
};

function digitize(line: string): string[] {
	const digits = [] as string[];

	for (let i = 0; i < line.length; i++) {
		for (const [name, digit] of Object.entries(DIGITS)) {
			if (line.substring(i).startsWith(name)) {
				digits.push(digit)
			}
		}
	}

	return digits;
}

function part1() {
	const data = lines.filter(x => x).map(line => {
		const first = line.match(/^[^\d]*(\d)/);
		const last = line.match(/(\d)[^\d]*$/);
		return Number(first?.[1] + '' + last?.[1]);
	});

	return sum(data);
};

function part2() {
	const data = lines.filter(x => x).map(line => {
		const digits = digitize(line);
		const first = digits[0];
		const last = digits[digits.length - 1];
		return Number(first + last);
	});

	return sum(data);
};

console.log({
	part1: part1(),
	part2: part2()
});
