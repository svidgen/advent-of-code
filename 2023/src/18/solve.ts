import { 
	lines,
	PriorityQueue,
	Coord,
	Cursor,
	Direction,
	Grid,
} from '../common';

type ColoredPoint = {
	x: number;
	y: number;
	r: number;
	g: number;
	b: number;
};

class Segment<T extends Coord> {
	constructor(
		public a: Coord,
		public b: Coord,
		public data: Omit<T, 'x' | 'y'>
	) {}
}

type IndexOf<T, KeyType = number> = {
	[K in keyof T]: KeyType[]
};

class Path<T extends Coord> {
	origin: Coord;
	points: T[] = [];
	index: IndexOf<T> = {} as IndexOf<T>;

	constructor(origin: Coord) {
		this.origin = origin;
	}

	add(point: T) {
		for (const [k, v] of Object.entries(point)) {
			this.index[k] = this.index[k] || [];
			this.index[k][v] = this.points.length;
		}
		this.points.push(point);
	}

	private * _segments() {
		for (let i = 0; i < this.points.length; i++) {
			const a: Coord = i === 0 ? this.origin : this.points[i - 1];
			const b = this.points[i];
			yield new Segment<T>(a, b, b);
		}
	}

	public segments() {
		return this._segments();
	}
}

const path = new Path({x: 0, y: 0});
const format = /^(\w) (\d) \(#([0-9a-f]{6})\)$/;
for (const line of lines) {
	const match = line.match(format);
	console.log({match});
	if (!match) continue;
}
