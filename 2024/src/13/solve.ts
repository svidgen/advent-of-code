import { blocks, transposeArray, sum, Equation, Solution, bestPositiveIntSolution, solveLinearSystem } from '../common/index.js';

function parseLinearEquations(block: (typeof blocks)[number]): Equation[] {
    const input = [
        parseButtonLine(block.lines[0])!,
        parseButtonLine(block.lines[1])!,
        parsePrizeLine(block.lines[2])!,
    ];
    const system = transposeArray(input);
    return system.map(eq => {
        const y = eq.pop()!;
        return { x: eq, y };
    });
}

function parseButtonLine(line: string) {
    const match = line.match(/X\+(\d+), Y\+(\d+)/);
    return match?.slice(1).map(v => parseInt(v));
}

function parsePrizeLine(line: string) {
    const match = line.match(/X=(\d+), Y=(\d+)/);
    return match?.slice(1).map(v => parseInt(v));
}

function costToPlay([a, b]: Solution): number {
    return a * 3 + b * 1;
}

function equationString(eq: Equation) {
    return `${eq.x.map((v,i) => `c${i} * ${v}`).join(' + ')} = ${eq.y}`;
}

function equationSystemString(eqs: Equation[]) {
    return eqs.map(eq => equationString(eq)).join('\n');
}

function solve(eqs: Equation[]): number {
    const solution = bestPositiveIntSolution(eqs, costToPlay);
    console.log(equationSystemString(eqs));
    console.log('solution: ', solution);
    console.log('raw solve: ', solveLinearSystem(eqs));
    console.log();
    if (solution) return costToPlay(solution);
    return 0;
}
console.log('==========================');
console.log('=                        =');
console.log('=    computing part 1    =');
console.log('=                        =');
console.log('==========================\n');
const part1Equations = blocks.map(b => parseLinearEquations(b));
let part1 = sum(part1Equations.map(s => solve(s)));

console.log('==========================');
console.log('=                        =');
console.log('=    computing part 2    =');
console.log('=                        =');
console.log('==========================\n');
const part2Equations = blocks
    .map(b => parseLinearEquations(b))
    .map(eqs => eqs.map(eq => ({
        x: eq.x,
        y: eq.y + 10000000000000
    })));
let part2 = sum(part2Equations.map(s => solve(s)));

console.log('part1', part1);
console.log('part2', part2);
