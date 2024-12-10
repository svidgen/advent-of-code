import { lines, Grid, Coord } from '../common/index.js';

const grid = Grid.parse(lines).map((v) => parseInt(v));

function coordString(coord: Coord) {
    return `${coord.x},${coord.y}`;
}

function search(
    grid: Grid<number>,
    from: Coord,
    visited: Set<string> = new Set<string>()
) {
    const current = grid.get(from)!;
    if (current === 9) {
        return [from];
    }
    visited.add(coordString(from));

    const results: Coord[] = [];
    for (const n of grid.neighbors(from, { withOrdinals: false })) {
        if (visited.has(coordString(n))) continue;
        if (grid.get(n) === current + 1) {
            results.push(...search(grid, n, visited));
        }
    }
    return results;
}

let count = 0;
for (const head of grid.find(c => c === 0)) {
    count += search(grid, head).length;
}

console.log(count);