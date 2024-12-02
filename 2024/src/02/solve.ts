import {
    lines
} from '../common/index.js';

function intsFromLine(line: string): number[] {
    return line.split(/\s+/g).map(c => parseInt(c))
}

function computeDeltas(numbers: number[]): number[] {
    const d: number[] = [];
    let previous: number | undefined = undefined;
    for (const n of numbers) {
        if (previous) {
            d.push(n - previous);
        }
        previous = n;
    }
    return d;
}

function allSameSign(numbers: number[]): boolean {
    return (numbers[0] > 0) ? numbers.every(n => n > 0) : numbers.every(n => n < 0);
}

function allSafeRange(numbers: number[]): boolean {
    return numbers.every(n => Math.abs(n) >= 1 && Math.abs(n) <= 3);
}

function isSafe(report: string, withTolerance: boolean = false): boolean {
    const values = intsFromLine(report);
    
    if (withTolerance) {
        for (let i = 0; i < values.length; i++) {
            const valuesCopy = [...values];
            valuesCopy.splice(i, 1)
            const deltas = computeDeltas(valuesCopy);
            if (allSameSign(deltas) && allSafeRange(deltas)) {
                return true;
            }
        }
        return false;
    } else {
        const deltas = computeDeltas(values);
        return allSameSign(deltas) && allSafeRange(deltas);
    }
};

function countSafeLines(lines: string[], withTolerance: boolean = false): number {
    let safe = 0;
    for (const line of lines) {
        safe += isSafe(line, withTolerance) ? 1 : 0;
    }
    return safe;
}

console.log('part 1', countSafeLines(lines));
console.log('part 2', countSafeLines(lines, true));