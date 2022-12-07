const fs = require('fs');
const data = fs.readFileSync(0, 'utf-8').trim();

const PACKET_MARKER_SIZE = 4;
const MESSAGE_MARKER_SIZE = 14;

class Cursor {
	data;
	position;

	constructor(data) {
		this.data = data;
		this.position = 0;
	}

	advance(count = 1) {
		this.position += count;
	}

	isAtMarker(size) {
		const seen = new Set();
		for (let i = 0; i < size; i++) {
			seen.add(this.data[i + this.position]);
		}
		return seen.size === size;
	}
}

const cursor = new Cursor(data);

while (!cursor.isAtMarker(PACKET_MARKER_SIZE)) {
	cursor.advance();
}
console.log(cursor.position + PACKET_MARKER_SIZE);

while (!cursor.isAtMarker(MESSAGE_MARKER_SIZE)) {
	cursor.advance();
}
console.log(cursor.position + MESSAGE_MARKER_SIZE);
