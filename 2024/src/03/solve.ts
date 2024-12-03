import { lines } from '../common/index.js';

type State = {
    sum: number;
    mode: 'do' | "don't"
}

type Instruction = {
    operation: "do" | "don't" | "mul",
    operands: number[]
};

const opPattern = /(do|don\'t|mul)\((\d+,\d+)?\)/g;

function getNextInstruction(
    line: string,
): Instruction | null {
    const match = opPattern.exec(line);
    if (match) {
        const [_, op, operandsString = ''] = match;
        return {
            operation: (op as any),
            operands: operandsString.split(',').map(p => parseInt(p))
        };
    } else {
        return null;
    }
}

function execute(withConditionals: boolean, log: boolean = false) {
    const state: State = {
        sum: 0,
        mode: 'do'
    };

    for (const line of lines) {
        opPattern.lastIndex = -1;
        let instruction: Instruction | null;
        while (instruction = getNextInstruction(line)) {
            if (!withConditionals && ["do", "don't"].includes(instruction.operation)) {
                continue;
            }
            executeInstruction(state, instruction);
            if (log) console.log(instruction, state);
        }
    }

    return state;
}

function executeInstruction(
    state: State,
    instruction: Instruction
) {
    if (instruction.operation === 'do') {
        state.mode = 'do';
    } else if (instruction.operation === 'don\'t') {
        state.mode = 'don\'t';
    } else {
        if (
            state.mode === 'do'
            && instruction.operands.length === 2
        ) {
            state.sum += instruction.operands[0] * instruction.operands[1];
        }
    }
}


console.log('part 1', execute(false).sum);
console.log('part 2', execute(true).sum);

