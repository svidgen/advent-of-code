import { lines, product, Space, Cluster } from '../common/index.js';

const IS_EXAMPLE_DATA = lines.length < 1000;
const EDGE_LIMIT = IS_EXAMPLE_DATA ? 10 : 1000;

function part1() {
	const space = Space.parse(lines);
	const clusters = space.findClusters(EDGE_LIMIT);
	clusters.sort(Cluster.bySize).reverse();
	return product(clusters.slice(0, 3).map(c => c.size));
}

function part2() {
	const space = Space.parse(lines);
	const edges = space.findClusters(undefined);
	const bottleneck = edges.pop();
	return bottleneck!.a.coords[0] * bottleneck!.b.coords[0]
}

console.log('part 1', part1());
console.log('part 2', part2());