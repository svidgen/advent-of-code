import { lines, Grid, Cursor, StepTracer, Direction } from '../common/index.js';

const grid = Grid.parse(lines);

console.log(grid.toString());

const tracer = new StepTracer(
    grid,
    () => 0,
    (self, cursor) => {
        const cellValue = self.grid.get(cursor.coord)!;
        
        const takeStep = () => {
            console.log('step', cursor.direction, cursor.coord);
            self.state.set(cursor.coord, 1);
            cursor.step();
        }

        const action = ({
            '.': takeStep,
            '^': takeStep,
            '#': () => {
                console.log('turning', cursor.direction);
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

const visited = (t: any) => t.state.reduce((sum, cellState) => {
	return sum + cellState;
}, 0);

console.log(grid.width * grid.height);
console.log(visited(tracer));