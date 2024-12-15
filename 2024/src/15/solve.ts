import { blocks, Grid, Direction, ProgrammableCursor } from '../common/index.js';

const [ gridBlock, instructions ] = blocks;

const grid = Grid.parse(gridBlock.lines);
const steps = instructions.raw.trim().split('').map(c => ({
    '^': Direction.north,
    'v': Direction.south,
    '>': Direction.east,
    '<': Direction.west
}[c]!)).filter(Boolean);

const BOT = '@';
const WALL = '#';
const BOX = 'O';
const OPEN_SPACE = '.';

console.log(grid.toString(), '\n');

const bot = new ProgrammableCursor(
    grid,
    [...grid.find(c => c === '@')].shift()!,
    {
        steps: steps.map(s => [s]),
        onStep: ({ direction, from, into }) => {
            const los = [...grid.lineOfSight(into, direction, c => c.value === WALL)];
            const firstOpenSpace = los.find(s => s.value === OPEN_SPACE);
            const adjacentBox = los[0]?.value === BOX ? los[0] : null;
            if (!firstOpenSpace) {
                // no open space. move the bot back from whence it came.
                bot.location = from;
                return;
            } else {
                if (adjacentBox) {
                    // pushing all the boxes back into the open space is the same (for us)
                    // as just moving the adjacent box into the first open space.
                    grid.set(adjacentBox.coord, OPEN_SPACE);
                    grid.set(firstOpenSpace.coord, BOX);
                }
                grid.set(from, OPEN_SPACE);
                grid.set(into, BOT);
            }
        }
    }
);

bot.run();

function score(grid: Grid<string>) {
    let sum = 0;
    for (const box of grid.find(c => c === BOX)) {
        sum += box.y * 100 + box.x;
    }
    return sum;
}

console.log(grid.toString(), score(grid));
