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

const equations = blocks.map(b => parseLinearEquations(b));

let part1 = 0;
for (const eq of equations) {
    const solution = bestPositiveIntSolution(eq, costToPlay);
    console.log(equationSystemString(eq));
    console.log('solution: ', solution);
    console.log('raw solve: ', solveLinearSystem(eq));
    console.log();
    if (solution) part1 += costToPlay(solution);
}
console.log('part1', part1);
