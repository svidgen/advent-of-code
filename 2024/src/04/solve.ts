import { lines, Grid } from "../common/index.js";

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

function part1() {
    let matches = 0;
    for (const coord of grid.coords) {
        const hits = grid.searchAt(coord, matchesXMAS);
        matches += hits.filter(Boolean).length;
    }
    return matches;
}

console.log('part1', part1());