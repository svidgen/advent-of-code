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

function repr(coord) {
	return `${coord.x},${coord.y}`;
}

function add_node(grid, node, q, base_cost) {
	if (
		node.x < 0
		|| node.y < 0
		|| node.x > (grid[0].length - 1)
		|| node.y > (grid.length - 1)
	) {
		return;
	}

	node.cost = base_cost + Number(grid[node.y][node.x]);

	for (let i = 0; i < q.length; i++) {
		if (q[i].x == node.x && q[i].y == node.y) {
			if (node.cost < q[i].cost) {
				q[i] = node;
			}
			return;
		} 
	}

	q.push(node);
}

function search(grid, start, end) {
	// starting position isn't "entered", so cost isn't counted.
	start.cost = 0; // Number(grid[start.y][start.x]);

	const queue = [start];

	let limit = 10_000_000;
	while (queue.length > 0 && limit > 0) {
		limit--;
		const current = queue.shift();
		if (current.x == end.x && current.y == end.y) {
			return current.cost;
		}

		for (const node of [
			{x: current.x - 1, y: current.y},
			{x: current.x + 1, y: current.y},
			{x: current.x, y: current.y - 1},
			{x: current.x, y: current.y + 1}
		]) {
			add_node(grid, node, queue, current.cost);
		}

		queue.sort((a,b) => a.cost > b.cost ? 1 : (a.cost < b.cost ? -1 : 0));
	}

	console.log('did not complete');
	console.log(queue);
}

console.log(search(GRID, {x: 0, y: 0}, {x: GRID[0].length - 1, y: GRID.length - 1}));
// console.log(search(GRID, {x: 0, y: 0}, {x: 5, y: 5}));
