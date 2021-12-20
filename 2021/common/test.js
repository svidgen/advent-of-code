const { EACCES } = require("constants");

const equations = [
	// should yield: 1, 2, 3
	// [2, 3, 4, 20],
	[0, 3, 4, 18],
	[3, 2, 5, 22],
	[5, 1, 2, 13]
];

function* range(a, b) {
	for (let i = Math.min(a, b); i <= Math.max(a, b); i++) {
		yield i;
	}
}

function deepcopy(o) {
	return JSON.parse(JSON.stringify(o));
}

function print(matrix) {
	console.log(
		matrix.map(
			row => row.map(v => v.toFixed(2)).join(', ')
		).join("\n") + "\n"
	);
}

function validate(matrix, solution) {
	for (const row of range(0, matrix.length - 1)) {
		const eq = [];
		let total = 0;
		for (const col of range(0, matrix.length - 1)) {
			total += solution[col] * matrix[row][col];
			eq.push(`${solution[col]} * ${matrix[row][col]}`)
		}
		if (total != matrix[row][matrix.length]) {
			const LHS = eq.join(' + ');
			throw new Error(`${LHS} = ${total} != ${matrix[row][matrix.length]}`);
		}
	}
}

function sorted_matrix(matrix) {
	const m = deepcopy(matrix);
	const value = row => row.reduce((v, c) => (v << 1) + (c ? 1 : 0), 0);
	m.sort((a,b) => value(a) > value(b) ? 1 : value(a) < value(b) ? -1 : 0).reverse();
	return m;
}

function solve(matrix) {
	print(matrix);
	const m = sorted_matrix(matrix);
	const VARS = m[0].length - 1;
	print(m);
	for (let col = 0; col < VARS; col++) {
		for (let row = 0; row < VARS; row++) {
			if (row === col) continue;
			const ratio = m[row][col] / m[col][col];
			for (let rowcol = 0; rowcol <= VARS; rowcol++) {
				m[row][rowcol] = m[row][rowcol] - ratio * m[col][rowcol];
			}
			print(m);
		}
	}
	return m.map((row, i) => row[m.length]/row[i]);
};

console.log(validate(equations, [1,2,3]));

const solution = solve(equations)
console.log(solution.map(v => v.toFixed(5)));
