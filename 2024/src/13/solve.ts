import { blocks, transposeArray, sum, Equation, Solution, bestPositiveIntSolution } from '../common/index.js';

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

const equations = blocks.map(b => parseLinearEquations(b));
const solutions = equations.map(eq => bestPositiveIntSolution(eq, costToPlay));
const scores = solutions.filter(Boolean).map(s => costToPlay(s!));

console.log(equations, solutions, scores, sum(scores));