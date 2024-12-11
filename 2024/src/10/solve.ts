import { lines, Grid, Coord } from '../common/index.js';

const grid = Grid.parse(lines).map((v) => parseInt(v));

function key(coord: Coord) {
    return `${coord.x},${coord.y}`;
}

function search(
    grid: Grid<number>,
    from: Coord,
    unique: boolean,
    visited: Set<string> = new Set<string>(),
) {
    const k = key(from);

    if (visited.has(k)) return [];
    visited.add(k);

    const current = grid.get(from)!;
    if (current === 9) {
        return [from];
    }

    const results: Coord[] = [];
    for (const n of grid.neighbors(from, { withOrdinals: false })) {
        if (grid.get(n) === current + 1) {
            results.push(...search(
                grid, n, unique,
                unique ? visited : new Set(...visited)
            ));
        }
    }
    return results;
}


function part(n: 1 | 2) {
    let count = 0;
    for (const head of grid.find(c => c === 0)) {
        count += search(grid, head, n === 1 ? true : false).length;
    }
    return count;
}



console.log(part(1));
console.log(part(2));