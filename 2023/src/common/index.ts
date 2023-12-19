import * as fs from 'fs';
import * as process from 'process';
export const raw = fs.readFileSync(process.argv[2], 'utf-8');
export const lines = raw.trim().split(/\n/);

export function sum(values: number[]): number {
	let total = 0;
	for (const v of values) total+= v;
	return total;
}

export type Coord = {
	x: number;
	y: number;
}

export type DataCoord<T> = Coord & { data: T };

export enum Direction {
	north = '↑',
	south = '↓',
	east = '→',
	west = '←',
}

export class Grid<T> {
	data: T[][] = []; // in [y][x] orientation
	width: number = 0;
	height: number = 0;

	constructor(data: T[][]) {
		this.data = data;
		this.height = this.calculateHeight();
		this.width = this.calculateWidth();
	}

	static parse(lines: string[]): Grid<string> {
		const data = lines.map(line => line.split('')); 
		return new Grid(data);
	}

	static fromDimensions<T = string>(
		width: number,
		height: number,
		initialize?: (x: number, y: number) => T
	): Grid<T> {
		const _initialize = (initialize ?? (() => "")) as (x: number, y: number) => T;
		const data: T[][] = Array<T[]>(height);;
		for (let y = 0; y < height; y++) {
			data[y] = Array<T>(width);
			for (let x = 0; x < width; x++) {
				data[y][x] = _initialize(x, y);
			}
		}
		return new Grid(data);
	}

	calculateHeight() {
		return this.data.length;
	}

	calculateWidth() {
		return Math.max(...this.data.map(row => row.length));
	}

	includes(coord: Coord): boolean {
		return (
			coord.x >= 0 &&
			coord.x < this.width &&
			coord.y >= 0 &&
			coord.y < this.height
		);
	}

	get(coord: Coord): T | undefined {
		return this.data[coord.y]?.[coord.x];
	}

	set(coord: Coord, value: T) {
		this.data[coord.y] = this.data[coord.y] || [];
		this.data[coord.y][coord.x] = value;
		if (coord.x > this.width) this.width = coord.x;
		if (coord.y > this.width) this.height = coord.y;
	}

	vertical(x: number): T[] {
		let items: T[] = [];
		for (let y = 0; y < this.height; y++) {
			items.push(this.get({x, y})!);
		}
		return items;
	}

	setVertical(x: number, v: T[]) {
		for (let y = 0; y < this.height; y++) {
			this.set({x,y}, v[y]);
		}
	}

	setHorizontal(y: number, h: T[]) {
		for (let x = 0; x < this.width; x++) {
			this.set({x,y}, h[x]);
		}
	}

	horizontal(y: number): T[] {
		let items: T[] = [];
		for (let x = 0; x < this.height; x++) {
			items.push(this.get({x, y})!);
		}
		return items;
	}

	get verticals(): T[][] {
		const result: T[][] = [];
		for (let x = 0; x < this.width; x++) {
			result.push(this.vertical(x));
		}
		return result;
	}

	set verticals(v: T[][]) {
		for (let x = 0; x < this.width; x++) {
			this.setVertical(x, v[x]);
		}
	}

	get horizontals(): T[][] {
		const result: T[][] = [];
		for (let y = 0; y < this.height; y++) {
			result.push(this.horizontal(y));
		}
		return result;
	}

	set horizontals(h: T[][]) {
		for (let y = 0; y < this.height; y++) {
			this.setHorizontal(y, h[y]);
		}
	}

	private *_coords() {
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				yield {x, y};
			}
		}
	}

	get coords() {
		return this._coords();
	}

	reduce<RT>(fn: (accumulator: RT, currentValue: T, coord: Coord) => RT, init: RT) {
		let acc = init;
		for (const coord of this.coords) {
			acc = fn(acc, this.get(coord)!, coord);
		}
		return acc;
	}

	map<RT>(fn: (currentValue: T, coord: Coord) => RT): Grid<RT> {
		const data: RT[][] = [];
		for (const coord of this.coords) {
			const mapped = fn(this.get(coord)!, coord);
			data[coord.y] = data[coord.y] || [];
			data[coord.y][coord.x] = mapped;
		}
		return new Grid(data);
	}

	toString(map: (item: T) => string = String) {
		return this.data.map(line => 
			line.map(item => map(item)).join('')
		).join('\n');
	}
}

export class Cursor {
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

export type CursorStep<T, ST> = (tracer: StepTracer<T, ST>, coord: Cursor) => void;

export class StepTracer<T, StateType = string> {
	cursors: Cursor[] = [];
	state: Grid<StateType>;
	log: any[] = [];

	constructor(
		public grid: Grid<T>,
		public stateInit: (x: number, y: number) => StateType,
		public cursorStep: CursorStep<T, StateType>,
		public maxSteps: number = 1_000_000,
	) {
		this.reset();
	}

	reset() {
		this.log = [];
		this.state = Grid.fromDimensions(this.grid.width, this.grid.height, this.stateInit);
		this.cursors = [];
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
		while (this.cursors.length > 0 && steps < this.maxSteps) {
			this.step();
			steps++;
		}
	}
}


