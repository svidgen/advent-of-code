import {
	lines,
	sum,
	bestPositiveIntSolution,
	Equation,
	solveLinearSystem,
	findShortestPath,
	reduce,
	equationTableRow,
	Edge,
	freeVariables,
} from '../common/index.js';

class Machine {
	public lights: boolean[] = [];
	public target: boolean[] = [];
	public buttons: Button[] = [];
	public joltageTargets: number[] = [];

	addButton(button: Button) {
		this.buttons.push(button);
		this.lights.push(false);
	}

	static parse(line: string): Machine {
		const machine = new Machine();
		machine.target = line.match(/\[(.+)\]/)?.[1].split('').map(m => m === '#')!;
		machine.lights = machine.target.map(() => false);
		machine.buttons = line.match(/\([\d,]+\)/g)?.map(s => 
			new Button(s.substring(1, s.length - 1).split(',').map(v => parseInt(v)))
		)!;
		machine.joltageTargets = line.match(/\{(.+)\}/)?.[1].split(',').map(v => parseInt(v))!;
		return machine;
	}

	reset() {
		for (let i = 0; i < this.lights.length; i++) {
			this.lights[i] = false;
		}
	}

	solveLights() {
		return findShortestPath<boolean[]>({
			state: [...this.lights],
			goal: lights => lights.every((v, i) => v === this.target[i]),
			edges: (state: boolean[]) => this.buttons.map(b => b.toggleLights(state)),
		})
	}

	solveJoltages() {
		// creating a list of equations that we can do linear system stuff to.
		// the right hand value is just the target joltage. each "x" column is the amount
		// each button (by index) contributes to the target joltage. each button
		// contributes exactly 0 or 1 in our case. so, we just need to put a 1
		// in the column for each button that contributes to a particular joltage.
		const equations = this.joltageTargets.map((target, t_i) => {
			const eq: Equation = { y: target, x: Array(this.buttons.length).fill(0) };
			for (let b_i = 0; b_i < this.buttons.length; b_i++) {
				const wires = this.buttons[b_i].wires;
				if (wires.includes(t_i)) eq.x[b_i] = 1;
			}
			return eq;
		});

		// console.log(equations, positiveIntSolutions(equations));

		// console.log('given');
		// console.table(equations.map(equationTableRow));

		// const reduced = (reduce(equations) as any);
		// const frees = freeVariables(reduced);

		// console.log('reduced');
		// console.table(reduced.map(equationTableRow));
		// console.log(frees);

		// return equations;

		// and then we just pick best positive integer solution.
		const result = sum(bestPositiveIntSolution(equations)!);
		console.log(`solved one ... ${result}`);
		return result;
	}
}

class Button {
	constructor(public wires: number[]) {}

	toggleLights(state: boolean[]): boolean[] {
		const s = [...state];
		for (const wire of this.wires) s[wire] = !s[wire];
		return s;
	}
}

const machines = lines.map(line => Machine.parse(line));

function part1() {
	const solutions = machines.map(m => m.solveLights()).map(s => s!.priority);
	return sum(solutions);
}

function part2() {
	const solutions = machines.map(m => m.solveJoltages());
	return sum(solutions);
}

const eq: Equation[] = [
	{ x: [0, 1, 1], y: 5},
	{ x: [0, 1, 0], y: 3},
];
// console.log(bestPositiveIntSolution(eq));
// console.log(bestPositiveIntSolution([eq], eq => sum(eq)));

console.log('part 1', part1());
console.log('part 2', part2());

