import { blocks, Grid, time, sum, Coord } from "../common/index.js";

class Space {
	constructor(
		public width: number,
		public height: number,
		public shapes: number[],
	) {}
	
	static parse(line: string) {
		const [dimString, blocksString] = line.split(': ');
		const [width, height] = dimString.split('x').map(s => parseInt(s));
		const shapes = blocksString.split(' ').map(s => parseInt(s));
		return new Space(width, height, shapes);
	}
}

const shapes: Grid<number>[][] = [];
const spaces: Space[] = []

for (const block of blocks) {
	if (block.lines[0].match(/^\d+:/)) {
		const baseShape = Grid
			.parse(block.lines.slice(1))
			.map(v => v === '#' ? 1 : 0);
		shapes.push(baseShape.findAllUniquePermutations());
	} else {
		for (const line of block.lines) {
			spaces.push(Space.parse(line));
		}
	}
}

function canFit(
	grid: Grid<number>,
	requirements: number[],
	at: Coord[] | Generator<Coord> = [{ x: 0, y: 0 }]
) {
	if (requirements.every(qty => qty === 0)) return true;
	for (const coord of at) {
		// if (grid.get(coord)) continue; // filled
		// console.log('looking at', coord);
		for (const [shapeId, qty] of requirements.entries()) {
			if (qty === 0) continue;
			for (const arrangement of shapes[shapeId]) {
				// place the arrangement if possible.
				if (!place(grid, arrangement, coord)) continue;
				requirements[shapeId]--;

				// console.log('arrangement placed', coord, requirements);
				// console.log(grid.toString(), '\n');

				// return true if this solves recursively
				const searchSpace = searchZoneFrom(grid, arrangement, coord);
				if (canFit(grid, requirements, searchSpace)) return true;

				// console.log('arrangement undone');
				
				// else ... undo the operation.
				requirements[shapeId]++;
				remove(grid, arrangement, coord);
			}
		}
	}
	return false;
}

type MappedCoord = {
	absolute: Coord;
	relative: Coord;
};

function * absoluteCoordMapping(
	space: Grid<number>,
	shape: Grid<number>,
	placement: Coord,
	padding: number = 0,
): Generator<MappedCoord> {
	const startX = Math.max(0, placement.x - padding);
	const endX = Math.min(space.width - 1, shape.width + placement.x + padding);
	const startY = Math.max(0, placement.y - padding);
	const endY = Math.min(space.height - 1, shape.height + placement.y + padding);
	for (let x = startX; x <= endX; x++) {
		for (let y = startY; y <= endY; y++) {
			yield {
				absolute: { x, y },
				relative: {
					x: x - placement.x,
					y: y - placement.y
				}
			};
		}
	}
}

function * searchZoneFrom(
	space: Grid<number>,
	shape: Grid<number>,
	placement: Coord
) : Generator<Coord> {
	for (const coord of absoluteCoordMapping(space, shape, placement, 1)) {
		if (space.get(coord.absolute) === 0) yield coord.absolute;
	}
}

function place(space: Grid<number>, shape: Grid<number>, placement: Coord) {
	// if out of bounds, return false early to indicate placement
	// isn't possible.
	if (shape.width + placement.x > space.width) return false;
	if (shape.height + placement.y > space.height) return false;

	const coordsPlaced: Coord[] = [];
	for (const coord of absoluteCoordMapping(space, shape, placement)) {
		const shouldSet = !!shape.get(coord.relative);
		const isAlreadyFilled = !!space.get(coord.absolute);
		if (isAlreadyFilled && shouldSet) {
			// collision. undo what we've done and return false to indicate
			// placement isn't possible.
			for (const undoCoord of coordsPlaced) {
				space.set(undoCoord, 0);
			}
			return false;
		} else if (shouldSet) {
			space.set(coord.absolute, 1);
			coordsPlaced.push(coord.absolute);
		}
	}

	return true;
}

function remove(space: Grid<number>, shape: Grid<number>, placement: Coord) {
	// NOTE: no bounds checking, meth, etc. assumes original placement occurred.
	for (const coord of absoluteCoordMapping(space, shape, placement)) {
		if (shape.get(coord.relative)) space.set(coord.absolute, 0);
	}
}


/**
 * WIP ... not sure this solution will actually run in the required time.
 * But, plenty of optimizations left to do here.
 * @returns 
 */
function part1() {
	return sum(spaces.slice(0, 3).map((space, i) => {
		const grid = Grid.fromDimensions(space.width, space.height, () => 0);
		const result = canFit(grid, [...space.shapes]) ? 1 : 0;
		console.log('finished space', i);
		return result
	}));
}

console.log(
	shapes.map(g => g.map(s => s.toString()).join('\n\n')).join('\n\n---\n\n'),
	'\n',
	spaces
);

console.table([
	time('part1', part1)
]);