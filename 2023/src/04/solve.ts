const fs = require('fs');
const raw = fs.readFileSync(0, 'utf-8');
const lines = raw.split('\n') as string[];

class Card {
	constructor(
		public id: string,
		public winners: number[],
		public scratched: number[]
	) {}

	static parse(line: string): Card {
		const [header, numbers] = line.split(':') as [string, string];
		const [boiler, id] = header.split(/\s+/) as [string, string];
		const [winners, scratched] = (numbers.split('|') as [string, string]).map(s => {
			return s.trim().split(/\s+/).map(n => parseInt(n))
		});
		return new Card(id, winners, scratched);
	}

	get points() {
		let hits = 0;
		const winners = new Set(this.winners);
		for (const scratched of this.scratched) {
			if (winners.has(scratched)) hits++;
		}
		return hits > 0 ? Math.pow(2, hits - 1) : 0;
	}
}

function part1() {
	const cards = lines.filter(x => x).map(line => Card.parse(line));
	for (const card of cards) {
		console.log(`card ${card.id} : ${card.points}`);
	}
	return cards.reduce((sum, card) => sum + card.points, 0);
}

console.log({
	part1: part1()
});
