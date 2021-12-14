const insertions: Record<string, string> = {};

`HN -> C
VB -> K
PF -> C
BO -> F
PB -> F
OH -> H
OB -> N
PN -> O
KO -> V
CK -> V
FP -> H
PC -> V
PP -> N
FN -> N
CC -> F
FC -> N
BP -> N
SH -> F
NS -> V
KK -> B
HS -> C
NV -> N
FO -> B
VO -> S
KN -> F
SC -> V
NB -> H
CH -> B
SF -> V
NP -> V
FB -> P
CV -> B
PO -> P
SV -> P
OO -> V
PS -> C
CO -> N
SP -> B
KP -> H
KH -> S
KS -> S
NH -> K
SS -> P
PV -> P
KV -> V
ON -> N
BS -> C
HP -> K
SB -> P
VC -> B
HB -> N
FS -> V
VP -> K
BB -> N
FK -> S
CS -> P
SO -> F
HF -> F
VV -> C
BC -> S
SN -> K
KB -> H
BN -> H
HO -> S
KC -> F
CP -> S
HC -> S
OS -> K
NK -> N
BF -> S
VN -> B
SK -> K
HV -> B
KF -> H
FV -> B
VF -> H
BH -> S
NN -> O
HH -> K
CN -> H
PH -> V
NF -> S
OV -> P
OC -> V
OK -> H
OF -> H
HK -> N
FH -> P
BK -> N
VS -> H
NO -> V
VK -> K
CF -> N
CB -> N
NC -> K
PK -> B
VH -> F
FF -> C
BV -> P
OP -> K`.split('\n')
.filter(line => line.length > 0)
.map(line => line.split(" -> "))
.forEach(([k,v]) => insertions[k] = v);

function init_counter(src: string[]) {
	const counter: Record<string, number> = {};
	for (const k of src) {
		counter[k] = 0;
	}
	return counter;
}

function add_counts(dest: Record<string, number>, add: Record<string, number>, multiplier: number = 1) {
	for (const k of Object.keys(dest)) {
		dest[k] += (add[k] * multiplier);
	}
}

function pair_deltas(pair: string) {
	let characters = init_counter(Object.values(insertions));
	let pairs = init_counter(Object.keys(insertions));

	const insert = insertions[pair];
	characters[insert] = 1;

	// two new pairs are formed.
	pairs[pair[0] + insert] += 1;
	pairs[insert + pair[1]] += 1;

	// but the initial pair is no longer together.
	pairs[pair] += -1;

	return { characters, pairs };
}

let characters = init_counter(Object.values(insertions));
let pairs = init_counter(Object.keys(insertions));

const depth = 40;
const start = "OFSVVSFOCBNONHKFHNPK";

// initial indexing.
for (let i = 0; i < start.length - 1; i++) {
	characters[start[i]] += 1;
	pairs[start[i] + start[i + 1]] += 1;
}
characters[start[start.length - 1]] += 1;


console.clear();

// now we just iteratively just increment our counts ... 
for (let i = 0; i < depth; i++) {
	const round_characters = init_counter(Object.values(insertions));
	add_counts(round_characters, characters);

	const round_pairs = init_counter(Object.keys(insertions));
	add_counts(round_pairs, pairs);

	for (const pair of Object.keys(pairs)) {
		const { characters: c, pairs: p } = pair_deltas(pair);
		add_counts(round_characters, c, pairs[pair]);
		add_counts(round_pairs, p, pairs[pair]);
	}

	characters = round_characters;
	pairs = round_pairs;
}

console.log(characters, pairs);

const max = Math.max(...Object.values(characters));
const min = Math.min(...Object.values(characters));

console.log(max, min, max - min)
