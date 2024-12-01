import {
    lines,
    transposeLines,
    byValue,
    mapGrid,
    zipMap,
    sum,
    index
} from '../common/index.js';

/**
 * common
 */
const [left, right] = mapGrid(transposeLines(lines), s => parseInt(s));

/**
 * part 1
 */
const distances = zipMap(
    left.sort(byValue),
    right.sort(byValue),
    (a, b) => Math.abs(Number(a) - Number(b))
);
const part1 = sum(distances);
console.log('part 1', part1);

/**
 * part 2
 */
const rightIndex = index(right);
const scores = left.map(v => v * (rightIndex.get(v)?.length || 0));
const part2 = sum(scores);
console.log('part 2', part2);