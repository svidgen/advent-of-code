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

	get canFitShapesHeuristic() {
		const shapeArea = sum(this.shapes.map((qty, i) => qty * shapeAreas[i]));
		return shapeArea < this.width * this.height;
	}
}

const shapeAreas: number[] = [];
const spaces: Space[] = []

for (const block of blocks) {
	if (block.lines[0].match(/^\d+:/)) {
		const baseShape = Grid
			.parse(block.lines.slice(1))
			.map(v => v === '#' ? 1 : 0);
		shapeAreas.push(Array.from(baseShape.find(v => v === 1)).length);
	} else {
		for (const line of block.lines) {
			spaces.push(Space.parse(line));
		}
	}
}

function part1() {
	return sum(spaces.map(space => space.canFitShapesHeuristic ? 1 : 0));
}

console.table([
	time('part1', part1)
]);