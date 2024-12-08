import { lines, Grid, Coord, group } from '../common/index.js';

const grid = Grid.parse(lines);
const antennaCoords = grid.find(cell => cell !== '.');
const groups = group([...antennaCoords], coord => grid.get(coord)!);

function part1() {
    function antiNode(focalPoint: Coord, resonantPoint: Coord): Coord {
        return {
            x: focalPoint.x + (focalPoint.x - resonantPoint.x),
            y: focalPoint.y + (focalPoint.y - resonantPoint.y)
        };
    }
    
    const antinodeMap = Grid.fromDimensions(grid.width, grid.height, () => ' ');
    for (const [_name, g] of groups.entries()) {
        for (const focalPoint of g) {
            for (const resonantPoint of g) {
                if (focalPoint === resonantPoint) continue;
                antinodeMap.set(antiNode(focalPoint, resonantPoint), '#', false)
            }
        }
    }
    const antinodes = [...antinodeMap.find(cell => cell === '#')];
    return antinodes.length;
}

function part2() {
    function antiNodes(
        focalPoint: Coord,
        resonantPoint: Coord,
        boundingGrid: Grid<any>
    ): Coord[] {
        const antinodes: Coord[] = [];
        const xStep = (focalPoint.x - resonantPoint.x);
        const yStep = (focalPoint.y - resonantPoint.y);

        let x = focalPoint.x + xStep;
        let y = focalPoint.y + yStep;
        
        while (boundingGrid.includes({x, y})) {
            antinodes.push({x, y});
            x += xStep;
            y += yStep;
        }

        return antinodes;
    }
    
    const antinodeMap = grid.map((value, _coord) => value === '.' ? ' ' : '#');
    for (const [_name, g] of groups.entries()) {
        for (const focalPoint of g) {
            for (const resonantPoint of g) {
                if (focalPoint === resonantPoint) continue;
                for (const n of antiNodes(focalPoint, resonantPoint, grid)) {
                    antinodeMap.set(n, '#', false)
                }
            }
        }
    }

    console.log(antinodeMap.toString());

    const antinodes = [...antinodeMap.find(cell => cell === '#')];
    return antinodes.length;
}


console.log(part1(), part2());