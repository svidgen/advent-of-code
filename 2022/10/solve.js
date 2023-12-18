const fs = require('fs');
const process = require('process');

const raw = fs.readFileSync(process.argv[2]).toString().trim();
const instructions = raw.split(/\r?\n/);

let register = 1;

const cycles = [register];

for (const instruction of instructions) {
	const [op, param] = instruction.split(' ');

	if (op === 'noop') {
		cycles.push(register);
	} else if (op === 'addx') {
		cycles.push(register);
		cycles.push(register);
		register += Number(param);
	}
}

// console.log(cycles.map((v, c) => `${c} => ${v}`).join('\n'));

// part 1
console.log(
	20 * cycles[20] + 
	60 * cycles[60] + 
	100 * cycles[100] + 
	140 * cycles[140] + 
	180 * cycles[180] + 
	220 * cycles[220]
);

// part 2
const output = cycles.map((value, cycle) => {
	const pixel = (cycle - 1) % 40;
	const sprite_start = value - 1;
	const sprite_end = value + 1;
	if (pixel >= sprite_start && pixel <= sprite_end) {
		return '#';
	} else {
		return ' ';
	}
});

// first bit is initial state
output.shift();

for (let line = 0; line < 7; line++) {
	console.log(output.slice(line * 40, line * 40 + 40).join(''));
}
