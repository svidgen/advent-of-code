import { blocks, sum } from '../common/index.js';

const [{ lines: sortingLines }, { lines: pageLines }] = blocks;

const rawSortingRules = sortingLines.map(line => line.split('|').map(s => parseInt(s)));
const pageUpdates = pageLines.map(line => line.split(',').map(s => parseInt(s)));

const sortingRules = new Map<number, number[]>();
for (const [a, b] of rawSortingRules) {
    if (!sortingRules.has(a)) sortingRules.set(a, []);
    sortingRules.get(a)!.push(b);
}

/**
 * If any number (A) in the list follows a number (B) at any distance that it
 * (A) should instead precede, the line is invalid. Otherwise, the line is valid.
 * 
 * @param line The sequence of numbers to validate.
 */
function isValid(line: number[]): boolean {
    // For every number (A) we encounter, we will see if there is a rule requiring
    // it (A) precede some others (N ... Z). For each such requirement (R), we'll
    // confirm we have *not* seen that number.
    const seen = new Set<number>();
    for (const A of line) {
        const rule = sortingRules.get(A);
        if (rule) {
            for (const B of rule) {
                if (seen.has(B)) return false;
            }
        }
        seen.add(A);
    }
    return true;
}

/**
 * Comparison for two page numbers to sort by order the the sorting rules.
 */
function byPageRule(a: number, b: number): number {
    const ruleA = sortingRules.get(a);
    if (ruleA) {
        if (ruleA.includes(b)) return 1;
    }
    
    const ruleB = sortingRules.get(b);
    if (ruleB) {
        if (ruleB.includes(a)) return -1;
    }

    // We have rules for all the numbers. This just makes TS happy.
    throw new Error(`No rule found for either ${a} or ${b}.`);
}

function part1() {
    const validUpdates = pageUpdates.filter(isValid);
    const midpoints = validUpdates.map(u => u[Math.floor(u.length / 2)]);
    return sum(midpoints);
}

function part2() {
    const invalidUpdates = pageUpdates.filter(u => !isValid(u)).map(u => u.sort(byPageRule));
    const midpoints = invalidUpdates.map(u => u[Math.floor(u.length / 2)]);
    return sum(midpoints);
}

console.log({part1: part1(), part2: part2()});