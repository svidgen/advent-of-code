import { lines, Grid, Coord } from "../common/index.js";

const grid = Grid.parse(lines);

function matchesXMAS(cells: Generator<string>): boolean {
    const XMAS = 'XMAS';
    let s = '';
    for (const cell of cells) {
        s += cell;
        if (s === XMAS) return true;
        if (!XMAS.startsWith(s)) return false;
    }
    return false;
}

function matchesXMAS2(coord: Coord): boolean {
    if (grid.get(coord) !== 'A') return false;

    const diagA = [
        grid.get({ y: coord.y - 1, x: coord.x - 1 }),
        grid.get({ y: coord.y + 1, x: coord.x + 1 }),
    ].join('');

    const diagB = [
        grid.get({ y: coord.y - 1, x: coord.x + 1 }),
        grid.get({ y: coord.y + 1, x: coord.x - 1 }),
    ].join('');

    if (diagA !== 'MS' && diagA !== 'SM') return false;
    if (diagB !== 'MS' && diagB !== 'SM') return false;

    return true;
}

function part1() {
    let matches = 0;
    for (const coord of grid.coords) {
        const hits = grid.searchAt(coord, matchesXMAS);
        matches += hits.filter(Boolean).length;
    }
    return matches;
}

function part2() {
    let matches = 0;
    for (const coord of grid.coords) {
        if (matchesXMAS2(coord)) matches++;
    }
    return matches;
}

console.log('part1', part1());
console.log('part1', part2());