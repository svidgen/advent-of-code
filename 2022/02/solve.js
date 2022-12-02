const fs = require('fs');
const data = fs.readFileSync(0, 'utf-8');

const lines = data.split('\n');

const subscore = (move, response) => {
	const matches = {
		X: 'A',
		Y: 'B',
		Z: 'C'
	};

	const beats = {
		X: 'C', // rock (X) beats scissors (C)
		Y: 'A', // paper (Y) beats rock (A)
		Z: 'B', // scissors (Z) beats paper (B)
	};

	if (matches[response] === move) return 3;
	if (beats[response] === move) return 6;
	return 0;
};

const score = (move, response) => {
	const baseScore = {
		X: 1, // rock
		Y: 2, // paper,
		Z: 3, // scissors
	}[response];

	return baseScore + subscore(move, response);
};

const translate = (move, response) => {
};

let partOneTotal = 0;
let partTwoTotal = 0;

const pairs = []
for (const line of lines) {
	if (line.trim() === '') continue;

	const [move, response] = line.split(/\s+/);

	const partOneScore = score(move, response);
	partOneTotal += partOneScore;
	console.log({move, response, partOneScore});

	/*
	const partTwoResponse = translate(move, response);
	const partTwoScore = score(move, partTwoResponse);
	partTwoTotal += partTwoScore;

	console.log({move, response, partOneScore, partTwoResponse, partTwoScore});
	*/
}

console.log({partOneTotal});

