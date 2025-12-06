import { Grid, lines, sum, transposeArray } from '../common/index.js';

type Equation = {
	operation: '+' | '*';
	operands: number[];
}

function doMath(eq: Equation) {
	let t = eq.operation === '*' ? 1 : 0;
	for (const o of eq.operands) {
		if (eq.operation === '*') t *= o;
		if (eq.operation === '+') t += o;
	}
	return t;
}

function part1() {
	const data = transposeArray(lines.map(l => l.trim().split(/\s+/)));
	const equations = data.map(d => {
		const operation = d.pop() as '+' | '*';
		return {
			operation,
			operands: d.map(v => parseInt(v))
		};
	});

	return sum(equations.map(doMath));
}

function part2() {
	const grid = Grid.parse(lines);
	grid.defaultOnUndefined = () => ' ';
	let total = 0;
	let operation = '';
	let i = 0;
	let operandChars:  string[][] = [];
	for (let x = grid.width - 1; x >= 0; x--) {
		for (let y = 0; y < grid.height; y++) {
			operandChars[y] = operandChars[y] || [];
			const c = grid.get({ x, y });
			if (c === '*' || c === '+') {
				operation = c;
			} else if (y !== grid.height - 1) {
				operandChars[i].push(c || '');
			}
		}
		i++;
		if (operation === '*' || operation === '+') {
			const operands = operandChars
				.map(c => parseInt(c.join('')))
				.filter(v => !Number.isNaN(v));
			total += doMath({
				operation,
				operands
			});
			operandChars = [];
			operation = '';
			i = 0;
		}
	}
	return total;
}

console.log('part 1', part1());
console.log('part 2', part2());