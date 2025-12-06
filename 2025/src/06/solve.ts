import { lines, sum, transposeArray } from '../common/index.js';

const data = transposeArray(lines.map(l => l.trim().split(/\s+/)));

function part1() {
    const equations = data.map(d => {
        const operation = d.pop();
        return {
            operation,
            operands: d.map(v => parseInt(v))
        };
    });

    return sum(
        equations.map(eq => {
            let t = eq.operation === '*' ? 1 : 0;
            for (const o of eq.operands) {
                if (eq.operation === '*') t *= o;
                if (eq.operation === '+') t += o;
            }
            return t;
        })
    );
}

console.log('part 1', part1());