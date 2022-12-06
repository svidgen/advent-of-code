const fs = require('fs');
const data = fs.readFileSync(0, 'utf-8');
const lines = data.split('\n');

class Instruction {
	moveFrom;
	moveTo;
	moveQty;

	constructor(parsed) {
		this.moveQty = parsed[1];
		this.moveFrom = parsed[2];
		this.moveTo = parsed[3];
	}

	execute(moveFrom, moveTo) {
		for (let i = 0; i < this.moveQty; i++) {
			stacks[this.moveTo - 1].push(stacks[this.moveFrom - 1].pop());
		}
	}

	executeV2() {
		const temp = [];
		for (let i = 0; i < this.moveQty; i++) {
			temp.push(stacks[this.moveFrom - 1].pop());
		}
		for (let i = 0; i < this.moveQty; i++) {
			stacks[this.moveTo - 1].push(temp.pop());
		}
	}
}


const stacks = [];
const instructions = [];

const parsers = [
	instruction => {
		const parsed = instruction.match(/^move (\d+) from (\d+) to (\d+)$/);
		if (parsed) {
			instructions.push(new Instruction(parsed));
			return true;
		}
	},
	crateLine => {
		if (crateLine.trim().startsWith('[')) {
			for (let i = 1; i < crateLine.length; i += 4) {
				const idx = (i - 1) / 4;
				const c = crateLine[i];
				if (c.trim()) {
					console.log(`adding ${i} (${c}) to ${idx}`);
					stacks[idx] = stacks[idx] || [];
					stacks[idx].push(crateLine[i]);
				}
			}
			return true;
		}
	},
	numberLine => {
		return numberLine.startsWith(" 1   2   3");
	},
	separator => {
		return separator.trim() === '';
	},
];

for (const line of lines) {
	for (const parse of parsers) {
		if (parse(line)) {
			break;
		}
	}
}

for (const stack of stacks) {
	stack.reverse();
}

console.log(stacks);
for (const c of instructions) {
	// execution steps mutate state.
	// part 1 and part 2 cannot run concurrently

	// part 1
	// c.executeV2();

	// part 2
	c.executeV2();
}

console.log(
	stacks,
	stacks.map(s => s[s.length - 1]).join(''),
);

