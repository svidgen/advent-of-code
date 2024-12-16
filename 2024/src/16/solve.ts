import { lines, Grid, Coord, Direction, PriorityQueue, StepTracer, Cursor } from '../common/index.js';

const START = 'S';
const END = 'E';
const WALL = '#';

function coordsMatch(a: Coord, b: Coord) {
    return a.x === b.x && a.y === b.y;
}

function solveMaze({
    grid,
    start,
    end
}: {
    grid: Grid<string>,
    start: Coord,
    end: Coord,
}) {
    const visited = grid.copy().map(() => 0);

    const init = new Cursor(start, Direction.east, { cost: 0 }, []);    
    const q = new PriorityQueue<typeof init>();
    q.enqueue(init, 0);

    for (const cursor of q) {
        if (visited.get(cursor.coord) === 1) continue;
        visited.set(cursor.coord, 1);

        if (grid.get(cursor.coord) === WALL) {
            continue;
        }

        if (coordsMatch(cursor.coord, end)) {
            return {
                path: cursor.path,
                cost: cursor.state.cost
            }
        }

        const left = cursor
            .copy({ state: { cost: cursor.state.cost + 1001 } })
            .turn('left')
            .step()
        ;
        q.enqueue(left, left.state.cost);

        const right = cursor
            .copy({ state: { cost: cursor.state.cost + 1001 } })
            .turn('right')
            .step()
        ;
        q.enqueue(right, right.state.cost);

        cursor.step();
        cursor.state.cost++;
        q.enqueue(cursor, cursor.state.cost);
    }
}

const grid = Grid.parse(lines);
const start = [...grid.find(c => c === START)][0];
const end = [...grid.find(c => c === END)][0];

const part1 = solveMaze({ grid, start, end });

console.log('part1', part1);