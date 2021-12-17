const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8');

const lines = input.split("\n");


const TYPE_LITERAL = 4;
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

function part1(BITS) {
	let score = 0;
	for (const v of BITS) {
		score += v.version + part1(v.children || []);
	}
	return score;
}

for (const line of lines) {
	// console.log(JSON.stringify(parse(line), null, 2));
	console.log('score', line, part1(parse(line)));
}
