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
			orientations: []
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

function* range(a, b) {
	for (let i = Math.min(a, b); i <= Math.max(a, b); i++) {
		yield i;
	}
}

function sorted_matrix(matrix) {
	const m = deepcopy(matrix);
	const value = row => row.reduce((v, c) => (v << 1) + (c ? 1 : 0), 0);
	m.sort((a,b) => value(a) > value(b) ? 1 : value(a) < value(b) ? -1 : 0).reverse();
	return m;
}

function solve(matrix) {
	print_matrix(matrix);
	const m = sorted_matrix(matrix);
	print_matrix(m);
	const VARS = m[0].length - 1;
	for (let col = 0; col < VARS; col++) {
		for (let row = 0; row < VARS; row++) {
			if (row === col) continue;
			const ratio = m[row][col] / m[col][col];
			for (let rowcol = 0; rowcol <= VARS; rowcol++) {
				m[row][rowcol] = m[row][rowcol] - ratio * m[col][rowcol];
			}
		}
		print_matrix(m);
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

function get_feature(a, b, c) {
	return [distance(a, b), distance(b, c), distance(c, a)]
		.sort()
		.map(f => f.toFixed(5))
		.join(',')
	;
}

function get_features(points) {
	const features = {};
	points.map(point => {
		points.sort(by_distance(point));
		features[get_feature(...points.slice(0, 3))] = points.slice(0, 3);
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
		p.push(a[i] + b[i]);
	}
	return p;
}

function map_points(points, onto_points, offset) {
	console.log('/* -----');
	print(points);
	print(onto_points);
	const dimensions = points[0].length;
	const map = [];
	for (let d = 0; d < dimensions; d++) {
		const matrix = [];
		for (const [i, point] of points.entries()) {
			matrix.push([...point, onto_points[i][d]]);
		}
		print_matrix(matrix);
		map.push(solve(matrix));
	}
	console.log(map);
	console.log(' ----- */');
	return map;
}

function orient_scanner(scanner, features) {
	for (const [key, points] of Object.entries(scanner.features)) {
		for (const [scanner_id, onto_points] of Object.entries(features[key])) {
			if (scanner_id === scanner.id) continue;
			const offset = vector_subtract(onto_points[0], points[0]);
			const map = map_points(points, onto_points, offset);
			scanner.orientations.push({
				against: Number(scanner_id),
				confidence: 1,
				offset, map
			});
		}
	}
}

for (const scanner of scanners) {
	scanner.features = get_features(scanner.points);
}

const features = {};
for (const scanner of scanners) {
	for (const [key, points] of Object.entries(scanner.features)) {
		features[key] = features[key] || {};
		features[key][scanner.id] = points;
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

console.log('SCANNERS');
print(scanners);

console.log('FEATURES');
print(features);
