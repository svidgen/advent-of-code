const { sample, sample2, real } = require('./data.js');

const lines = real.split('\n');

const KNOTS = 10;
const knots = [...new Array(KNOTS)].map(() => ({ x: 0, y: 0 }));
const HEAD = 0;
const TAIL = knots.length - 1;
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
	knots[HEAD] = addCoords(knots[HEAD], moveCoord(d));
};

const moveKnot = idx => {
	const knot = knots[idx];
	const prev = knots[idx - 1];

	let move = { x: 0, y: 0 };
	const dist = Math.sqrt(Math.pow(prev.x - knot.x, 2) + Math.pow(prev.y - knot.y, 2));

	if (dist >= 2) {
		if (prev.y > knot.y) move = addCoords(move, moveCoord('U'));
		if (prev.y < knot.y) move = addCoords(move, moveCoord('D'));
		if (prev.x > knot.x) move = addCoords(move, moveCoord('R'));
		if (prev.x < knot.x) move = addCoords(move, moveCoord('L'));
	}

	knots[idx] = addCoords(knot, move);
};

const moveKnots = () => {
	for (let idx = 1; idx < knots.length; idx++) {
		moveKnot(idx);
	}
};

const print = () => {
	const SIZE = 30;
	const LOWER = 0 - Math.floor(SIZE / 2);
	const UPPER = Math.floor(SIZE / 2);
	const lines = [];
	for (let y = UPPER; y >= LOWER; y--) {
		const line = [];
		for (let x = LOWER; x < UPPER; x++) {
			let repr = '.';
			for (let idx = 0; idx < knots.length; idx++) {
				const knot = knots[idx];
				if (knot.x === x && knot.y === y) {
					if (idx === 0) {
						repr = 'H';
					} else {
						repr = idx;
					}
					break;
				}
			}
			line.push(repr);
		}
		lines.push(line.join(''));
	}
	console.log(lines.join('\n'));
	console.log('\n');
};

const recordTailPosition = () => {
	const k = `${knots[TAIL].x},${knots[TAIL].y}`;
	visited.set(k, 1);
};

// print();
for (const move of moves) {
	moveHead(move);
	moveKnots();
	recordTailPosition();
	// print();
}

console.log(visited.keys(), visited.size)
