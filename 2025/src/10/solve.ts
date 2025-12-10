import { lines, AutoPriorityQueue, sum, solveLinearSystem } from '../common/index.js';

type BfsState<S> = { state: S, steps: number[], priority: number };

type BfsOptions<S> = {
	state: S;
	visitedKey?: (state: S) => string;
	hardFail?: (state: S) => boolean;
	goal: (state: S) => boolean;
	options: ((state: S) => S)[];
}

function bfs<S>(bfsOptions: BfsOptions<S>): BfsState<S> | undefined {
	const keyof = (bfsOptions.visitedKey ? bfsOptions.visitedKey : s => JSON.stringify(s));
	const hardFail = (bfsOptions.hardFail ? bfsOptions.hardFail : () => false);
	const visited = new Set<string>();
	const q = new AutoPriorityQueue<BfsState<S>>();

	q.enqueue({ state: bfsOptions.state, steps: [], priority: 0 });
	while (!q.isEmpty) {
		const s = q.dequeue()!;
		const k = keyof(s.state);

		if (bfsOptions.goal(s.state)) return s;
		if (visited.has(k)) continue;
		if (hardFail(s.state)) continue;
		visited.add(k);
		
		for (let i = 0; i < bfsOptions.options.length; i++) {
			const newState = bfsOptions.options[i](s.state);
			q.enqueue({
				state: newState,
				steps: [...s.steps, i],
				priority: s.priority + 1
			});
		}
	}

	return undefined;
}

class Machine {
	public lights: boolean[] = [];
	public target: boolean[] = [];
	public buttons: Button[] = [];
	public joltages: number[] = [];

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
		machine.joltages = line.match(/\{(.+)\}/)?.[1].split(',').map(v => parseInt(v))!;
		return machine;
	}

	reset() {
		for (let i = 0; i < this.lights.length; i++) {
			this.lights[i] = false;
		}
	}

	solveLights() {
		return bfs<boolean[]>({
			state: [...this.lights],
			goal: lights => lights.every((v, i) => v === this.target[i]),
			options: this.buttons.map(b => (state: boolean[]) => b.toggleLights(state)),
		})
	}

	solveJoltages() {
		return solveLinearSystem([
			// ...
		])
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
	return '...'
}

console.log('part 1', part1());
console.log('part 2', part2());

