const sampleData = require('./sample');
const realData = require('./data');

class Grid {
	data;
	memos = new Map();

	/**
	 * Construct with data as text.
	 * @param {String} data 
	 */
	constructor(lines) {
		this.data = lines.trim().split('\n');
	}

	/**
	 * @param {number} row 
	 * @param {number} col 
	 */
	get(row, col) {
		const memokey = `${row},${col}`;
		if (!this.memos.has(memokey)) {
			if (row >= 0 && row < this.data.length) {
				const rowData = this.data[row];
				if (col >= 0 && col < rowData.length) {
					this.memos.set(
						memokey,
						new GridItem(this, row, col, Number(rowData[col]))
					);
				}
			}
		}
		return this.memos.get(memokey);
	}

	/**
	 * Enumerates all grid items.
	 */
	* enumerate() {
		for (let row = 0; row < grid.height; row++) {
			for (let col = 0; col < grid.width; col++) {
				yield this.get(row, col);
			}
		}
	}

	/**
	 * Width of the grid, assuming the first row is representative.
	 */
	get width() {
		return this.data[0].length;
	}

	/**
	 * Height of the grid.
	 */
	get height() {
		return this.data.length;
	}
}

class GridItem {
	grid;
	row;
	col;
	data;

	maxHeights = {
		north: undefined,
		south: undefined,
		east: undefined,
		west: undefined,
	};

	constructor(grid, row, col, data) {
		this.grid = grid;
		this.row = row;
		this.col = col;
		this.data = data;
	}

	get north() {
		return this.grid.get(this.row - 1, this.col);
	}

	get south() {
		return this.grid.get(this.row + 1, this.col);
	}

	get east() {
		return this.grid.get(this.row, this.col - 1);
	}

	get west() {
		return this.grid.get(this.row, this.col + 1);
	}

	get isVisible() {
		return this.isVisibleFrom('north') ||
			this.isVisibleFrom('south') ||
			this.isVisibleFrom('east') ||
			this.isVisibleFrom('west')
		;
	}

	maxHeightFrom(direction) {
		if (this.maxHeights[direction] === undefined) {
			this.maxHeights[direction] = Math.max(
				this.data,
				this[direction]?.maxHeightFrom(direction) || 0
			);
		}
		return this.maxHeights[direction];
	}

	isVisibleFrom(direction) {
		return this[direction] === undefined ||
			this.data > this[direction]?.maxHeightFrom(direction)
		;
	}

	treesVisibleIn(direction) {
		let n = this[direction];
		let d = 0;
		while (n) {
			d++;
			if (this.data > n.data) {
				n = n[direction];
			} else {
				break;
			}
		}
		return d;
	}

	get visibilityScore() {
		return this.treesVisibleIn('north') *
			this.treesVisibleIn('south') *
			this.treesVisibleIn('east') *
			this.treesVisibleIn('west')
		;
	}
}

const grid = new Grid(realData);

let part1 = 0;
let part2 = 0;

for (const tree of grid.enumerate()) {
	part2 = Math.max(part2, tree.visibilityScore);
	if (tree.isVisible) {
		part1 += 1;
	}
}

console.log({
	part1,
	part2
});