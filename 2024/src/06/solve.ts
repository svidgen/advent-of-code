import { lines, Grid, Cursor, StepTracer, Direction, Coord } from '../common/index.js';

const grid = Grid.parse(lines);

// console.log(grid.toString());

function trace(grid: Grid<string>) {
    let cycleFound = false;
    const tracer = new StepTracer(
        grid,
        () => [] as Direction[],
        (self, cursor) => {
            const cellValue = self.grid.get(cursor.coord)!;
            
            const takeStep = () => {
                // console.log('step', cursor.direction, cursor.coord);
                const state = self.state.get(cursor.coord);
                if (state?.includes(cursor.direction)) {
                    cycleFound = true;
                    tracer.remove(cursor);
                    return;
                }
                state?.push(cursor.direction);
                cursor.step();
            }

            const action = ({
                '.': takeStep,
                '^': takeStep,
                '#': () => {
                    // console.log('turning', cursor.direction);
                    cursor.undo();
                    cursor.turn('right');
                },
            })[cellValue];

            if (action) {
                action();
            } else {
                // of the board
                self.remove(cursor);
            }
        }
    );

    const start = [...grid.find(c => c === '^')].pop()!;
    tracer.add(new Cursor({...start}, Direction.north, {}, []));
    tracer.run();

    const visited: Coord[] = [];
    for (const coord of tracer.state.coords) {
        const coordState = tracer.state.get(coord)!;
        if (coordState.length > 0) {
            visited.push(coord);
        }
    }

    return {
        cycleFound,
        visited,
    }
}

const baseline = trace(grid);

let cyclesFound = 0;
for (const coord of baseline.visited) {
    const gridCopy = grid.copy();
    gridCopy.set(coord, '#');
    const result = trace(gridCopy);
    if (result.cycleFound) cyclesFound++;
}

console.log('part 1', baseline.visited.length);
console.log('part 2', cyclesFound);