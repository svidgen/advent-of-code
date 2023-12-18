const fs = require('fs');
const raw = fs.readFileSync(0, 'utf-8');
const lines = raw.split('\n') as string[];

class Card {
	// for part 2
	public quantity: number = 1;

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

	/**
	 * The number of scratched numbers that are winners
	 */
	get hits() {
		let hits = 0;
		const winners = new Set(this.winners);
		for (const scratched of this.scratched) {
			if (winners.has(scratched)) hits++;
		}
		return hits;
	}

	// for part 1
	get points() {
		return this.hits > 0 ? Math.pow(2, this.hits - 1) : 0;
	}
}

function part1() {
	return cards.reduce((sum, card) => sum + card.points, 0);
}

function part2() {
	// assumes cards are in order.
	for (const card of cards) {
		console.log(`card ${card.id} : qty ${card.quantity}; hits ${card.hits};`);
		for (let offset = 1; offset < card.hits + 1; offset++) {
			const idToAward = (parseInt(card.id) + offset).toString();
			const cardToAward = index.get(idToAward);
			if (cardToAward) {
				console.log(`awarding ${idToAward} : ${cardToAward.quantity} -> ${cardToAward.quantity + card.quantity}`);
				cardToAward.quantity += card.quantity;
			} else {
				console.log(`no such card ${idToAward}`);
			}
		}
	}
	return cards.reduce((sum, card) => sum + card.quantity, 0);
}

const cards = lines.filter(x => x).map(line => Card.parse(line));
const index = new Map<string, Card>();
for (const card of cards) {
	index.set(card.id, card);
}

console.log({
	part1: part1(),
	part2: part2()
});
