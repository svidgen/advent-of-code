const fs = require('fs');
const data = fs.readFileSync(0, 'utf-8').trim();
const lines = data.split('\n');

const counts = {'ROOT': 0};
let stack = ['ROOT'];

const pathname = (stack, dir = null) => [...stack, dir].filter(i => i).join('/');

for (let i = 0; i < lines.length; i++) {
	const line = lines[i];
	console.log({line});

	const command_cd = line.match(/^\$ cd (.+)$/);
	if (command_cd) {
		console.log({command_cd});
		if (command_cd[1] === '/') {
			stack = ['ROOT'];
		} else if (command_cd[1] === '..') {
			const popped = stack.pop();
			console.log('popped', popped);
		} else {
			console.log('pushing ', command_cd[1]);
			stack.push(command_cd[1]);
		}
		continue;
	}

	const command_ls = line.match(/^\$ ls$/);
	if (command_ls) {
		console.log({command_ls});
		while (i < lines.length) {
			i++;
			const outline = lines[i];
			console.log({outline});
			if (!outline) break;

			const output_dir = outline.match(/^dir (.+)$/);
			if (output_dir) {
				counts[pathname(stack, output_dir[1])] = 0;
				continue;
			}

			const output_filesize = outline.match(/^(\d+) (.+)$/);
			if (output_filesize) {
				for (let d = 1; d <= stack.length; d++) {
					counts[pathname(stack.slice(0, d))] += Number(output_filesize[1]);
				}
				continue;
			}

			i--;
			break;
		}
	}
}

// part 1

let total = 0;
for (const d of Object.values(counts)) {
	if (d <= 100_000) {
		total += d;
	}
}

// part 2

const DISK_SIZE = 70000000;
const SPACE_NEEDED = 30000000;
const SPACE_FREE = DISK_SIZE - counts['ROOT'];
const SPACE_TO_RECLAIM = SPACE_NEEDED - SPACE_FREE;

let size_reclaimed;
const all = Object.values(counts).sort((a,b) => {
	if (a > b) return 1;
	if (b > a) return -1;
	return 0;
});

for (const size of all) {
	if (size >= SPACE_TO_RECLAIM) {
		size_reclaimed = size;
		break;
	}
}

console.log({counts, total, all, size_reclaimed});
