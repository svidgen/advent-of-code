import { lines, countPaths } from '../common/index.js';

const graph = new Map<string, Set<string>>();

for (const line of lines) {
	const [fromNode, toNodes] = line.split(': ');
	for (const toNode of toNodes.trim().split(' ')) {
		graph.set(fromNode, graph.get(fromNode) ?? new Set<string>());
		graph.get(fromNode)?.add(toNode);
	}
}

function part1() {
	return countPaths({
		state: 'you',
		goal: s => s === 'out',
		visitedKey: s => s,
		edges: s => Array.from(graph.get(s) ?? [])
	})
}

// console.dir(graph, { depth: null });

console.log('part 1', part1());