import { lines, getAllPaths, dfs, sum } from '../common/index.js';

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

	// same as this:
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

function part2_1() {
	// count of paths from `svr` -> `out` that pass through both `dac` and `fft`.
	
	// same as this:
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

console.log('part 1', part1());
console.log('part 2', part2());
console.log('part 2', part2_1());