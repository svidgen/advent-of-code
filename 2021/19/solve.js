const fs = require('fs');
const { off } = require('process');
const util = require('util');

const scanners = fs.readFileSync(0, 'utf-8')
	.split(/--- scanner \d+ ---/g)
	.filter(blob => blob)
	.map((blob, id) => {
		return {
			id,
			points: blob.split("\n")
				.map(s => s.trim())
				.filter(b => b)
				.map(s => s.split(',').map(v => parseInt(v))),
			features: {},
			orientations: [],
			index: {}
		};
	})
;

function deepcopy(o) {
	return JSON.parse(JSON.stringify(o));
}

function print(o) {
	console.log(util.inspect(o, {
		showHidden: false, depth: null, colors: true
	}))
}

function print_matrix(matrix) {
	console.log(
		matrix.map(
			row => row.map(v => v.toFixed(2)).join(', ')
		).join("\n") + "\n"
	);
}

function sorted_matrix(matrix) {
	const m = deepcopy(matrix);
	const value = row => row.reduce((v, c) => (v << 1) + (c ? 1 : 0), 0);
	m.sort((a,b) => value(a) > value(b) ? 1 : value(a) < value(b) ? -1 : 0).reverse();
	return m;
}

function solve(matrix) {
	const VARS = matrix[0].length - 1;

	// print_matrix(matrix);
	const m = sorted_matrix(matrix).slice(0, VARS);
	// print_matrix(m);
	
	for (let col = 0; col < VARS; col++) {
		for (let row = 0; row < VARS; row++) {
			if (row === col) continue;
			const ratio = m[row][col] / m[col][col];
			for (let rowcol = 0; rowcol <= VARS; rowcol++) {
				m[row][rowcol] = m[row][rowcol] - ratio * m[col][rowcol];
			}
		}
		// print_matrix(m);
	}
	return m.map((row, i) => row[m.length]/row[i]);
}

function distance(a, b) {
	let squared_sums = 0;
	for (const i of a.keys()) {
		squared_sums += Math.pow(a[i] - b[i], 2);
	}
	return Math.sqrt(squared_sums);
}

function by_distance(to_point) {
	return function(a, b) {
		const dist_a = distance(a, to_point);
		const dist_b = distance(b, to_point);
		if (dist_a > dist_b) return 1;
		if (dist_a < dist_b) return -1;
		return 0;
	};
}

function by_universal_order(a, b) {
	for (let d = 0; d < a.length; d++) {
		if (Number(a[d]) > Number(b[d])) return 1;
		if (Number(a[d]) < Number(b[d])) return -1;
	}
	return 0;
}

function get_feature(a, b, c) {
	return [distance(a, b), distance(b, c), distance(c, a)]
		.sort()
		.map(f => f.toFixed(0))
		.join(',')
	;
}

function get_features(points, system_size = 10) {
	const features = {};
	points.map(point => {
		const system = points.sort(by_distance(point)).slice(0, system_size);
		while (system.length >= 3) {
			const triad = system.slice(0, 3);
			const f = get_feature(...triad);
			features[f] = features[f] || [];
			features[f].push(triad.sort(by_universal_order));
			system.splice(1,1);
		}
	});
	return features;
}

function vector_subtract(a, b) {
	const d = [];
	for (let i = 0; i < a.length; i++) {
		d.push(a[i] - b[i]);
	}
	return d;
}

function vector_add(a, b) {
	const p = [];
	for (let i = 0; i < a.length; i++) {
		p.push(Number(a[i]) + Number(b[i]));
	}
	return p;
}

function map_points(points, onto_points, offset) {
	// console.log('/* -----');
	// print(points);
	const offset_points = points.map(p => vector_add(p, offset));
	// print(offset_points);
	// print(onto_points);
	const dimensions = offset_points[0].length;
	const map = [];
	for (let d = 0; d < dimensions; d++) {
		const matrix = [];
		for (const [i, point] of offset_points.entries()) {
			matrix.push([...point, onto_points[i][d]]);
		}
		// print_matrix(matrix);
		map.push(solve(matrix));
	}
	// console.log(map);
	// console.log(' ----- */');
	return map;
}

function is_simple(map) {
	for (const dimension of map) {
		for (const c of dimension) {
			if ([-1, 0, 1].every(v => {
				return c < (v - 0.02) || Number(c) > (0.02 + v)
			})) {
				return false;
			}
		}
	}
	return true;
}

function orientation_key(o) {
	return [
		o.against,
		...o.offset,
		...o.map(d => d.map(c => Number(c).toFixed(2)))
	].join(',');
}

function orient_scanner(scanner, features) {
	for (const [key, findings] of Object.entries(scanner.features)) {
		for (const points of findings) {
			for (const [scanner_id, onto_points] of Object.entries(features[key])) {
				if (Number(scanner_id) == Number(scanner.id)) continue;
				const offset = vector_subtract(onto_points[0], points[0]);
				const map = map_points(points, onto_points, offset);
				const orientation = {
					against: Number(scanner_id),
					confidence: 1,
					offset, map
				};
				const o_key = orientation_key(orientation);
				if (scanner.index[o_key]) {
					scanner.index[o_key].confidence++;
				} else {
					scanner.orientations.push(orientation);
					scanner.index[o_key] = orientation;
				}
			}
		}
	}
}

for (const scanner of scanners) {
	scanner.features = get_features(scanner.points);
}

const features = {};
for (const scanner of scanners) {
	for (const [key, findings] of Object.entries(scanner.features)) {
		for (const points of findings) {
			features[key] = features[key] || {};
			features[key][scanner.id] = points;
		}
	}
}

scanners[0].orientations = [{
	against: 0,
	confidence: Number.MAX_SAFE_INTEGER,
	map: [
		[1, 0, 0],
		[0, 1, 0],
		[0, 0, 1]
	],
	offset: [
		[0, 0, 0],
		[0, 0, 0],
		[0, 0, 0]
	]
}];

for (const s of scanners) {
	orient_scanner(s, features);
}

// console.log("ORIGIN");
// print(scanners[0]);

console.log('SCANNERS');
print(scanners.map(s => {
	return {id: s.id, orientations: s.orientations}
}));

// console.log('FEATURES');
// print(features);
