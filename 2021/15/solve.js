const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8');

const GRID = input
	.split("\n")
	.reduce((rows, line) => {
		if (line.length > 0) {
			const row = [];
			for (const c of line) {
				row.push(c);
			}
			rows.push(row);
		}
		return rows;
	}, []);

const BIG_GRID = [];
for (let copy_y = 0; copy_y < 5; copy_y++) {
	for (let copy_x = 0; copy_x < 5; copy_x++) {
		GRID.forEach((row, index) => {
			const target_y = index + (copy_y * GRID.length);
			BIG_GRID[target_y] = BIG_GRID[target_y] || [];
			for (let source_x = 0; source_x < row.length; source_x++) {
				const target_x = source_x + (copy_x * row.length);
				const new_value = copy_y + copy_x + Number(row[source_x]);
				BIG_GRID[target_y][target_x] = new_value > 9 ? new_value - 9 : new_value;
			}
		});
	}
}

console.log(BIG_GRID.map(l => l.join(",")).join("\n"));

function repr(coord) {
	return `${coord.x},${coord.y}`;
}

function is_on_grid(grid, node) {
	if (
		node.x < 0
		|| node.y < 0
		|| node.x > (grid[0].length - 1)
		|| node.y > (grid.length - 1)
	) {
		return false;
	} else {
		return true;
	}
}

function enqueue(grid, node, q, index, base_cost) {
	if (!is_on_grid(grid, node)) return;

	node.cost = base_cost + Number(grid[node.y][node.x]);

	const existing = index[repr(node)];
	if (existing) {
		if (node.cost < existing.cost) {
			// add new node
			index[repr(node)] = node;
			q[node.cost] = q[node.cost] || [];
			q[node.cost].push(node);

			// remove old node
			const bucket = q[existing.cost];
			for (let i = 0; i < bucket.length; i++) {
				if (bucket[i].x == existing.x && bucket[i].y == existing.y) {
					bucket.splice(i, 1);
					return;
				}
			}
		}
	} else {
		index[repr(node)] = node;
		q[node.cost] = q[node.cost] || [];
		q[node.cost].push(node);
	}
}

function dequeue(q) {
	for (let i = 0; i < q.length; i++) {
		if (q[i] && q[i].length > 0) {
			return q[i].shift();
		}
	}
	return;
}

function search(grid, start, end) {
	// starting position isn't "entered", so cost isn't counted.
	start.cost = 0; // Number(grid[start.y][start.x]);

	const queue = [];
	const index = {};
	enqueue(grid, start, queue, index, 0);

	let limit = 10_000_000;
	while (limit > 0) {
		limit--;
		current = dequeue(queue);

		if (current.x == end.x && current.y == end.y) {
			return current.cost;
		}

		for (const node of [
			{x: current.x - 1, y: current.y},
			{x: current.x + 1, y: current.y},
			{x: current.x, y: current.y - 1},
			{x: current.x, y: current.y + 1}
		]) {
			enqueue(grid, node, queue, index, current.cost);
		}
	}

	console.log('did not complete');
	console.log(queue);
}

let result = search(GRID, {x: 0, y: 0}, {x: GRID[0].length - 1, y: GRID.length - 1});
console.log(result - Number(GRID[0][0]));

result = search(BIG_GRID, {x: 0, y: 0}, {x: BIG_GRID[0].length - 1, y: BIG_GRID.length - 1});
console.log(result - Number(BIG_GRID[0][0]));

// console.log(search(GRID, {x: 0, y: 0}, {x: 5, y: 5}));
