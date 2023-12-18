import { lines, Grid, Direction, Coord } from '../common';

type TracerAction<T> = (
	tracer: StepTracer<T>,
	cursor: Cursor,
) => void;

class Cursor {
	constructor(
		public coord: Coord,
		public direction: Direction
	) {}

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
				this.coord.y--;
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

type TracerRules = Record<string, TracerAction>;

class StepTracer<T> {
	cursors: Cursor[] = [];
	tracker: Grid<string>;
	log: any[] = [];

	constructor<T>(
		public grid: Grid<T>,
		public rules: TracerRules
	) {
		this.tracker(grid.width, grid.height, () => ".");
	}

	add(cursor: Cursor) {
		this.cursors.push(cursor);
	}

	remove(cursor: Cursor) {
		this.cursors.splice(
			this.cursors.findIndex(cursor),
			1
		);
	}

	step() {
		// cursors might add or remove cursors as we go. but, these additions
		// are not part of the current step.
		const cursors = [...this.cursors];
		for (const cursor of cursors) {
			this
		}
	}
}

const grid = Grid.parse(lines);

const tracer = new StepTracer(grid, {
	'.': (t,c) => {
		t.tracker.set(c.coord, '#');
	},
	'|': (t,c) => {
		t.tracker.set(c.coord, '#');
		if (c.isEastWest) {
			t.remove(c);
			t.add(new Cursor({x: c.x, y: c.y + 1, direction: Direction.north}));
			t.add(new Cursor({x: c.x, y: c.y - 1, direction: Direction.south}));
		}
	},
	'-': (t,c) => {
		t.tracker.set(c.coord, '#');
		if (c.isNorthSouth) {
			t.add(new Cursor({x: c.x - 1, y: c.y, direction: Direction.west}));
			t.add(new Cursor({x: c.x + 1, y: c.y, direction: Direction.east}));
		}
	},
	'/': (t,c) => {
		t.tracker.set(c.coord, '#');
		switch (c.direction) {
			case Direction.north:
				c.direction = Direction.east;
				break;
			case Direction.south:
				c.direction = Direction.west;
				break;
			case Direction.east:
				c.direction = Direction.north;
				break;
			case Direction.west:
				c.direction = Direction.south;
				break;
			default:
				throw new Error("Invalid direction");
		}
	},
	'\\': (t,c) => {
		t.tracker.set(c.coord, '#');
		switch (c.direction) {
			case Direction.north:
				c.direction = Direction.west;
				break;
			case Direction.south:
				c.direction = Direction.east;
				break;
			case Direction.east:
				c.direction = Direction.south;
				break;
			case Direction.west:
				c.direction = Direction.north;
				break;
			default:
				throw new Error("Invalid direction");
		}
	}
});


