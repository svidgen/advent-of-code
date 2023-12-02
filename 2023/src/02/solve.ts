const fs = require('fs');
const raw = fs.readFileSync(0, 'utf-8');
const lines = raw.split('\n') as string[];

class Game {
	constructor(public id: number, public draws: Draw[]) { }

	static parse(line: string): Game | null {
		const [game, drawString] = line.split(':');
		if (!game) return null;

		const [_boiler, id] = game.split(' ');
		const draws = drawString
			.split(';')
			.map(d => Draw.parse(d))
			.filter(x => x) as Draw[]
		;
		
		return new Game(parseInt(id), draws);
	}

	max(color: keyof Draw) {
		let max = 0;
		for (const draw of this.draws) {
			if (draw[color] > max) {
				max = draw[color];
			}
		}
		return max;
	}
}

class Draw {
	constructor(
		public red: number,
		public green: number,
		public blue: number
	) {}

	static parse(line: string): Draw | null {
		const data = line.trim();
		if (!data) return null;

		return new Draw(
			this.extract(data, 'red'),
			this.extract(data, 'green'),
			this.extract(data, 'blue')
		);
	}

	static extract(data: string, color: string): number {
		const match = data.match(new RegExp(`(\\d+) ${color}`));
		if (match && match[1]) {
			return parseInt(match[1]);
		} else {
			return 0;
		}
	}
}

function part1(): number {
	const filter = {
		red: 12,
		green: 13,
		blue: 14
	} as Record<keyof Draw, number>;

	const games = lines
		.filter(x => x)
		.map(line => Game.parse(line))
		.filter(x => x)
		.filter(g => {
			for (const [color, limit] of Object.entries(filter)) {
				if (g!.max(color as keyof Draw) > limit) return false;
			}
			return true;
		});
	;

	console.log({games});

	return games.reduce((sum, game) => game!.id + sum, 0);
}

console.log({
	part1: part1()
});
