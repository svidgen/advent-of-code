import { 
	lines,
	PriorityQueue,
	Coord,
	Cursor,
	Direction,
	Grid,
} from '../common';

type Truck = Cursor<{cost: number; steps: number}>;

const grid = Grid.parse(lines);
const state = Grid.fromDimensions(
	grid.width,
	grid.height,
	() => ({
		minCost: Number.MAX_SAFE_INTEGER,
		visits: {} as Record<string, number>
	})
);
const cursors = new PriorityQueue<Truck>();

const TURNS = {
	[Direction.north]: [Direction.east, Direction.west],
	[Direction.south]: [Direction.east, Direction.west],
	[Direction.east]: [Direction.north, Direction.south],
	[Direction.west]: [Direction.north, Direction.south],
};

let bestFinalPathCost = Number.MAX_SAFE_INTEGER;

function step(truck: Truck) {
	truck.step();
	truck.state.steps++;

	if (!grid.includes(truck.coord)) {
		return;
	}

	const cellValue = grid.get(truck.coord)!;
	const cellState = state.get(truck.coord)!;

	truck.state.cost += parseInt(cellValue);

	// due to eratic behavior, we need to let trucks keep working even
	// if they're not currently the ideal path, because any given truck might
	// visit a node "behind" the others, but have the advantage of having
	// straight line movement left. for now, we're "buffering" for this.
	if (
		// truck.state.cost > cellState.minCost
		// ||
		truck.state.cost >= (cellState.visits[truck.direction + truck.state.steps] || 100000)
		|| truck.state.cost >= bestFinalPathCost
	) {
		// cursor is already losing. kill it.
		return;
	}

	cellState.minCost = Math.min(truck.state.cost, cellState.minCost);
	cellState.visits[truck.direction + truck.state.steps] = truck.state.cost;

	if (
		truck.coord.x === grid.width - 1
		&& truck.coord.y === grid.height - 1
	) {
		// that's it. we've made it. remove self and log the truck/path.
		bestFinalPathCost = Math.min(bestFinalPathCost, truck.state.cost);
		return;
	} else {
		// cursor keeps searching, branching out into left/right directions
		// as well.
		for (const direction of TURNS[truck.direction]) {
			const copied = truck.copy({
				direction,
				state: {
					cost: truck.state.cost,
					steps: 0
				}
			});
			// console.log({lrTruck});
			cursors.enqueue(copied, cost(copied));
		};
	}

	// AOC rule where a cursor must change directions after three steps.
	// because we already spawned left/right child cursors above, we just
	// have to remove (omit) the forward-going cursor at this point. else,
	// we need to explicitly re-enqueue to continue.
	if (truck.state.steps < 3) {
		cursors.enqueue(truck, cost(truck));
	}
};

// hueristical cost function
function cost(truck: Truck): number {
	const distance = Math.sqrt(
		Math.pow((grid.width + 1 - truck.coord.x), 2)
		+ Math.pow((grid.height + 1 - truck.coord.y), 2)
	);
	return truck.state.cost * distance;
}

//
// start solving.
//
// initial search starts from the top left and searches east and south.
//

cursors.enqueue(
	new Cursor({x: 0, y: 0}, Direction.east, {cost: 0, steps: 0}),
	0
);

cursors.enqueue(
	new Cursor({x: 0, y: 0}, Direction.south, {cost: 0, steps: 0}),
	0
);

let counter = 0;
while (!cursors.isEmpty) {
	const c = cursors.dequeue();
	if (!c) {
		console.log("Cursor not found.", cursors);
		break;
	}

	step(c);
	
	// debugging
	counter++;
	if (counter % 10_000 === 0) {
		console.log(
			`steps: ${counter}; cursors: ${cursors.size}; min: ${cursors.min}`
		);
	}
}

console.log(bestFinalPathCost);
