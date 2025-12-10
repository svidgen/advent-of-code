import { lines, AutoPriorityQueue, sum } from '../common/index.js';

type BfsState<S> = { state: S, steps: number[], priority: number };

type BfsOptions<S> = {
	state: S;
	visitedKey?: (state: S) => string;
	goal: (state: S) => boolean;
	options: ((state: S) => S)[];
	copyState?: ((state: S) => S);
}

function bfs<S>(bfsOptions: BfsOptions<S>): BfsState<S> | undefined {
	const cp = (bfsOptions.copyState ? bfsOptions.copyState : s => JSON.parse(JSON.stringify(s))) as ((state: S) => S);
	const keyof = (bfsOptions.visitedKey ? bfsOptions.visitedKey : s => JSON.stringify(s));
	const visited = new Set<string>();
	const q = new AutoPriorityQueue<BfsState<S>>();

	q.enqueue({ state: bfsOptions.state, steps: [], priority: 0 });
	while (!q.isEmpty) {
		const s = q.dequeue()!;
		const k = keyof(s.state);

		if (bfsOptions.goal(s.state)) return s;
		if (visited.has(k)) continue;
		visited.add(k);
		
		for (let i = 0; i < bfsOptions.options.length; i++) {
			const newState = bfsOptions.options[i](cp(s.state));
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
			new Button(
				s.substring(1, s.length - 1).split(',').map(v => parseInt(v)),
				machine
			)
		)!;
		machine.joltages = line.match(/\{(.+)\}/)?.[1].split(',').map(v => parseInt(v))!;
		return machine;
	}

	reset() {
		for (let i = 0; i < this.lights.length; i++) {
			this.lights[i] = false;
		}
	}

	solve() {
		return bfs<boolean[]>({
			state: [...this.lights],
			goal: lights => lights.every((v, i) => v === this.target[i]),
			options: this.buttons.map(b => (state: boolean[]) => b.press(state)),
		})
	}
}

class Button {
	constructor(public wires: number[], public machine: Machine) {}

	/**
	 * If `state` is given, the button simulates its push non-destructively against the
	 * given `state` and returns a *new* state rather than manipulating the machine.
	 * 
	 * @param state 
	 */
	press(state?: boolean[]): boolean[] {
		const s = state ? [...state] : this.machine.lights
		for (const wire of this.wires) s[wire] = !s[wire];
		return s;
	}
}

function part1() {
	const machines = lines.map(line => Machine.parse(line));
	const solutions = machines.map(m => m.solve()).map(s => s?.priority);
	console.dir(solutions, {depth: null});
	return sum(solutions);
}

console.log('part 1', part1());

