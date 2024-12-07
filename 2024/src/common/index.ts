import * as fs from 'fs';
import * as process from 'process';

/**
 * The input from the filename specified by the first CLI argument.
 */
export const raw = fs.readFileSync(process.argv[2], 'utf-8');

/**
 * The input from `raw` as an array of individual lines.
 */
export const lines = raw.trim().split(/\n/);

/**
 * The input from `raw` broken out by "blocks", where a "block" is a
 * chunk of input separated by exactly two newlines.
 */
export const blocks = raw.trim().split(/\n\n/).map(raw => ({
	raw,
	lines: raw.trim().split(/\n/)
}));

export function sum(values: number[]): number {
	let total = 0;
	for (const v of values) total+= v;
	return total;
}

/**
 * Transpose columnar input lines from something like this:
 * 
 * ```txt
 * 1	2
 * 2	3
 * 1	5
 * 3	9
 * ```
 * 
 * Into this:
 * 
 * ```json
 * [
 * 	["1", "2", "1", "3"],
 * 	["2", "3", "5", "9"]
 * ]
 * ```
 * 
 * @param lines 
 */
export function transposeLines(lines: string[]): string[][] {
	const data = [] as string[][];
	for (const line of lines) {
		const cols = line.split(/\s+/g);
		for (const [i, col] of cols.entries()) {
			data[i] = data[i] || [];
			data[i].push(col);
		}
	}
	return data;
}

export function mapGrid<FROM, TO>(grid: FROM[][], map: ((v: FROM) => TO)): TO[][] {
	const result = [] as TO[][];
	for (const [ir, row] of grid.entries()) {
		result[ir] = result[ir] || [];
		for (const [ic, v] of row.entries()) {
			result[ir][ic] = map(v);
		}
	}
	return result;
}

/**
 * For sorting by number value instead of string value.
 * 
 * @param a 
 * @param b 
 */
export function byValue(a: number, b: number): number {
	return a - b;
}

export function zipMap<FROM, TO>(
	a: FROM[],
	b: FROM[],
	map: ((a: FROM | undefined, b: FROM | undefined) => TO)
): TO[] {
	const result = [] as TO[];
	let i = 0;
	let MAX = Math.max(a.length, b.length);
	for (; i < MAX; i++) {
		result.push(map(a[i], b[i]));
	}
	return result;
}

export function index<T>(items: T[]): Map<T, number[]> {
	const index = new Map<T, number[]>();
	for (const [idx, value] of items.entries()) {
		if (!index.has(value)) index.set(value, []);
		index.get(value)?.push(idx);
	}
	return index;
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

export type TurnDirection = 'right' | 'left';

/**
 * Grid of lines where `y` is inverted (like row number) instead of a
 * mathematical graph. Corners are:
 * 
 * ```
 * 0,0 ... X,0
 * .         .
 * .         .
 * 0,Y ... X,Y
 * ```
 */
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

	* find(predicate: (item: T) => boolean): Generator<Coord> {
		for (const coord of this.coords) {
			if (predicate(this.get(coord)!)) yield coord
		}
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

	searchAt<RT>(
		coord: Coord,
		search: (itemGen: Generator<T>) => RT,
		directions: 'all' | 'cardinal' = 'all'
	): RT[] {
		const searchBeams = [
			this.searchBeaconAt(coord, [Direction.north]),
			this.searchBeaconAt(coord, [Direction.south]),
			this.searchBeaconAt(coord, [Direction.east]),
			this.searchBeaconAt(coord, [Direction.west]),
		];

		if (directions === 'all') {
			searchBeams.push(
				this.searchBeaconAt(coord, [Direction.north, Direction.east]),
				this.searchBeaconAt(coord, [Direction.north, Direction.west]),
				this.searchBeaconAt(coord, [Direction.south, Direction.east]),
				this.searchBeaconAt(coord, [Direction.south, Direction.west]),
			);
		}

		const results: RT[] = [];
		for (const beam of searchBeams) {
			results.push(search(beam));
		}
		return results;
	}

	* searchBeaconAt(coord: Coord, stepping: Direction[]): Generator<T> {
		let x = coord.x;
		let y = coord.y;

		const stepX =
			stepping.includes(Direction.north) ? 1
				: stepping.includes(Direction.south) ? -1
					: 0;
		
		const stepY =
			stepping.includes(Direction.east) ? 1
				: stepping.includes(Direction.west) ? -1
					: 0;
		
		while (this.includes({ x, y })) {
			yield this.get({ x, y })!;
			x += stepX;
			y += stepY;
		}
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

	copy() {
		return this.map((v,_c) => v);
	}

	toString(map: (item: T) => string = String) {
		return this.data.map(line => 
			line.map(item => map(item)).join('')
		).join('\n');
	}
}

type CursorPath<T> = Pick<Cursor<T>, 'coord' | 'direction' | 'state'>;

export class Cursor<T = any> {
	coord: Coord;
	direction: Direction;
	state: T;
	path: CursorPath<T>[] | undefined;

	constructor(
		coord: Coord,
		direction: Direction,
		state: T,
		path?: CursorPath<T>[] | undefined,
	) {
		this.coord = {...coord};
		this.direction = direction;
		this.state = state;
		if (path) this.path = path.map(p => ({...p}));
	}

	step(direction?: Direction) {
		this.path?.push({
			coord: {...this.coord},
			direction: this.direction,
			state: this.state
		});
		if (direction) this.direction = direction;
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

	undo(direction?: Direction) {
		const returnToDirection = direction || this.direction;
		const undoDirection = {
			[Direction.north]: Direction.south,
			[Direction.south]: Direction.north,
			[Direction.east]: Direction.west,
			[Direction.west]: Direction.east
		}[direction || this.direction];
		this.step(undoDirection);
		this.direction = returnToDirection;

		// undo assumes we made a mistake or "bumped into" something by stepping
		// into a cell we can't validly visit. Hence, both the step into that cell
		// and the step *out* of that cell should be un-recorded.
		this.path?.pop();
		this.path?.pop();
	}

	turn(direction: TurnDirection) {
		const offset = direction === 'right' ? 0 : 1;
		const turns = {
			[Direction.north]: [Direction.east, Direction.west],
			[Direction.east]: [Direction.south, Direction.north],
			[Direction.south]: [Direction.west, Direction.east],
			[Direction.west]: [Direction.north, Direction.south],
		};
		this.direction = turns[this.direction][offset];
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

	copy({coord, direction, state, path}: {
		coord?: Coord,
		direction?: Direction,
		state?: T,
		path?: CursorPath<T>[],
	}) {
		return new Cursor<T>(
			{...(coord || this.coord)},
			direction || this.direction,
			state ?? this.state,
			path || this.path,
		);
	}

	toString() {
		return JSON.stringify({
			x: this.coord.x,
			y: this.coord.y,
			d: this.direction
		});
	}
}

export type CursorStep<T, ST> = (tracer: StepTracer<T, ST>, cursor: Cursor) => void;

export class StepTracer<T, StateType = string> {
	cursors: Cursor[] = [];
	removed: Set<Cursor> = new Set<Cursor>;
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
		this.removed = new Set<Cursor>();
	}

	add(cursor: Cursor) {
		this.cursors.push(cursor);
	}

	remove(cursor: Cursor) {
		this.removed.add(cursor);
	}

	step() {
		// cursors might add or remove cursors as we go. but, these additions
		// are not part of the current step.
		const cursors = this.cursors.filter(c => !this.removed.has(c));
		this.cursors = [];
		for (const cursor of cursors) {
			this.cursorStep(this, cursor);
		}
		this.cursors = this.cursors.concat(cursors);
	}

	run(callback?: (steps: number) => any) {
		let steps = 0;
		while (this.cursors.length > 0 && steps < this.maxSteps) {
			this.step();
			steps++;
			if (callback && callback(steps)) break;
		}
	}
}

class QueueNode<T> {
	constructor(
		public value: T,
		public next?: QueueNode<T> | undefined,
	) {}
}

export class Queue<T> {
	head: QueueNode<T> | undefined;
	tail: QueueNode<T> | undefined;
	_size: number = 0;

	get isEmpty() {
		return this._size === 0;
	}

	get size() {
		return this._size;
	}

	enqueue(item: T) {
		const node = new QueueNode(item);
		if (!this.head) {
			this.head = node;
		} else if (this.tail) {
			this.tail.next = node;
			this.tail = node;
		} else {
			this.head.next = node;
			this.tail = node;
		}
		this._size++;
	}

	dequeue(): T | undefined {
		if (this.head) {
			const item = this.head.value;
			this.head = this.head.next;
			this._size--;
			return item;
		}
	}

	clear() {
		this.head = undefined;
		this.tail = undefined;
		this._size = 0;
	}
}

const EMPTY = Number.POSITIVE_INFINITY;

export class PriorityQueue<T> {
	buckets: Queue<T>[] = [];
	min: number = EMPTY;
	private _size: number = 0;

	get isEmpty() {
		return this.size === 0;
	}

	get size() {
		return this._size;
	}

	enqueue(item: T, priority: number) {
		const p = Math.max(0, Math.floor(priority));
		this.buckets[p] = this.buckets[p] || new Queue<T>();
		this.buckets[p].enqueue(item);
		this._size++;
		this.min = Math.min(p, this.min);
	}

	dequeue(): T | undefined {
		if (this.isEmpty) return;

		let item: T | undefined;
		while (!item) {
			const bucket = this.buckets[this.min];
			if (!!bucket) {
				item = bucket.dequeue();
				if (bucket.size === 0) this.min++;
			} else {
				this.min++;
			}
		}

		this._size--;
		if (this._size === 0) this.min = EMPTY;

		return item;
	}
}

export type Prioritized = {
	priority: number;
}

export class AutoPriorityQueue<T extends Prioritized> extends Queue<T> {
	private q = new PriorityQueue<T>();

	get isEmpty() {
		return this.q.isEmpty;
	}

	get size() {
		return this.q.size;
	}

	enqueue(item: T) {
		this.q.enqueue(item, item.priority);
	}

	dequeue() {
		return this.q.dequeue();
	}
}
