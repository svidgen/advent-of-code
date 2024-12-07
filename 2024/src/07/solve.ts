import { lines } from '../common/index.js';

const problems = lines.map(line => {
    const [resultString, operandsString] = line.split(': ');
    const operands = operandsString.split(' ').map(o => parseInt(o));
    return {
        result: parseInt(resultString),
        operands
    };
});

/**
 * Checks operands from last to first, trying both addition (subtraction),
 * multiplication (division), and optionally concatenation ("uncatenate") to
 * see if the any equation with the given operands produces the given result.
 * 
 * Essentially a DFS where we exit a search branch as soon as we know the
 * equation won't be valid. Given our input data (all positive integers), we can
 * exit as soon as the result dips below zero or is a non-integer.
 * 
 * @param param0 
 * @returns 
 */
function check(
    result: number,
    operands: number[],
    includeConcatenation: boolean
): ("+" | "*" | '.')[] | undefined {
    const operand = operands.pop()!;

    // base case.
    if (operands.length === 0) {
        if (result === operand) {
            // base operation implicit on the first operand.
            return ['+'];
        } else {
            return undefined;
        }
    }

    // check multiplication
    const divided = result / operand;
    if (divided === Math.floor(divided)) {
        // valid equation path to explore
        const path = check(divided, [...operands], includeConcatenation);
        if (path) {
            return [...path, '*'];
        }
    }

    // check addition
    const subtracted = result - operand;
    if (subtracted >= 0) {
        // valid equation path to explore
        const path = check(subtracted, [...operands], includeConcatenation);
        if (path) {
            return [...path, '+'];
        }
    }

    // check concatenation
    if (includeConcatenation) {
        const r = result.toString()
        const o = operand.toString();
        if (r.endsWith(o)) {
            const uncatted = r.substring(0, r.length - o.length);
            const path = check(parseInt(uncatted), [...operands], includeConcatenation);
            if (path) {
                return [...path, '.'];
            }
        }
    }

    // no valid equations found
    return undefined;
}

let part1 = 0;
let part2 = 0;
for (const problem of problems) {
    if (check(problem.result, [...problem.operands], false)) {
        part1 += problem.result;
    }
    if (check(problem.result, [...problem.operands], true)) {
        part2 += problem.result;
    }
}

console.log(part1, part2);