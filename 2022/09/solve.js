const { sample, real } = require('./data.js');

const lines = real.split('\n');

let head = { x: 0, y: 0 };
let tail = { x: 0, y: 0 };
const visited = new Map();

const moves = [];
lines.forEach(line => {
	const [direction, steps] = line.split(' ');
	for (let i = 0; i < steps; i++) {
		moves.push(direction);
	}
});

const addCoords = (a, b) => {
	const out = {...a};
	for (const [k, v] of Object.entries(b)) {
		out[k] = (out[k] || 0) + v;
	}
	return out;
}

const moveCoord = (d) => {
	return {
		U: { y: 1 },
		D: { y: -1 },
		L: { x: -1 },
		R: { x: 1}
	}[d];
}

const moveHead = d => {
	head = addCoords(head, moveCoord(d));
};

const moveTail = () => {
	let move = { x: 0, y: 0 };
	const dist = Math.sqrt(Math.pow(head.x - tail.x, 2) + Math.pow(head.y - tail.y, 2));

	if (dist >= 2) {
		if (head.y > tail.y) move = addCoords(move, moveCoord('U'));
		if (head.y < tail.y) move = addCoords(move, moveCoord('D'));
		if (head.x > tail.x) move = addCoords(move, moveCoord('R'));
		if (head.x < tail.x) move = addCoords(move, moveCoord('L'));
	}

	tail = addCoords(tail, move);
};

const print = () => {
	const SIZE = 6;
	const lines = [];
	for (let y = SIZE - 1; y >= 0; y--) {
		const line = [];
		for (let x = 0; x < SIZE; x++) {
			if (head.x === x && head.y === y) {
				line.push('H');
			} else {
				if (tail.x === x && tail.y === y) {
					line.push('T');
				} else {
					line.push('.');
				}
			}
		}
		lines.push(line.join(''));
	}
	console.log(lines.join('\n'));
	console.log('\n');
};

const recordTailPosition = () => {
	const k = `${tail.x},${tail.y}`;
	visited.set(k, 1);
};

// print();
for (const move of moves) {
	const start = {head, tail};
	moveHead(move);
	moveTail();
	recordTailPosition();
	// print();
	const end = {head, tail};
	// console.log({start, move, end});
}

console.log(visited.keys(), visited.size)
