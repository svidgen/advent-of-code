const fs = require('fs');
const data = fs.readFileSync(0, 'utf-8');

const lines = data.split('\n');

const items = [];
const priority = {};
for (let c = 'a'.charCodeAt(0); c <= 'z'.charCodeAt(0); c++) {
	items.push(String.fromCharCode(c));
}
for (let c = 'A'.charCodeAt(0); c <= 'Z'.charCodeAt(0); c++) {
	items.push(String.fromCharCode(c));
}
items.forEach((c, i) => { priority[c] = i + 1; });

const compartmentsOf = (line, qty) => {
	const compartments = [];
	const size = Math.floor(line.length / qty);
	for (let id = 0; id < qty; id++) {
		const compartment = {};
		compartments.push(compartment);
		for (let idx = 0; idx < size; idx++) {
			const item = line[size * id + idx];
			compartment[item] = compartment[item] || 0;
			compartment[item] += 1;
		}
	}
	return compartments;
};

const collisionsBetween = collections => {
	const itemIndex = collections.reduce((agg, compartment, idx) => {
		for (const [item, count] of Object.entries(compartment)) {
			agg[item] = agg[item] || [];
			agg[item].push(idx);
		}
		return agg;
	}, {});
	return Object.entries(itemIndex).filter(([item, comparts]) =>
		comparts.length > 1
	).map(([item]) => item);
};

// part 1
const sacks = lines.filter(l => l).map(sack => compartmentsOf(sack, 2));
const collisions = sacks.map(sack => collisionsBetween(sack));
const pScores = collisions.map(c => c.reduce((sum, item) => 
	sum += priority[item],
	0
));
const finalScore = pScores.reduce((sum, score) => sum += score, 0);

// part 2
//
// ....

console.log(JSON.stringify({
	sacks,
	items,
	priority,
	collisions,
	pScores,
	finalScore
}, null, 2));
