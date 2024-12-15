import { Grid } from '../common/index.js';

const grid = Grid.fromDimensions(20, 20, () => '.');
grid.set({ x: 6, y: 10 }, '*');

console.log(grid.toString())
console.log(grid.width, grid.height, [...grid.coords].length);