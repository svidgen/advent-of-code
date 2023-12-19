import { lines, Cursor, StepTracer, Grid, Direction, Coord } from '../common';

const grid = Grid.parse(lines);

const tracer = new StepTracer(
	grid,
	() => 0,
	(tracer, cursor) => {
		const value = tracer.grid.get(c.coord)!;
		const state = tracer.state.get(c.coord)!;

		if (state.includes(c.direction)) {
			t.remove(c);
		} else {
			state.push(c.direction);
		}

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
	}
);

const visited = (t) => t.state.reduce((sum, cellState) => {
	if (cellState.length > 0) sum++;
	return sum;
}, 0);

(async () => {
	tracer.add(new Cursor({x: 0, y: 0}, Direction.east));
	tracer.run();
	const part1 = visited(tracer);

	/*
	console.log(tracer.grid.map((data, coord) => {
		const state = tracer.state.get(coord)!;
		return (data === '.' && state.length > 0) ? state[0] : data;
	}).toString());
	*/

	const width = tracer.grid.width;
	const height = tracer.grid.height;

	const origins = [
		// west
		...[...Array(height)].map(
			(_, y) => new Cursor({x:0,  y}, Direction.east)
		),
		// north
		...[...Array(width)].map(
			(_, x) => new Cursor({x, y: 0}, Direction.south)
		),
		// east
		...[...Array(height)].map(
			(_, y) => new Cursor({x: width - 1, y}, Direction.west)
		),
		// south
		...[...Array(width)].map(
			(_, x) => new Cursor({x, y: height - 1}, Direction.north)
		)
	];

	const scores = origins.map((cursor, i) => {
		const origin = {...cursor, coord: {...cursor.coord}};
		tracer.reset();
		tracer.add(cursor);
		tracer.run();
		const v = visited(tracer);
		console.log(`Processing ${i} (${JSON.stringify(origin)}) = ${v}`);
		return v;
	});

	console.log('part 1', visited(tracer));
	console.log('part 2', Math.max(...scores));

})();
