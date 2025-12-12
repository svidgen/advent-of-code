import { lines, dfs, sum } from '../common/index.js';

const graph = new Map<string, Set<string>>();

for (const line of lines) {
	const [fromNode, toNodes] = line.split(': ');
	for (const toNode of toNodes.trim().split(' ')) {
		graph.set(fromNode, graph.get(fromNode) ?? new Set<string>());
		graph.get(fromNode)?.add(toNode);
	}
}

function countPaths(from: string, to: string, excluding?: string) {
	return dfs({
		state: from,
		childrenOf(state) {
			return Array.from(graph.get(state) ?? []);
		},
		visit(path, state, childResults): bigint {
			return (
				state === to &&
				(!excluding || !path.includes(excluding!))
			) ? 1n : 0n + BigInt(sum(childResults));
		},
	});
}

function part1() {
	// count of paths from `you` -> `out`
	return countPaths('you', 'out');
}

function part2() {
	// count of paths from `svr` -> `out` that pass through both `dac` and `fft`.

	// solution prior to realizing i could memoize DFS state using a representation
	// of that state that indicates whether the path already passes through the
	// intended nodes ... implemented for/in part2_b.

	// this works too though. just as fast, if not faster.
	const directToDAC = countPaths('svr', 'dac', 'fft');
	const DACtoFFT = countPaths('dac', 'fft');
	const FFTdirectToOUT = countPaths('fft', 'out', 'dac');
	const dacFirst = directToDAC * DACtoFFT * FFTdirectToOUT;

	const directToFFT = countPaths('svr', 'fft', 'dac');
	const FFTtoDAC = countPaths('fft', 'dac');
	const DACdirectToOut = countPaths('dac', 'out', 'fft');
	const fftFirst = directToFFT * FFTtoDAC * DACdirectToOut;

	return dacFirst + fftFirst;
}

function part2_b() {
	function countPathsB(from: string, to: string, through: string[]) {
		return dfs({
			state: from,
			childrenOf(state) {
				return Array.from(graph.get(state) ?? []);
			},
			visit(path, state, childResults): bigint {
				return (
					state === to &&
					through.every(s => path.includes(s))
				) ? 1n : 0n + BigInt(sum(childResults));
			},
			memoKeyOf(state, path) {
				const throughState: Record<string, boolean> = {};
				for (const i of through) {
					throughState[i] = path.includes(i);
				}
				const key = JSON.stringify({ s: state, t: throughState });
				return key;
			}
		});
	}
	return countPathsB('svr', 'out', ['fft', 'dac']);
}

console.log('part 1', part1());
console.log('part 2', part2());
console.log('part 2_b', part2_b());