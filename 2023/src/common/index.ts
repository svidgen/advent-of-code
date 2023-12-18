const fs = require('fs');
const process = require('process');
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

export enum Direction {
	north = 'north',
	south = 'south',
	east = 'east',
	west = 'west',
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

	static fromDimensions<T>(
		width: number,
		height: number,
		initialize: (x: number, y: number) => T = String
	): Grid<T> {
		const data: T[][] = Array<T[]>(height);;
		for (let y = 0; y < height; y++) {
			data[y] = Array<T>(width);
			for (let x = 0; x < width; x++) {
				data[y] = initialize(x, y);
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

	toString(map: (item: T) => string = String) {
		return this.data.map(line => 
			line.map(item => map(item)).join('')
		).join('\n');
	}
}

