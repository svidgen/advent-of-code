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
 * Checks operands from last to first, trying both addition (subtraction) and
 * multiplication (division) to see if 
 * 
 * @param param0 
 * @returns 
 */
function check(result: number, operands: number[]): ("+" | "*")[] | undefined {
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
        const path = check(divided, [...operands]);
        if (path) {
            return [...path, '*'];
        }
    }

    const subtracted = result - operand;
    if (subtracted >= 0) {
        // valid equation path to explore
        const path = check(subtracted, [...operands]);
        if (path) {
            return [...path, '+'];
        }
    }

    // no valid equations found
    return undefined;
}

let total = 0;
for (const problem of problems) {
    if (check(problem.result, [...problem.operands])) {
        total += problem.result;
    }
}

console.log(total);