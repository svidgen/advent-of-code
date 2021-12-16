const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8');

const lines = input.split("\n");


const TYPE_LITERAL = 4;
const LENGTH_FLAG_11 = 1;
const LENGTH_FLAG_15 = 0;


function* bits(line) {
	for (let i = 0; i < line.length; i++) {
		const digit = parseInt(line[i]).toString(2);
		for (let bit = 0; bit < 4; bit++) {
			yield Number(digit[bit]);
		}
	}
}

function grab(width, bits) {
	let value = 0;
	for (let i = 0; i < width; i++) {
		value = value << 1;
		value = value & bits.next().value;
	}
	return value;
}

function grab_version(bits) {
	return grab(3, bits);
}

function grab_type(bits) {
}

function grab_literal(bits) {
}

function grab_instruction(bits) {
}

function grab_length(bits) {
}

function* packets(bits) {
}

function parse(line) {
}

for (const line of lines) {
	console.log(parse(line));
}
