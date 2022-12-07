const fs = require('fs');
const data = fs.readFileSync(0, 'utf-8').trim();

const MARKER_SIZE = 4;

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

	isAtMarker() {
		const seen = new Set();
		for (let i = 0; i < MARKER_SIZE; i++) {
			seen.add(this.data[i + this.position]);
		}
		return seen.size === MARKER_SIZE;
	}
}

const cursor = new Cursor(data);

while (!cursor.isAtMarker()) {
	cursor.advance();
}

console.log(cursor.position + MARKER_SIZE);
