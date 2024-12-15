import { lines, blocks, Grid, Coord, Direction, computeStep } from '../common/index.js';

const [ gridBlock, instructions ] = blocks;

const grid = Grid.parse(gridBlock.lines);
const steps = instructions.raw.trim().split('').map(c => ({
    '^': Direction.north,
    'v': Direction.south,
    '>': Direction.east,
    '<': Direction.west
}[c]!)).filter(Boolean);

const WALL = '#';
const BOX = 'O';
const OPEN_SPACE = '.';

class ProgrammableCursor<T> {
    public repr = '@';
    public location: Coord;

    constructor(
        public grid: Grid<T>,
        public start: Coord,
        public program: {
            /**
             * Called after the step is started, but before the ProgrammableCursor
             * attemps to update the grid with its new location.
             * 
             * This allows the callback to manipulate the grid or cursor ahead of
             * the completion of the step. Useful for things like:
             * 
             * 1. Moving the cursor elsewhere
             * 1. Moving the cursor back to its `from` location. E.g., if it hits a wall.
             * 1. Pushing items ahead of it.
             * 
             * Direction is provided as a convenience and can be provided to a grid's
             * `searchBeaconAt()` method directly to "look" in the direction the cursor
             * is headed.
             * 
             * This is also where the grid should be updated if drawing/keeping the grid
             * up to date is desired.
             * 
             * @param step 
             * @returns 
             */
            onStep?: (step: {
                direction: Direction[];
                from: Coord;
                into: Coord;
            }) => void

            /**
             * The list of steps the cursor will take when run.
             */
            steps: Direction[][],
        }
    ) {
        this.location = this.start;
    }

    step(direction: Direction[]) {
        const from = this.location;
        this.location = computeStep(from, direction);
        this.program.onStep?.({
            direction,
            from,
            into: this.location
        });
    }

    run() {
        for (const direction of this.program.steps) {
            this.step(direction);
            // console.log('\n', direction, '\n');
            // console.log(this.grid.toString());
            // console.log();
        }
    }

    toString() {
        return this.repr;
    }
}

// console.log(grid.toString(), '\n', steps);

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
                grid.set(into, bot.repr);
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
