import { lines, Cursor, StepTracer, Grid, Direction, Coord } from '../common';

const grid = Grid.parse(lines);

const turns = {
	[Direction.north]: [Direction.east, Direction.west],
	[Direction.south]: [Direction.east, Direction.west],
	[Direction.east]: [Direction.north, Direction.south],
	[Direction.west]: [Direction.north, Direction.south],
};

const tracer = new StepTracer(
	grid,
	() => ({
		minCost: Number.MAX_SAFE_INTEGER,
		visits: {} as Record<number, number>
	}),
	(tracer, truck) => {
		truck.step();
		truck.state.steps++;

		if (!tracer.grid.includes(truck.coord)) {
			tracer.remove(truck);
			return;
		}

		const cellValue = tracer.grid.get(truck.coord)!;
		const cellState = tracer.state.get(truck.coord)!;

		// console.log({truck, state: truck.state});
		// tracer.remove(truck);
		// return;

		truck.state.cost += parseInt(cellValue);

		// console.log({truck});
		// tracer.remove(truck);
		// return;

		// due to eratic behavior, we need to let trucks keep working even
		// if they're not currently the ideal path, because any given truck might
		// visit a node "behind" the others, but have the advantage of having
		// straight line movement left. for now, we're "buffering" for this.
		if (
			truck.state.cost >= cellState.minCost &&
			cellState.exits
			// || (cellState.visits[truck.state.cost] || 0) > 3
		) {
			// cursor is already losing. kill it.
			tracer.remove(truck);
			return;
		}

		cellState.minCost = Math.min(truck.state.cost, cellState.minCost);
		cellState.visits[truck.state.cost]++;

		if (
			truck.coord.x === tracer.grid.width - 1
			&& truck.coord.y === tracer.grid.height - 1
		) {
			// that's it. we've made it. remove self and log the truck/path.
			tracer.log.push(truck);
			tracer.remove(truck);
			return;
		} else {
			// cursor keeps going, branching out into left/right directions
			// as well.
			for (const direction of turns[truck.direction]) {
				const copied = truck.copy({
					direction,
					state: {
						cost: truck.state.cost,
						steps: 0
					}
				});
				// console.log({lrTruck});
				tracer.add(copied);
			};
		}

		// AOC rule where a cursor must change directions after three steps.
		// because we already spawned left/right child cursors above, we just
		// have to remove the forward-going cursor at this point.
		if (truck.state.steps === 3) {
			tracer.remove(truck);
		}
	}
);

const visited = (t) => t.state.reduce((sum, cellState) => {
	if (cellState.length > 0) sum++;
	return sum;
}, 0);

(async () => {
	tracer.add(new Cursor({x: 0, y: 0}, Direction.east, {cost: 0, steps: 0}));
	tracer.add(new Cursor({x: 0, y: 0}, Direction.south, {cost: 0, steps: 0}));
	tracer.run((s) => {
		console.log(`step: ${s}; cursors: ${tracer.cursors.length}`);
	});

	const score = Math.min(...tracer.log.map(l => l.state.cost))
	console.log({score});
})();
