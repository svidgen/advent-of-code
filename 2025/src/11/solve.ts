import { lines, getAllPaths } from '../common/index.js';

const graph = new Map<string, Set<string>>();

for (const line of lines) {
	const [fromNode, toNodes] = line.split(': ');
	for (const toNode of toNodes.trim().split(' ')) {
		graph.set(fromNode, graph.get(fromNode) ?? new Set<string>());
		graph.get(fromNode)?.add(toNode);
	}
}

function part1() {
	return getAllPaths({
		state: 'you',
		goal: s => s === 'out',
		visitedKey: s => s,
		edges: s => Array.from(graph.get(s) ?? [])
	}).length;
}

function part2() {
	return getAllPaths({
		state: 'svr',
		goal: s => s === 'out',
		visitedKey: s => s,
		edges: s => Array.from(graph.get(s) ?? [])
	}).filter(path => path.includes('dac') && path.includes('fft')).length;
}

console.log('part 1', part1());
console.log('part 2', part2());