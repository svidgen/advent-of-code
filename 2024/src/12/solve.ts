import { lines, Grid, Coord, Region, sum } from '../common/index.js';

const plots = Grid.parse(lines);

const regions = Region.findAll(plots);

console.log('part1', sum([...regions].map(r => {
    const price = r.area * r.perimeter;
    return price;
})));

console.log('part2', sum([...regions].map(r => {
    const price = r.area * r.sides;
    return price;
})));