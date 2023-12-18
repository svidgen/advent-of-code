import { lines, Grid, Direction, Coord } from '../common';

async function pause(s: number) {
	return new Promise(unsleep => setTimeout(unsleep, s));
}

class Cursor {
	coord: Coord;
	direction: Direction;

	constructor(
		coord: Coord,
		direction: Direction,
	) {
		this.coord = {...coord};
		this.direction = direction;
	}

	step() {
		switch (this.direction) {
			case Direction.north:
				this.coord.y--;
				break;
			case Direction.south:
				this.coord.y++;
				break;
			case Direction.east:
				this.coord.x++;
				break;
			case Direction.west:
				this.coord.x--;
				break;
			default:
				throw new Error('Bad direction!');
				break;
		}
	}

	get isEastWest() {
		return this.direction === Direction.east ||
			this.direction === Direction.west
		;
	}

	get isNorthSouth() {
		return this.direction === Direction.north ||
			this.direction === Direction.south
		;
	}
}

type CursorStep<T> = (tracer: StepTracer<T>, coord: Cursor) => void;

class StepTracer<T> {
	cursors: Cursor[] = [];
	state: Grid<string[]>;
	log: any[] = [];

	constructor(
		public grid: Grid<T>,
		public cursorStep: CursorStep<T>
	) {
		this.state = Grid.fromDimensions(grid.width, grid.height, () => [] as string[]);
	}

	add(cursor: Cursor) {
		this.cursors.push(cursor);
	}

	remove(cursor: Cursor) {
		this.cursors.splice(
			this.cursors.findIndex(c => c === cursor),
			1
		);
	}

	step() {
		// cursors might add or remove cursors as we go. but, these additions
		// are not part of the current step.
		const cursors = [...this.cursors];
		for (const cursor of cursors) {
			this.cursorStep(this, cursor);
		}
	}

	async run() {
		let steps = 0;
		while (this.cursors.length > 0 && steps < 1_000_000) {
			this.step();

			/*
			await pause(300);
			console.log('');
			console.log(`Step ${steps}`);
			console.log(this.state.toString());
			console.log();
			*/

			steps++;
		}
	}
}

const grid = Grid.parse(lines);

const tracer = new StepTracer(grid, (t, c) => {
	if (!grid.includes(c.coord)) {
		t.remove(c)
		return;
	}

	const state = t.state.get(c.coord)!;
	if (state.includes(c.direction)) {
		t.remove(c);
	} else {
		state.push(c.direction);
	}

	const value = t.grid.get(c.coord)!;
	const action = ({
		'|': () => {
			if (c.isEastWest) {
				t.remove(c);
				t.add(new Cursor(c.coord, Direction.south));
				t.add(new Cursor(c.coord, Direction.north));
			}
		},
		'-': () => {
			if (c.isNorthSouth) {
				t.remove(c);
				t.add(new Cursor(c.coord, Direction.west));
				t.add(new Cursor(c.coord, Direction.east));
			}
		},
		'/': () => {
			c.direction = ({
				[Direction.north]: Direction.east,
				[Direction.south]: Direction.west,
				[Direction.east]: Direction.north,
				[Direction.west]: Direction.south
			})[c.direction];
		},
		'\\': () => {
			c.direction = ({
				[Direction.north]: Direction.west,
				[Direction.south]: Direction.east,
				[Direction.east]: Direction.south,
				[Direction.west]: Direction.north
			})[c.direction];
		}
	})[value];
	if (action) action();
	c.step();
});

(async () => {
	tracer.add(new Cursor({x: 0, y: 0}, Direction.east));
	await tracer.run();

	const visited = tracer.state.reduce((sum, cellState) => {
		if (cellState.length > 0) sum++;
		return sum;
	}, 0);

	console.log(tracer.grid.map((data, coord) => {
		const state = tracer.state.get(coord)!;
		return (data === '.' && state.length > 0) ? state[0] : data;
	}).toString());

	console.log('part1', visited);
})();
