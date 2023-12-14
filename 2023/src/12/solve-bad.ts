const process = require('process');
const fs = require('fs');
const raw = fs.readFileSync(process.argv[2], 'utf-8');
const lines = raw.trim().split(/\n/);

function sum(values: number[]): number {
	let s = 0;
	for (const v of values) s += v;
	return s;
}

class Entry {
	stats: Record<string, number>;
	length: number;

	constructor(
		public springs: string,
		public checksums: number[]
	) {
		this.stats = this.computeStats();
		this.length = this.springs.length;
	}

	static parse(lines: string[]): Entry[] {
		const records: Entry[] = [];
		for (const line of lines) {
			const [springs, checksumsString] = line.split(' ');
			const checksums = checksumsString.split(',').map(s => parseInt(s));
			records.push(new Entry(springs, checksums));
		}
		return records;
	}

	matches(s: string): boolean {
		if (s === '###.#######.##...') console.log('\n\nHERE\n\n');
		// pattern test
		if (s.length !== this.length) {
			console.log(`${s} fails length matche ${this.springs}`);
			return false;
		}

		// makes me feel like a missed opportunity to use a bitmask. :shrug:
		for (let i = 0; i < s.length; i++) {
			if (
				(this.springs[i] === '#' && s[i] !== '#')
				|| (this.springs[i] === '.' && s[i] !== '.')
			) {
				console.log(`${s} fails filter ${this.springs}`);
				return false;
			}
		}

		// checksum test
		const groups = s.split(/\.+/).filter(x => x);
		for (const i in groups) {
			if (groups[i].length !== this.checksums[i]) {
				console.log(`${s} -> ${groups} fails checksum ${JSON.stringify(this.checksums)}`);
				console.log(`${i}: ${groups[i].length} != ${this.checksums[i]}`);
				return false;
			}
		}

		return true;
	}

	generatePossibilities(): string[] {
		// number of groups of periods. naive. we could subdivied this further, but
		// not optimizing until i know where part 2 leads ...
		const periodGroups = [...Array(this.checksums.length + 1)].map(v => 0);

		// the max that periodGroups can add up to before breaching string length,
		// which we'll use as the "base" for "counting" all the possibilities ... (even though
		// we'll actually end up a good number of extra possibilities this way).
		const base = this.length - sum(this.checksums);

		const possibilities: string[] = [];
		const maxPossibilities = Math.pow(base, periodGroups.length);
		for (let i = 0; i <= maxPossibilities; i++) {
			let carry = 0;
			for (const gi in periodGroups) {
				if (carry) {
					periodGroups[gi] += carry;
					carry = 0;
				}
				if (periodGroups[gi] > base) {
					carry = 1;
					periodGroups[gi] = 0;
				}
			}
			if (sum(periodGroups) === base) {
				possibilities.push(this.makeString(periodGroups));
			}
			periodGroups[0]++;
		}

		return possibilities;
	}

	makeString(periodGroupValues: number[]): string {
		// turn group numbers into Array<string> where string = '...' where len = group value
		const periodGroups = periodGroupValues.map(n => [...Array(n)].map(l => '.').join(''));
		const springGroups = this.checksums.map(n => [...Array(n)].map(l => '#').join(''));

		// console.log({periodGroups, springGroups});

		const parts: string[] = [];
		for (let i = 0; i < springGroups.length; i++) {
			parts.push(periodGroups[i]!);
			parts.push(springGroups[i]!);
		}
		parts.push(periodGroups[periodGroups.length - 1]);
		return parts.join('');
	}

	generatePermutations(): string[] {
		return this.generatePossibilities().filter(p => this.matches(p));
	}

	computeStats() {
		const stats: Record<string, number> = {
			'#': 0,
			'?': 0,
			'.': 0
		};

		for (const c of this.springs) {
			stats[c] += 1;
		}

		return stats;
	}
}

const records = Entry.parse(lines);

const part1 = (() => {
	let count = 0;
	for (const r of records) {
		const possibles = r.generatePossibilities();
		console.log({possibles});
		const perms = r.generatePermutations();
		count += perms.length;
		if (perms.length === 0) {
			throw new Error('huh: ' + JSON.stringify(r));
		} else {
			console.log('\nadding perms');
			console.log(r.springs);
			console.log(perms.join('\n'));
		}
	}
	console.log({count});
	// return sum([...records.map(r => r.generatePermutations().length)]);
})();

const part2 = (() => {
})();

console.log(JSON.stringify({
	part1, part2
}, null, 2));
