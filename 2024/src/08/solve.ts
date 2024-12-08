import { lines, Grid, Coord, group } from '../common/index.js';

const grid = Grid.parse(lines);
const antennaCoords = grid.find(cell => cell !== '.');
const groups = group([...antennaCoords], coord => grid.get(coord)!);

function antiNode(focalPoint: Coord, resonantPoint: Coord): Coord {
    return {
        x: focalPoint.x + (focalPoint.x - resonantPoint.x),
        y: focalPoint.y + (focalPoint.y - resonantPoint.y)
    };
}

const antinodeMap = Grid.fromDimensions(grid.width, grid.height, () => '');
for (const [_name, g] of groups.entries()) {
    for (const focalPoint of g) {
        for (const resonantPoint of g) {
            if (focalPoint === resonantPoint) continue;
            antinodeMap.set(antiNode(focalPoint, resonantPoint), '#', false)
        }
    }
}
const antinodes = [...antinodeMap.find(cell => cell === '#')];

console.log(grid.toString(), groups, antinodes, antinodes.length);