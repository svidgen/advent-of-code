const fs = require('fs');
const data = fs.readFileSync(0, 'utf-8');

const lines = data.split('\n');
const elves = [];

let max = 0;
let theHeavyElf = 0;
let elf = undefined;

const addElf = () => {
	if (elf === undefined) return;
	elves.push(elf);
	if (elf > max) {
		theHeavyElf = elves.length;
		max = elf;
	}
}

for (const line of lines) {
	if (line.trim() === '') {
		addElf();
		elf = undefined;
	} else {
		elf = (elf || 0) + Number(line);
	}
}

// the final elf will not necessarily end with a blank line
addElf();

// part 1
console.log(JSON.stringify({
	elves,
	max,
	theHeavyElf
}, null, 2));

// part 2
elves.sort();
console.log(elves.pop() + elves.pop() + elves.pop());
