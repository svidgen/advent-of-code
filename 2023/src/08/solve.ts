const fs = require('fs');
const raw = fs.readFileSync(0, 'utf-8');
const lines = raw.split('\n') as string[];

class Step {
	index: 'left' | 'right';

	constructor(public direction: string) {
		this.index = direction === 'L' ? 'left' : 'right';
	}

	static parse(line: string): Step[] {
		const steps: Step[] = [];
		for (const s of line.split('')) {
			if (s === 'L' || s === 'R') {
				steps.push(new Step(s));
			}
		}
		return steps;
	}
}

class MapNode {
	constructor(public id: string, public left: string, public right: string) {}

	static parse(line: string): MapNode {
		const [id, paths] = line.split(' = ') as [string, string];
		const [left, right] = paths
			.replace('(', '')
			.replace(')', '')
			.split(', ') as [string, string]
		;
		return new MapNode(id, left, right);
	}
}

class Game {
	steps: Step[];
	nodes = new Map<string, MapNode>();

	constructor(lines: string[]) {
		this.steps = Step.parse(lines.shift()!);

		// empty line
		lines.shift();

		while (lines.length > 0) {
			const line = lines.shift();
			if (!line) continue;
			const node = MapNode.parse(line);
			this.nodes.set(node.id, node);
		}
	}

	part1() {
		let c = 0;
		let node: MapNode = this.nodes.get('AAA')!;

		while (node.id !== 'ZZZ') {
			const step = this.steps[c % this.steps.length];
			node = this.nodes.get(node[step.index])!;
			c++;
		}

		return c;
	}

	// assumes cyclical paths (fortunately a correct assumption)
	part2() {
		const nodes: MapNode[] = [...this.nodes.keys()]
			.filter(k => k.endsWith('A'))
			.map(k => this.nodes.get(k)!)
		;

		const counts = nodes.map(node => {
			let c = 0;
			while (!node.id.endsWith('Z')) {
				const step = this.steps[c % this.steps.length];
				node = this.nodes.get(node[step.index])!;
				c++;
			}
			return c;
		});

		// finished in calculator.
		const factorizations = counts.map(c => primeFactorsOf(c));

		return [counts, factorizations];
	}
}

function generatePrimes(upTo: number): number[] {
	const primes: number[] = [];

	// remember: primes exclude 1
	for (let i = 2; i < upTo; i++) {
		let isPrime = true;
		for (const prime of primes) {
			if (i % prime === 0) {
				// not prime if divisible by another prime
				isPrime = false;
				break;
			}
		}
		if (isPrime) primes.push(i);
	}

	return primes;
}

function primeFactorsOf(v: number): number[] {
	let _v = v;
	const factors: number[] = [];

	for (const p of primes) {
		if (p > _v) break;
		while (_v % p === 0) {
			factors.push(p);
			_v = _v / p;
		}
	}

	if (_v != 1) factors.push(_v);

	return factors;
}

const primes = generatePrimes(50000);
const game = new Game(lines);

console.log(JSON.stringify({
	part1: game.part1(),
	part2: game.part2()
}, null, 2));

