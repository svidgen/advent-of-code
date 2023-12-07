const fs = require('fs');
const raw = fs.readFileSync(0, 'utf-8');
const lines = raw.split('\n') as string[];

function parse(line: string): number[] {
	return line.split(':')[1]!.trim().split(/\s+/).map(s => parseInt(s));
}

const CARD_ORDER = "23456789TJQKA";
const PART2_CARD_ORDER = "J23456789TQKA";
const WILD = 'J';

function byValue(a: number, b: number): number {
	return a > b ? 1 : (b > a ? -1 : 0);
}

class Card {
	value: number;
	altValue: number;

	constructor(public label: string) {
		const value = CARD_ORDER.indexOf(label);
		if (value >= 0) {
			this.value = value;
		} else {
			throw new Error("Invalid card label: " + label);
		}

		const altValue = PART2_CARD_ORDER.indexOf(label);
		if (altValue >= 0) {
			this.altValue = altValue;
		} else {
			throw new Error("Invalid card label: " + label);
		}
	}
}

class Hand {
	score: number;
	altScore: number;

	constructor(
		public labels: string,
		public cards: [Card, Card, Card, Card, Card],
		public bid: number
	) {
		this.score = this.part1Score(cards);
		this.altScore = this.part2Score(cards);
	}

	part1Score(cards: Card[]): number {
		const tieBreaker: number[] = [];
		const sets = new Map<string, number>();

		for (const card of this.cards) {
			// +10 ... cheap "leftpad".
			tieBreaker.push(card.value + 10);
			const existing = sets.get(card.label);
			sets.set(card.label, existing ? existing + 1 : 1);
		}
		
		const baseScore = [...sets.values()]
			.reduce((sum, v) => sum + Math.pow(10, v - 1), 0);

		return parseFloat([baseScore, '.', ...tieBreaker].join(''));
	}

	part2Score(cards: Card[]): number {
		const tieBreaker: number[] = [];
		const sets = new Map<string, number>();
		let wilds: number = 0;

		for (const card of this.cards) {
			// +10 ... cheap "leftpad".
			tieBreaker.push(card.altValue + 10);
			if (card.label === WILD) {
				wilds++;
			} else {
				const existing = sets.get(card.label);
				sets.set(card.label, existing ? existing + 1 : 1);
			}
		}

		// incorporate jokers
		const pairScores = [...sets.values()].sort(byValue);
		if (wilds === 5) {
			pairScores.push(5);
			console.log('JJJJJ!', pairScores);
		} else {
			pairScores[pairScores.length - 1] += wilds;
		}
		const baseScore = pairScores.reduce((sum, v) => sum + Math.pow(10, v - 1), 0);

		return parseFloat([baseScore, '.', ...tieBreaker].join(''));
	}

	static parse(line: string): Hand {
		const [cardLabels, bidText] = line.split(' ') as [string, string];
		const cards = cardLabels.split('').map(label => new Card(label)) as [
			Card, Card, Card, Card, Card
		];
		const bid = parseInt(bidText);
		return new Hand(cardLabels, cards, bid);
	}

	static byScore(a: Hand, b: Hand): number {
		return byValue(a.score, b.score);
	}

	static byAltScore(a: Hand, b: Hand): number {
		return byValue(a.altScore, b.altScore);
	}
}

const hands = lines.filter(x => x).map(line => Hand.parse(line));

function part1() {
	let winnings = 0;
	const sorted = hands.sort(Hand.byScore);

	for (let i = 0; i < sorted.length; i++) {
		const rank = i + 1;
		winnings += rank * sorted[i].bid;
	}

	return winnings;
}

function part2() {
	let winnings = 0;
	const sorted = hands.sort(Hand.byAltScore);

	for (let i = 0; i < sorted.length; i++) {
		const rank = i + 1;
		winnings += rank * sorted[i].bid;
	}

	return winnings;
}

console.log({
	part1: part1(),
	part2: part2()
});

