const fs = require('fs');
const raw = fs.readFileSync(0, 'utf-8');
const lines = raw.split('\n') as string[];

function parse(line: string): number[] {
	return line.split(':')[1]!.trim().split(/\s+/).map(s => parseInt(s));
}

class Race {
	constructor(
		public time: number,
		public distance: number
	) {}

	static parse(lines: string[]): Race[] {
		const races: Race[] = [];
		const times = parse(lines[0]);
		const distances = parse(lines[1]);
		for (let i = 0; i < times.length; i++) {
			races.push(new Race(times[i], distances[i]));
		}
		return races;
	}

	simulate(holdTime: number): number {
		const speed = holdTime;
		const distance = (this.time - holdTime) * speed;
		return distance;
	}

	get attempts() {
		const times: number[] = [];
		for (let t = 1; t < this.time; t++) {
			times.push(this.simulate(t));
		}
		console.log(this, times);
		return times;
	}

	get winners() {
		return this.attempts.filter(d => d > this.distance);
	}
}


const races = Race.parse(lines);

function solve() {
	const winners = races.map(r => r.winners.length);
	console.log(winners);
	return winners.reduce((product, v) => product * v, 1);
}

console.log({
	solution: solve()
});

