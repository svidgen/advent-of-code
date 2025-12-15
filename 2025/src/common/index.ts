import { SlowBuffer } from 'buffer';
import * as fs from 'fs';
import * as process from 'process';

/**
 * The input from the filename specified by the first CLI argument.
 */
export const raw = process.argv[2] ? fs.readFileSync(process.argv[2], 'utf-8') : '';

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


export function time(label: string, f: () => any) {
	const start = performance.now();
	const result = f();
	const end = performance.now();
	return {
		label,
		result,
		time: end - start
	};
}

export function sum<T extends number[] | bigint[]>(values: T): T[number] {
	let total = (typeof values[0] === 'bigint' ? 0n : 0) as T[number];
	// @ts-ignore
	for (const v of values) total = total + v;
	return total;
}

export function product(values: number[]): number {
	let p = 1;
	for (const v of values) p *= v;
	return p;
}

export function unique<T>(values: T[], equals: (a: T, b: T) => boolean) {
	const out: T[] = [];
	for (const candidate of values) {
		if (!out.some(existing => equals(existing, candidate))) {
			out.push(candidate);
		}
	}
	return out;
}

/**
 * Calculates `v mod m`, accounting for negative numbers (which JavaScript's)
 * `%` operator (the "remainder" operator) doesn't do.
 * 
 * @param v
 * @param m
 * @returns 
 */
export function mod(v: number, m: number): number {
	return ((v % m) + m) % m;
}

/**
 * Shallow copy.
 */
export function copy<T extends object>(obj: T): T {
	return Object.fromEntries(Object.entries(obj)) as T;
}

export function group<T>(items: T[], groupBy: (item: T) => string): Map<string, T[]> {
	const groups = new Map<string, T[]>();
	for (const item of items) {
		const name = groupBy(item);
		if (!groups.has(name)) groups.set(name, []);
		groups.get(name)!.push(item);
	}
	return groups;
}

/**
 * Turns a line of digits into an array of integers.
 * 
 * @param line 
 */
export function digitsFrom(line: string): number[] {
	return line.trim().split('').map(d => parseInt(d));
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

/**
 * Transpose something like this:
 * 
 * ```
 * [
 * 	[1, 2],
 * 	[3, 4],
 * 	[5, 6]
 * ]
 * ```
 * 
 * Into this:
 * 
 * ```
 * [
 * 	[1, 3, 5],
 * 	[2, 4, 6]
 * ]
 * ```
 * 
 * @param arr 
 */
export function transposeArray<T>(arr: T[][]): T[][] {
	const result: T[][] = [];
	for (let r = 0; r < arr.length; r++) {
		for (let c = 0; c < arr[r].length; c++) {
			if (!result[c]) result[c] = [];
			result[c].push(arr[r][c]);
		}
	}
	return result;
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
export function byValue<T extends number | bigint>(a: T, b: T): number {
	return a === b ? 0 : (a > b ? 1 : -1);
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

export function selfJoin<T>(items: T[], bidirectional: boolean = false): { a: T, b: T }[] {
	let results: { a: T, b: T}[] = [];
	for (let i = 0; i < items.length; i++) {
		for (let j = bidirectional ? 0 : i + 1; j < items.length; j++) {
			results.push({ a: items[i], b: items[j] });
		}
	}
	return results;
}

export type Coord = {
	x: number;
	y: number;
}

export type Velocity = Coord;

export type DataCoord<T> = Coord & { data: T };

export enum Direction {
	north = '↑',
	south = '↓',
	east = '→',
	west = '←',
}

export type TurnDirection = 'right' | 'left';

export function computeStep(from: Coord, direction: Direction[]): Coord {
	const result = { x: from.x, y: from.y };
	for (const d of direction) {
		switch (d) {
			case Direction.north:
				result.y--;
				break;
			case Direction.south:
				result.y++;
				break;
			case Direction.east:
				result.x++;
				break;
			case Direction.west:
				result.x--;
				break;
			default:
				throw new Error('Bad direction!');
		}
	}
	return result;
}

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
	defaultOnUndefined?: (x: number, y: number) => T;

	constructor(data: T[][], defaultOnUndefined?: ((x: number, y: number) => T)) {
		this.data = data;
		this.height = this.calculateHeight();
		this.width = this.calculateWidth();
		this.defaultOnUndefined = defaultOnUndefined;
	}

	static parse(
		lines: string[],
		defaultOnUndefined: () => string = () => ''
	): Grid<string> {
		const data = lines.map(line => line.split('')); 
		return new Grid(data, defaultOnUndefined);
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
		return new Grid(data, _initialize);
	}

	get area() {
		return this.width * this.height;
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

	equals(other: Grid<T>) {
		if (this.width !== other.width) return false;
		if (this.height !== other.height) return false;
		if (JSON.stringify(this.data) !== JSON.stringify(other.data)) {
			return false;
		}
		return true;
	}

	get(coord: Coord): T | undefined {
		const v = this.data[coord.y]?.[coord.x];
		return v === undefined ? this.defaultOnUndefined?.(coord.x, coord.y) : v;
	}

	/**
	 * Returns all neighbor coordinates, except those off the grid by default.
	 * 
	 * 1. coord - Coordinate to search around.
	 * 2. withOrdinals - Whether to include NE, SE, SW, NW coords. Default true.
	 * 3. withCardinals - Whether to include N, S, E, W coords. Default true.
	 * 4. withSelf - Whether to include the *given* coord. Default false.
	 * 5. withOffGrid - Whether to include coords off the grid. Default false.
	 * 
	 * Yields in the order of:
	 * 
	 * ```
	 * NW, N, NE, W, Self, E, SW, S, SE
	 * ```
	 */
	* neighbors(coord: Coord, {
		withCardinals = true,
		withOrdinals = true,
		withSelf = false,
		offGrid = false
	}: {
		withOrdinals?: boolean,
		withCardinals?: boolean,
		withSelf?: boolean,
		offGrid?: boolean
	} = {}): Generator<Coord> {
		for (let dy = -1; dy <= 1; dy++) {
			for (let dx = -1; dx <= 1; dx++) {
				if (dx === 0 && dy === 0) {
					if (!withSelf) continue;
				} else if (dx === 0 || dy === 0) {
					if (!withCardinals) continue;
				} else {
					if (!withOrdinals) continue;
				}

				const c = { x: coord.x + dx, y: coord.y + dy };
				if (!offGrid && !this.includes(c)) continue;
				
				yield c;
			}
		}
	}

	/**
	 * Sets a value in the grid, **expanding the grid by default as-needed**.
	 * @param coord 
	 * @param value 
	 */
	set(coord: Coord, value: T, autoExpand: boolean = true) {
		if (!autoExpand && !this.includes(coord)) return;
		this.data[coord.y] = this.data[coord.y] || [];
		this.data[coord.y][coord.x] = value;
		if (coord.x >= this.width) this.width = coord.x + 1;
		if (coord.y >= this.height) this.height = coord.y + 1;
	}

	setAll(value: T) {
		for (const coord of this.coords) {
			this.set(coord, value);
		}
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
		for (let x = 0; x < this.width; x++) {
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

	get rows() {
		return this.horizontals;
	}

	get cols() {
		return this.verticals;
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

	* searchBeaconCoordsAt(
		coord: Coord,
		stepping: Direction[],
	) : Generator<Coord> {
		let x = coord.x;
		let y = coord.y;

		const stepX =
			stepping.includes(Direction.east) ? 1
				: stepping.includes(Direction.west) ? -1
					: 0;
		
		const stepY =
			stepping.includes(Direction.south) ? 1
				: stepping.includes(Direction.north) ? -1
					: 0;
		
		while (this.includes({ x, y })) {
			yield { x, y };
			x += stepX;
			y += stepY;
		}
	}

	* searchBeaconAt(
		coord: Coord,
		stepping: Direction[],
	) : Generator<T> {
		for (const c of this.searchBeaconCoordsAt(coord, stepping))
			yield this.get(c)!;
	}

	* searchBeaconWithCoordsAt(
		coord: Coord,
		stepping: Direction[],
	) : Generator<{ coord: Coord, value: T }> {
		for (const c of this.searchBeaconCoordsAt(coord, stepping))
			yield { coord: c, value: this.get(c)! };
	}

	* lineOfSight(
		from: Coord,
		direction: Direction[],
		predicate: (cell: { coord: Coord, value: T }) => boolean,
		inclusive: boolean = false
	) {
		for (const cell of this.searchBeaconWithCoordsAt(from, direction)) {
			if (predicate(cell)) {
				if (inclusive) yield cell;
				break;
			} else {
				yield cell;
			}
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

	rotateLeft() {
		const out = Grid.fromDimensions(
			this.height,
			this.width,
			this.defaultOnUndefined
		)
		for (const c of this.coords) {
			const x = c.y;
			const y = this.width - c.x - 1;
			out.set({ x, y }, this.get(c)!);
		}
		return out;
	}

	flip(direction: 'horizontally' | 'vertically') {
		const out = this.copy();
		if (direction === 'horizontally') {
			for (let y = 0; y < out.height; y++) {
				out.data[y].reverse();
			}
		} else {
			out.data.reverse();
		}
		return out;
	}

	findAllUniquePermutations() {
		const perms: Grid<T>[] = [];
		
		let lastPerm = this.copy();
		perms.push(lastPerm);
		perms.push(lastPerm.flip('horizontally'));

		for (let i = 0; i < 3; i++) {
			const perm = lastPerm.rotateLeft();
			perms.push(perm);
			perms.push(perm.flip('horizontally'));
			lastPerm = perm;
		}

		return unique(perms, (a, b) => a.equals(b));
	}

	toString(map: (item: T | undefined) => string = String) {
		const stringification: string[] = [];
		for (let y = 0; y < this.height; y++) {
			const line = this.data[y] || [];
			const mappedLine: string[] = [];
			for (let x = 0; x < this.width; x++) {
				const d = line[x] === undefined ? (this.defaultOnUndefined?.(x, y)) : line[x];
				mappedLine.push(map(d));
			}
			stringification.push(mappedLine.join(''));
		}
		return stringification.join('\n');
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
		this.coord = computeStep(this.coord, [this.direction]);
		return this;
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
		return this;
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

export type CursorStep<T, ST, CT = any> = (
	tracer: StepTracer<T, ST>,
	cursor: CT
) => void;

export class StepTracer<
	T,
	StateType = string,
	CursorType extends Cursor<any> = Cursor<any>
> {
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

	static build<T, StateType, CursorType extends Cursor<any>>({
		grid,
		stateInit,
		cursorInit,
		cursorStep,
		maxSteps = 1_000_000
	}: {
		grid: Grid<T>,
		stateInit: (x: number, y: number) => StateType,
		cursorInit: (
			x: number,
			y: number,
			grid: Grid<T>
		) => CursorType | null,
		cursorStep: CursorStep<T, StateType, CursorType>,
		maxSteps?: number
	}) {
		const tracer = new StepTracer<T, StateType, CursorType>(
			grid,
			stateInit,
			cursorStep,
			maxSteps
		);
		for (const coord of grid.coords) {
			const c = cursorInit(coord.x, coord.y, grid);
			if (c) tracer.add(c);
		}
		return tracer;
	}

	reset() {
		this.log = [];
		this.state = Grid.fromDimensions(this.grid.width, this.grid.height, this.stateInit);
		this.cursors = [];
		this.removed = new Set<Cursor>();
	}

	add(cursor: CursorType) {
		this.cursors.push(cursor);
	}

	remove(cursor: CursorType) {
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

export class ProgrammableCursor<T> {
	public location: Coord;

	constructor(
		public grid: Grid<T>,
		public start: Coord,
		public program: {
			/**
			 * Called after the step is started, but before the ProgrammableCursor
			 * attemps to update the grid with its new location.
			 * 
			 * This allows the callback to manipulate the grid or cursor ahead of
			 * the completion of the step. Useful for things like:
			 * 
			 * 1. Moving the cursor elsewhere
			 * 1. Moving the cursor back to its `from` location. E.g., if it hits a wall.
			 * 1. Pushing items ahead of it.
			 * 
			 * Direction is provided as a convenience and can be provided to a grid's
			 * `searchBeaconAt()` method directly to "look" in the direction the cursor
			 * is headed.
			 * 
			 * This is also where the grid should be updated if drawing/keeping the grid
			 * up to date is desired.
			 * 
			 * @param step 
			 * @returns 
			 */
			onStep?: (step: {
				direction: Direction[];
				from: Coord;
				into: Coord;
			}) => void

			/**
			 * The list of steps the cursor will take when run.
			 */
			steps: Direction[][],
		}
	) {
		this.location = this.start;
	}

	step(direction: Direction[]) {
		const from = this.location;
		this.location = computeStep(from, direction);
		this.program.onStep?.({
			direction,
			from,
			into: this.location
		});
	}

	run() {
		for (const direction of this.program.steps) {
			this.step(direction);
			// console.log('\n', direction, '\n');
			// console.log(this.grid.toString());
			// console.log();
		}
	}
}

export class Region<T> {
	public coords: Coord[] = [];

	constructor(public grid: Grid<T>, public map: Grid<Region<T> | null>) { }

	static findAll<T>(
		grid: Grid<T>,
		{
			withOrdinals = false,
			ignore = (_coord, _value) => false,
			fillInto = (from, into) => from === into
		}: {
			withOrdinals?: boolean;
			ignore?: (coord: Coord, value: T | undefined) => boolean,
			fillInto?: (from: T | undefined, into: T | undefined) => boolean
		} = {}
	): Set<Region<T>> {
		// const map = Grid.fromDimensions<Region<T> | null>(grid.width, grid.height, () => null);
		const map = Grid.fromDimensions<Region<T> | null>(0, 0, () => null);
		const regions = new Set<Region<T>>();
		for (const coord of grid.coords) {
			if (map.get(coord)) continue;
			if (ignore(coord, grid.get(coord))) continue;
			const region = new Region(grid, map);
			region.flood(coord, withOrdinals, ignore, fillInto);
			regions.add(region);
		}
		return regions;
	}

	flood(
		coord: Coord,
		withOrdinals: boolean,
		ignore: (coord: Coord, value: T | undefined) => boolean,
		fillInto: (from: T | undefined, into: T | undefined) => boolean
	) {
		const q = new Queue<Coord>();
		q.enqueue(coord);

		while (!q.isEmpty) {
			const c = q.dequeue()!;

			if (this.map.get(c)) continue;
			this.map.set(c, this);
			this.add(c);

			const cv = this.grid.get(c);
			for (const n of this.grid.neighbors(c, { withOrdinals })) {
				const nv = this.grid.get(n);
				if (!ignore(n, nv) && fillInto(cv, nv)) q.enqueue(n);
			}
		}
	}
	
	private add(coord: Coord) {
		this.coords.push(coord);
	}

	get value() {
		return this.coords.length > 0 ? this.grid.get(this.coords[0]) : undefined;
	}

	get area() {
		return this.coords.length;
	}

	get perimeter() {
		let perimeter = 0;

		// each coord has 4 sides and so contributes 4 perimeter *minus* the number of
		// "inside" edges. this can be determined by the number of neighbors it has.
		for (const coord of this.coords) {
			let contribution = 4;
			for (const n of this.map.neighbors(coord, { withOrdinals: false })) {
				if (this.map.get(n) === this) {
					contribution--;
				}
			}
			perimeter += contribution;
		}

		return perimeter;
	}

	/**
	 * Count of "sides".
	 * 
	 * A "side" is a contiguous/unbent section of the perimeter.
	 * 
	 * Each cell contributes to the side count based on how many corners it forms.
	 * I.e., if you start following a wall, every time you need to turn, a new side
	 * is formed.
	 * 
	 * ```
	 * ..........
	 * ..O.......
	 * ..OOO.....
	 * .OOOOO....
	 * .OOO.O....
	 * ...O......
	 * ```
	 */
	get sides() {
		return this.corners;
	}

	/**
	 * Count of corners.
	 * 
	 * A cell forms a corner at each "open" ordinal where the corresponding/adjacent
	 * cardinals are the same -- either both "closed" or both "open".
	 * 
	 * ```
	 * !ordinal && cardinalA === cardinalB
	 * ```
	 * 
	 * It also forms a corner if the ordinal is "closed" and the corresponding/adjacent
	 * cardinals are "open". See the "special corner" cases below.
	 * 
	 * ```
	 * ..OOOO....
	 * ..O..O.... // special corner case here!
	 * ..OOO..... // same special case here!
	 * .OOOOO....
	 * .OOO.O....
	 * ...O......
	 * ```
	 * 
	 * So that's:
	 * 
	 * ```
	 * ordinal && !cardinalA && !cardinalB
	 * ```
	 * 
	 * When these rules are combined:
	 * 
	 * ```
	 * (!ordinal && !cardinal) || (ordinal && !cardinals)
	 * ```
	 */
	get corners() {
		let corners = 0;

		for (const coord of this.coords) {
			const [NW, N, NE, W, E, SW, S, SE] = [
				...this.map.neighbors(coord, { offGrid: true })
			].map(c => this.map.get(c) === this);

			const NECorner = (NE && !N && !E) || (!NE && (N === E)) ? 1 : 0;
			const NWCorner = (NW && !N && !W) || (!NW && (N === W)) ? 1 : 0;
			const SECorner = (SE && !S && !E) || (!SE && (S === E)) ? 1 : 0;
			const SWCorner = (SW && !S && !W) || (!SW && (S === W)) ? 1 : 0;

			corners += NECorner + NWCorner + SECorner + SWCorner;
		}

		return corners;
	}

	get visual() {
		const v = Grid.fromDimensions<string>(this.map.width, this.map.height, () => '.');
		for (const c of this.coords) {
			v.set(c, 'O');
		}
		return v;
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
		if (this.tail) {
			this.tail.next = node;
			this.tail = node;
		} else {
			this.head = node;
			this.tail = node;
		}
		this._size++;
	}

	dequeue(): T | undefined {
		if (this.head) {
			const item = this.head.value;
			this.head = this.head.next;
			if (!this.head) this.tail = undefined;
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

	* [Symbol.iterator]() {
		while (!this.isEmpty) {
			yield this.dequeue()!;
		}
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

export type Equation = {
	y: number,
	x: number[]
};

export type Solution = number[];

export function equationTableRow(eq: Equation) {
	const out = {} as Record<string, number>;
	for (let i = 0; i < eq.x.length; i++) {
		out[`x${i}`] = Math.floor(eq.x[i] * 100) / 100;
	}
	out.y = Math.floor(eq.y * 100) / 100;
	return out;
}

export function reduce(equations: Equation[]): Equation[] | 'unsolvable' {
	if (equations.length === 0 || equations[0].x.length === 0) return 'unsolvable';
	if (equations.some(eq => Number.isNaN(eq.y) || !Number.isFinite(eq.y))) return 'unsolvable';

	const firstPopulatedIndex = (items: number[]) => {
		const idx = items.findIndex(v => !!v);
		return idx >= 0 ? idx : Number.MAX_SAFE_INTEGER
	};

	const isPopulated = (eq: Equation) => !eq.x.every(v => v === 0);

	const byFirstPopulated = (a: Equation, b: Equation) => {
		return firstPopulatedIndex(a.x) - firstPopulatedIndex(b.x);
	}

	let eq = equations.map(e => ({
		y: e.y,
		x: [...e.x]
	})).sort(byFirstPopulated);

	for (let r = 0; r < eq.length; r++) {
		let c = r;
		while (c < eq[r].x.length) {
			if (eq[r].x[c] !== 0) break;
			c++;
		}
		const cx = eq[r].x[c];

		if (!cx) continue;

		// propagate to all following rows, setting all other coefficients at `i` to 0
		for (let j = r + 1; j < eq.length; j++) {
			const coeff = eq[j].x[c];
			if (coeff === 0) continue;
			
			for (let xi = 0; xi < eq[j].x.length; xi++) {
				eq[j].x[xi] = eq[j].x[xi] * cx - eq[r].x[xi] * coeff;
			}
			eq[j].y = eq[j].y * cx - eq[r].y * coeff;
		}

		eq = [
			...eq.slice(0, r + 1),
			...eq.slice(r + 1).filter(isPopulated).sort(byFirstPopulated)
		];
	}

	// make positive
	for (const row of eq) {
		if (row.y < 0) {
			row.y = row.y * -1;
			for (let i = 0; i < row.x.length; i++) {
				row.x[i] = row.x[i] === 0 ? 0 : row.x[i] * -1;
			}
		}
	}

	// console.table(eq.map(equationTableRow));

	return eq.filter(eq => !eq.x.every(v => v === 0)).sort(byFirstPopulated);
}

export function freeVariables(equations: Equation[]): number[] {
	const freeVariables = new Set(
		Array(equations[0].x.length).fill(0).map((_, idx) => idx)
	);
	for (let eq of equations) {
		const firstNonZeroIndex = eq.x.findIndex(v => v !== 0);
		freeVariables.delete(firstNonZeroIndex);
	}
	return Array.from(freeVariables);
}


export function solveLinearSystem(equations: Equation[]): Solution | "unsolvable" {
	if (equations.length === 0 || equations[0].x.length === 0) return 'unsolvable';
	if (equations.some(eq => Number.isNaN(eq.y) || !Number.isFinite(eq.y))) return 'unsolvable';
	if (equations.length !== equations[0].x.length) return 'unsolvable';

	// console.log('solving');
	// console.table(equations.map(equationTableRow));

	const eq = reduce(equations);
	if (eq === 'unsolvable') return eq;

	// console.log('reduced');
	// console.table(eq.map(equationTableRow));

	const solution: number[] = [];

	for (let r = eq.length - 1; r >= 0; r--) {
		// console.log('pre-solving', r, eq[r]);
		// const cx = eq[r].x[r];
		// const solve = eq[r].y / cx;
		// solution.push(solve);

		// eq[r].y = solve;
		// eq[r].x[r] = 1;

		eq[r].y = eq[r].y / eq[r].x[r];
		eq[r].x[r] = 1;
		solution.push(eq[r].y);

		// propagate to all other rows
		for (let j = 0; j < r; j++) {
			const coeff = eq[j].x[r];
			if (coeff === 0) continue;
			for (let xi = 0; xi < eq[j].x.length; xi++) {
				eq[j].x[xi] = eq[j].x[xi] * eq[r].x[r] - eq[r].x[xi] * coeff;
			}
			eq[j].y = eq[j].y * eq[r].x[r] - eq[r].y * coeff;
		}

		// console.log('solved', r, { cx, solve }, eq[r]);
		// console.table(eq.map(equationTableRow));
	}

	// console.log('solving reduced')
	// console.table(eq.map(equationTableRow));

	if (solution.some(s => Number.isNaN(s))) return 'unsolvable';
	return solution.reverse();
}

export function isSolutionToLinearSystem(equations: Equation[], cx: number[]): boolean {
	for (const eq of equations) {
		if (sum(eq.x.map((x, i) => x * cx[i])) !== eq.y) return false;
	}
	return true;
}

export function partialLinearSystem(equations: Equation[], ci: number, cv: number): Equation[] {
	return equations.map(eq => {
		const y = eq.y - (eq.x[ci] * cv);
		const x = [...eq.x.slice(0, ci), ...eq.x.slice(ci + 1)]
		return { x, y };
	});
}

function * counter(fieldCount: number, limit: number = 100) {
	const fields = Array(fieldCount).fill(0);
	while (true) {
		yield [...fields];
		fields[0]++;
		for (let i = 0; i < fieldCount - 1; i++) {
			if (fields[i] == limit) {
				fields[i] = 0;
				fields[i + 1]++;
			}
		}
		if (fields[fieldCount - 1] === limit) return;
	}
}

function makeEquation(length: number, index: number, value: number): Equation {
	const x = Array(length).fill(0);
	x[index] = 1;
	return { y: value, x };
}

export function bestPositiveIntSolution(equations: Equation[]): Solution | undefined {
	const reduced = reduce(equations);
	if (reduced === 'unsolvable') throw new Error('Unsolvable.');

	const width = reduced[0].x.length

	const free = freeVariables(reduced);

	if (free.length === 0) {
		console.log('solving with no frees');
		console.table(reduced.map(equationTableRow));
		const solution = solveLinearSystem(reduced);
		if (solution === 'unsolvable') throw new Error('Unsolvable.');
		return solution;
	}

	let score = Number.MAX_SAFE_INTEGER;
	let bestSolution: Solution | undefined;
	const maxY = Math.max(
		...reduced.map(eq => Math.abs(eq.y) / Math.min(...eq.x.filter(Boolean).map(Math.abs)))
	) + 1;

	console.log('linear system')
	console.table(reduced.map(equationTableRow));
	console.table({
		free: free.length,
		maxY,
		permutations: maxY ** free.length
	});

	for (const choices of counter(free.length, maxY)) {
		if (sum(choices) > score) continue;

		const permutation = [...reduced];
		for (const [idx, slot] of free.entries()) {
			permutation.push(makeEquation(width, slot, choices[idx]))
		}
		// console.log('permutation');
		// console.table(permutation.map(equationTableRow));

		let solution = solveLinearSystem(permutation);
		if (solution === 'unsolvable') continue;
		const isSolution = isSolutionToLinearSystem(equations, solution);
		// console.log(`solution`, solution, isSolution);

		let solutionScore = sum(solution);
		let isIntSolution = solution.every(v => v - Math.floor(v) < 0.0000001 && v >= 0);

		if (isSolution && !isIntSolution) {
			const asInts = solution.map(x => Math.round(x));
			if (isSolutionToLinearSystem(equations, asInts)) {
				solution = asInts;
				solutionScore = sum(asInts);
				isIntSolution = true;
			}
		}

		if (isIntSolution && solutionScore < score) {
			score = solutionScore;
			bestSolution = solution;
		}
	}

	if (!bestSolution) {
		console.log('original');
		console.table(equations.map(equationTableRow));
		console.log('reduced');
		console.table(reduced.map(equationTableRow));
		throw new Error('solver error')
	}

	return bestSolution;
}

// export function bestPositiveIntSolution(
// 	equations: Equation[],
// 	score: (eq: Solution) => number
// ): Solution | undefined {
// 	const solutions = positiveIntSolutions(equations);
// 	solutions.sort((a, b) => score(a) - score(b));
// 	return solutions.shift();
// }

export class InclusiveRange {
	constructor(
		public start: number,
		public end: number
	) {}

	static parse(line: string) {
		const [start, end] = line.split('-').map(s => parseInt(s));
		return new InclusiveRange(start, end);
	}

	static sortByEnd(ranges: InclusiveRange[], direction: 'ASC' | 'DESC' = 'ASC'): InclusiveRange[] {
		return direction === 'ASC' ? ranges.sort((a, b) => a.end - b.end) : ranges.sort((a, b) => b.end - a.end);
	}

	/**
	 * Boils a bunch of ranges down into the smallest number of ranges needed to represent
	 * the intended values.
	 * 
	 * This is done by repeatedly sorting and combining the ranges until no more overlaps
	 * are present.
	 * 
	 * @param ranges 
	 */
	static boil(ranges: InclusiveRange[], alreadySorted = false): InclusiveRange[] {
		let rangesBeingProcessed = alreadySorted ? ranges : InclusiveRange.sortByEnd([...ranges]);

		while (true) {
			const round = singleBoil(rangesBeingProcessed);
			if (!round.workWasDone) return round.combined;
			rangesBeingProcessed = round.combined;
		}

		function singleBoil(_ranges: InclusiveRange[]): { combined: InclusiveRange[], workWasDone: boolean } {
			const combined: InclusiveRange[] = [];
			for (const range of _ranges) {
				const last = combined[combined.length - 1];
				if (last?.overlaps(range)) {
					last.expand(range);
				} else {
					combined.push(range.copy());
				}
			}
			return { combined, workWasDone: _ranges.length !== combined.length };
		}
	}

	get length() {
		return 1 + (this.end - this.start);
	}

	includes(n: number) {
		return (n >= this.start && n <= this.end);
	}

	overlaps(other: InclusiveRange) {
		if (this.start <= other.end && this.end >= other.start) return true;
	}

	/**
	 * WARNING: Creates a combined InclusiveRange *blindly assuming `this` overlaps `other`.*
	 * 
	 * @param other 
	 * @returns 
	 */
	combine(other: InclusiveRange): InclusiveRange {
		return this.copy().expand(other);
	}

	copy() {
		return new InclusiveRange(this.start, this.end);
	}

	expand(other: InclusiveRange): InclusiveRange {
		this.start = Math.min(this.start, other.start);
		this.end = Math.max(this.end, other.end);
		return this;
	}
}

export class Point {
	constructor(public coords: number[]) {};
	
	/**
	 * Creates a point from a Point from a string in "a,b,...n" form.
	 * 
	 * Dimensionality is implicied from the string.
	 * 
	 * E.g., "12,34,45" parses as 3D point `[12, 34, 45]`.
	 */
	static parse(coordString: string): Point {
		const coords = coordString.split(',').map(n => parseInt(n));
		return new Point(coords);
	}

	toString() {
		return this.coords.join(',');
	}
}

export class Edge {
	constructor(public a: Point, public b: Point) { }

	get distance() {
		if (this.a.coords.length !== this.b.coords.length) {
			throw new Error("Given points are in different dimensional spaces.");
		}
		let sum = 0;
		for (let i = 0; i < this.a.coords.length; i++) {
			sum += (this.a.coords[i] - this.b.coords[i])**2;
		}
		return Math.sqrt(sum);
	}

	/**
	 * Returns the canonical representation of the edge, with points serialized in
	 * alphanumerical order.
	 * 
	 * @returns 
	 */
	toString() {
		const [a, b] = [this.a.toString(), this.b.toString()].sort()
		return `${a}:${b}`;
	}

	/**
	 * Comparison function to sort an array of Edges by distance ascending.
	 * 
	 * @returns 
	 */
	static byDistance(a: Edge, b: Edge) {
		return a.distance - b.distance;
	}
}

export class Cluster {
	points = new Map<string, Point>();
	edges = new Map<string, Edge>();

	constructor(edges: Edge[]) {
		for (const edge of edges) {
			this.edges.set(edge.toString(), edge);
			this.points.set(edge.a.toString(), edge.a);
			this.points.set(edge.b.toString(), edge.b);
		}
	}

	static bySize(a: Cluster, b: Cluster): number {
		return a.size - b.size;
	}

	get size() {
		return this.points.size;
	}

	contains(point: Point) {
		return this.points.has(point.toString());
	}

	touches(edge: Edge) {
		return this.contains(edge.a) || this.contains(edge.b);
	}

	/**
	 * Adds points from the edge to the cluster, even if they're not connected to
	 * any other points in the cluster.
	 * 
	 * If either point is new to the cluster, the edge is also added.
	 * 
	 * Returns the number of points from the edge that were added.
	 */
	add(edge: Edge): number {
		let pointsAdded = 0;

		if (!this.contains(edge.a)) {
			pointsAdded++;
			this.points.set(edge.a.toString(), edge.a);
		}

		if (!this.contains(edge.b)) {
			pointsAdded++;
			this.points.set(edge.b.toString(), edge.b);
		}

		this.edges.set(edge.toString(), edge);

		return pointsAdded;
	}

	cannibalize(other: Cluster) {
		for (const point of other.points.values()) {
			this.points.set(point.toString(), point);
		}
		for (const edge of other.edges.values()) {
			this.edges.set(edge.toString(), edge);
		}
	}
}

export class Space {
	constructor(public points: Point[]) {}

	static parse(lines: string[]) {
		return new Space(lines.map(l => Point.parse(l)));
	}

	* _AllPossibleEdges() {
		for (let i = 0; i < this.points.length; i++) {
			for (let j = i + 1; j < this.points.length; j++) {
				yield new Edge(this.points[i], this.points[j]);
			}
		}
	}

	get AllPossibleEdges() {
		return this._AllPossibleEdges();
	}

	findClusters<T extends number | undefined>(maxEdges: T): T extends number ? Cluster[] : Edge[] {
		const visitedPoints = new Set<string>();
		const edges = Array.from(this.AllPossibleEdges).sort(Edge.byDistance);
		const clusters: Cluster[] = [];
		const visitedEdges: Edge[] = [];

		for (const edge of maxEdges ? edges.slice(0, maxEdges) : edges) {
			const touchingClusters = clusters.filter(c => c.touches(edge));
			if (touchingClusters.length === 0) {
				clusters.push(new Cluster([edge]));
			} else if (touchingClusters.length === 1) {
				touchingClusters[0].add(edge);
			} else if (touchingClusters.length === 2) {
				touchingClusters[0].cannibalize(touchingClusters[1]);
				const indexB = clusters.indexOf(touchingClusters[1]);
				clusters.splice(indexB, 1);
			}

			visitedPoints.add(edge.a.toString());
			visitedPoints.add(edge.b.toString());
			const allPointsConsumed = visitedPoints.size === this.points.length;
			const allOneCluster = clusters.length === 1;

			visitedEdges.push(edge);
			
			if (allPointsConsumed && allOneCluster) {
				break;
			}
		}

		return (typeof maxEdges === 'undefined' ? visitedEdges : clusters) as any;
	}
}

export type TraversalState<S> = { state: S, steps: number[], priority: number };

export type TraversalOptions<S> = {
	state: S;
	visitedKey?: (state: S) => string;
	hardFail?: (state: S) => boolean;
	goal: (state: S) => boolean;
	edges: (state: S) => S[];
}

export function findShortestPath<S>(options: TraversalOptions<S>): TraversalState<S> | undefined {
	const keyof = (options.visitedKey ? options.visitedKey : s => JSON.stringify(s));
	const hardFail = (options.hardFail ? options.hardFail : () => false);
	const visited = new Set<string>();
	const q = new AutoPriorityQueue<TraversalState<S>>();

	q.enqueue({ state: options.state, steps: [], priority: 0 });
	while (!q.isEmpty) {
		const s = q.dequeue()!;
		const k = keyof(s.state);

		if (options.goal(s.state)) return s;
		if (visited.has(k)) continue;
		if (hardFail(s.state)) continue;
		visited.add(k);
		
		const edges = options.edges(s.state);
		for (let i = 0; i < edges.length; i++) {
			const newState = edges[i];
			q.enqueue({
				state: newState,
				steps: [...s.steps, i],
				priority: s.priority + 1
			});
		}
	}

	return undefined;
}

export type GeneralDFS<S, R> = {
	state: S;
	visit: (path: string[], state: S, childResults: R[]) => R;
	childrenOf: (state: S) => S[];
	pathStringOf?: (state: S) => string;
	memoKeyOf?: (state: S, path: string[]) => string;
};

export function dfs<S, R>(
	options: GeneralDFS<S, R>,
	memos: Map<string, R> = new Map<string, R>(),
	visited: string[] = [],
): R {
	const pathStringOf = (options.pathStringOf ? options.pathStringOf :
		(s: S) => typeof s === 'string' ? s : JSON.stringify(s)
	);
	const memoKeyOf = options.memoKeyOf ? options.memoKeyOf : (s: S) => JSON.stringify(s);

	const pathString = pathStringOf(options.state);
	const key = memoKeyOf(options.state, visited);

	if (memos.has(key)) return memos.get(key)!;
	visited.push(pathString);

	const childResults = options.childrenOf(options.state)
		.filter(s => !visited.includes(pathStringOf(s)))
		.map(state => dfs({ ...options, state }, memos, visited));
	const result = options.visit(visited, options.state, childResults);

	memos.set(key, result);
	visited.pop();
	return result;
}

class PrefixTree<T> {
	/**
	 * Linkage back to the parent node.
	 */
	parent: PrefixTree<T> | undefined;

	/**
	 * Key associated with this node.
	 * Root node should be `undefined`.
	 */
	key: string | undefined;

	/**
	 * ```
	 * {
	 *   "A" => PrefixTree({ key: "A", ... }),
	 *   "B" => PrefixTree({ key: "B", ... }),
	 *   ... etc. .. 
	 * }
	 * ```
	 */
	children = new Map<string, PrefixTree<T>>;

	value: T | undefined;

	constructor(options: { key?: string, parent?: PrefixTree<T>, value?: T }) {
		this.parent = options.parent;
		this.key = options.key;
		this.value = options.value;
	}

	/**
	 * Adds a single key from a list of the key parts.
	 * 
	 * The first part of the key is taken to be a child of `this` node, which
	 * allows for consistent insertion semantics at the root node, which has an
	 * `undefined` key value by definition.
	 * @param key 
	 * @returns 
	 */
	set(key: string[], value?: T) {
		if (key.length === 0) return;
		const [firstPart, ...rest] = key;
		if (!this.children.has(firstPart)) {
			this.children.set(firstPart, new PrefixTree({ parent: this, key: firstPart }));
		}
		if (rest.length > 0) {
			this.children.get(firstPart)!.set(rest, value);
		} else {
			this.children.get(firstPart)!.value = value;
		}
	}

	/**
	 * Gets the subtree from a list of key parts.
	 * 
	 * The first part of the key is taken to be a child of `this` node.
	 * 
	 * @param key 
	 * @returns 
	 */
	subtree(key: string[]): PrefixTree<T> | undefined {
		if (key.length === 0) return this;
		const [first, ...rest] = key;
		return this.children.get(first)?.subtree(rest);
	}

	fullKeyIncludesSegment(segment: string) {
		if (this.key === segment) return true;
		if (this.parent?.fullKeyIncludesSegment(segment)) return true;
		return false;
	}

	get fullKey() {
		const parts: string[] = this.key ? [this.key] : [];
		let parent = this.parent;
		while (parent) {
			if (parent.key) parts.push(parent.key);
			parent = parent.parent;
		}
		return parts.reverse();
	}

	* items(filter?: (node: PrefixTree<T>) => boolean): Generator<PrefixTree<T>> {
		if (!filter || filter(this)) yield this;
		for (const child of this.children.values()) {
			for (const item of child.items(filter)) {
				yield item;
			}
		}
	}

	count(filter?: (node: PrefixTree<T>) => boolean): number {
		let count = (!filter || filter(this)) ? 1 : 0;
		for (const child of this.children.values()) {
			count += child.count(filter);
		}
		return count;
	}

}