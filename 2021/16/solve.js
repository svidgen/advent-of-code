const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8');

const lines = input.split("\n");


const TYPE_SUM = 0;
const TYPE_PRODUCT = 1;
const TYPE_MIN = 2;
const TYPE_MAX = 3;
const TYPE_LITERAL = 4;
const TYPE_GT = 5;
const TYPE_LT = 6;
const TYPE_EQ = 7;

const LENGTH_FLAG_PACKETS = 1;
const LENGTH_FLAG_BITS = 0;

function* bits_of(line) {
	if (line instanceof Array) {
		yield* line;
	} else {
		for (let i = 0; i < line.length; i++) {
			const digit = (16 + parseInt(line[i], 16)).toString(2).substring(1);
			for (let bit = 0; bit < 4; bit++) {
				yield Number(digit[bit]);
			}
		}
	}

	return undefined;
}

function grab(width, bits, onto = 0) {
	let value = onto;
	for (let i = 0; i < width; i++) {
		const bit = bits.next().value;
		if (bit === undefined) return undefined;
		if (value instanceof Array) {
			value.push(bit);
		} else {
			value = value << 1;
			value = value | bit;
		}
	}
	return value;
}

function grab_literal(bits) {
	const literal = [];
	while (grab(1, bits) === 1) {
		literal.push(grab(4, bits));
	}
	literal.push(grab(4, bits));

	return literal.reduce((v, nibble) => {
		v = v * 16;
		v += nibble;
		return v;
	}, 0);
}

function grab_subpackets(bits) {
	if (grab(1, bits) === LENGTH_FLAG_BITS) {
		const bit_length = grab(15, bits);
		const data = grab(bit_length, bits, []);
		return [...packets(bits_of(data))];
	} else {
		const packets_to_get = grab(11, bits);
		const packets = [];
		for (let i = 0; i < packets_to_get; i++) {
			packets.push(get_packet(bits));
		}
		return packets;
	}
}

function grab_length(bits) {
}

function get_packet(bits) {
	const version = grab(3, bits);

	if (version === undefined) {
		return undefined;
	}

	const packet = {
		version,
		type: grab(3, bits),
	};

	if (packet.type === TYPE_LITERAL) { 
		packet.value = grab_literal(bits);
	} else {
		packet.children = grab_subpackets(bits);
	}

	return packet;
}

function* packets(bits) {
	let p = get_packet(bits);
	while (p) {
		yield p;
		p = get_packet(bits);
	}
}

function parse(line) {
	return [...packets(bits_of(line))];
}

function score(BITS) {
	let s = 0;
	for (const v of BITS) {
		s += v.version + score(v.children || []);
	}
	return s;
}

function evaluate(code) {
	const outputs = [];
	for (const op of code) {
		let a, b;
		switch(op.type) {
			case TYPE_SUM:
				outputs.push(evaluate(op.children).reduce((s,v) => s += v, 0));
				break;
			case TYPE_PRODUCT:
				outputs.push(evaluate(op.children).reduce((s,v) => s *= v, 1));
				break;
			case TYPE_MAX:
				outputs.push(Math.max(...evaluate(op.children)));
				break;
			case TYPE_MIN:
				outputs.push(Math.min(...evaluate(op.children)));
				break;
			case TYPE_LITERAL:
				outputs.push(op.value);
				break;
			case TYPE_GT:
				[a, b] = evaluate(op.children);
				outputs.push(a > b ? 1 : 0);
				break;
			case TYPE_LT:
				[a, b] = evaluate(op.children);
				outputs.push(a < b ? 1 : 0);
				break;
			case TYPE_EQ:
				[a, b] = evaluate(op.children);
				outputs.push(a === b ? 1 : 0);
				break;
			default:
				break;
		}
	}
	return outputs;
}

for (const line of lines) {
	// console.log(JSON.stringify(parse(line), null, 2));
	const program = parse(line);
	console.log('score', line, score(program), evaluate(program));
}
