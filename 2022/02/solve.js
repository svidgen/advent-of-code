const fs = require('fs');
const data = fs.readFileSync(0, 'utf-8');

const lines = data.split('\n');

const translate = response => String.fromCodePoint((response).codePointAt(0) - 23);

// listed in the order of who loses to who.
// i.e., A loses to B, B loses to C, C loses to A
const moves = ['A', 'B', 'C'];

// maps moves to their index
const moveIndex = moves.reduce((o, move, idx) => {
	return {...o, [move]: idx};
}, {});

const inferiorOf = move => {
	// the inferior will be the move index - 1, wrapped back around
	// to the end of the moves array after we go below 0.
	//
	// easy enough to do if we project out past the end and use modulus.
	const i = ( moveIndex[move] + moves.length - 1 ) % moves.length;
	return moves[i];
};

const superiorOf = move => {
	// it's just the move index + 1, wrapper back around to the start
	// if we go past the end of the array.
	const i = ( moveIndex[move] + 1 ) % moves.length;
	return moves[i];
};

const calculateResponse = (move, code) => {
	return {
		X: () => inferiorOf(move),
		Y: () => move,
		Z: () => superiorOf(move)
	}[code]();
};

const roundScore = (move, response) => {
	if (response === move) return 3;
	if (superiorOf(move) === response) return 6;
	return 0;
};

const baseScore = response => moveIndex[response] + 1;

const score = (move, response) => {
	return baseScore(response) + roundScore(move, response);
};

let partOneTotal = 0;
let partTwoTotal = 0;

const pairs = []
for (const line of lines) {
	if (line.trim() === '') continue;

	const [move, response] = line.split(/\s+/);

	const partOneScore = score(move, translate(response));
	partOneTotal += partOneScore;

	const partTwoResponse = calculateResponse(move, response);
	const partTwoScore = score(move, partTwoResponse);
	partTwoTotal += partTwoScore;

	console.log({move, response, partOneScore, partTwoResponse, partTwoScore});
}

console.log({partOneTotal, partTwoTotal});

