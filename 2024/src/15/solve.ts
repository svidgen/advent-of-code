import { blocks, Coord, Grid, Direction, ProgrammableCursor, computeStep } from '../common/index.js';

const [ gridBlock, instructions ] = blocks;

const part2grid = Grid.parse(
	gridBlock.lines.map(line => {
		const chars = line.split('').map(c => {
			return {
				'.': '..',
				'@': '@.',
				'#': '##',
				'O': '[]'
			}[c]!;
		});
		return chars.join('');
	})
);

const steps = instructions.raw.trim().split('').map(c => ({
    '^': Direction.north,
    'v': Direction.south,
    '>': Direction.east,
    '<': Direction.west
}[c]!)).filter(Boolean);

const BOT = '@';
const WALL = '#';
const BOX_LEFT = '[';
const BOX_RIGHT = ']';
const BOX_SINGLE = 'O';
const BOX_START = [BOX_LEFT, BOX_SINGLE];
const BOX_PART = [BOX_LEFT, BOX_RIGHT, BOX_SINGLE];
const OPEN_SPACE = '.';

type Move = {
	from: Coord;
	into: Coord;
};

function makeBot(grid: Grid<string>) {

	function canMove(
		from: Coord,
		direction: Direction,
		alreadyMoved = new Set<string>()
	): Move[] | false {
		const k = `${from.x},${from.y}`;
		if (alreadyMoved.has(k)) return [];
		alreadyMoved.add(k);

		const v = grid.get(from)!;

		if (!BOX_PART.includes(v)) return [];

		const intoCoord = computeStep(from, [direction]);
		const intoValue = grid.get(intoCoord);

		if (intoValue === WALL) return false;

		const intoIsOpen = intoValue === OPEN_SPACE;

		if (
			[Direction.north, Direction.south].includes(direction)
			&& [BOX_LEFT, BOX_RIGHT].includes(v)
		) {
			const otherSideDir = v === BOX_LEFT ? Direction.east : Direction.west;
			const otherSideCoord = computeStep(from, [otherSideDir]);

			const otherSideMoves = canMove(otherSideCoord, direction, alreadyMoved);
			if (!otherSideMoves) return false;

			if (intoIsOpen) {
				return [...otherSideMoves, { from, into: intoCoord }];
			}

			const downstreamMoves = canMove(intoCoord, direction, alreadyMoved);
			if (!downstreamMoves) return false;

			return [
				...downstreamMoves,
				...otherSideMoves,
				{ from, into: intoCoord }
			];
		}

		if (intoIsOpen) {
			return [{ from, into: intoCoord }];
		}

		const downstreamMoves = canMove(intoCoord, direction, alreadyMoved);
		if (!downstreamMoves) return false;

		return [...downstreamMoves, { from, into: intoCoord }];
	}

	function executeMoves(moves: Move[]) {
		for (const move of moves) {
			grid.set(move.into, grid.get(move.from)!);
			grid.set(move.from, OPEN_SPACE);
		}
	}

	const bot = new ProgrammableCursor(
		grid,
		[...grid.find(c => c === BOT)].shift()!,
		{
			steps: steps.map(s => [s]),
			onStep: ({ direction, from, into }) => {
				if (grid.get(into) === WALL) {
					bot.location = from;
					return;
				}

				const moves = canMove(into, direction[0]);
				if (moves) {
					executeMoves(moves);
					grid.set(from, OPEN_SPACE);
					grid.set(into, BOT);
				} else {
					bot.location = from;
				}

				// console.log(direction[0]);
				// console.log(grid.toString());
				// console.log();
			}
		}
	);

	return bot;
}
	
function part1() {
	const grid = Grid.parse(gridBlock.lines);
	console.log(grid.toString(), '\n');
	makeBot(grid).run();
	return grid;
}

function part2() {
	console.log(part2grid.toString(), '\n');
	makeBot(part2grid).run();
	return part2grid;
}

function score(grid: Grid<string>) {
    let sum = 0;
    for (const box of grid.find(c => BOX_START.includes(c))) {
        sum += box.y * 100 + box.x;
    }
    return sum;
}

// const part1Grid = part1();
const part2Grid = part2();

// console.log(part1Grid.toString(), score(part1Grid));
console.log(part2Grid.toString(), score(part2Grid));
