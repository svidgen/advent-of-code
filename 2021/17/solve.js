const sample = {
	x: [20, 30],
	y: [-10, -5]
};

const data = {
	x: [241, 275],
	y: [-75, -49]
};


function distance(v, steps) {
	const j = v - steps + 1;
	return ( (v + j) * ( v - j + 1 ) ) / 2;
}

function peak(v, steps) {
	if (v < 0) return 0;
	let j = Math.max(0, v - steps + 1);
	return ( (v + j) * (v - j + 1) ) / 2;
}

function* range(a, b) {
	for (let i = Math.min(a, b); i <= Math.max(a, b); i++) {
		yield i;
	}
}

function index(idx, hit) {
	idx[hit.steps] = idx[hit.steps] || [];
	idx[hit.steps].push(hit);
}

function join(idx_x, idx_y) {
	const hits = [];
	idx_x.forEach((x_hits, i) => {
		(x_hits || []).forEach(x_hit => {
			(idx_y[i] || []).forEach((y_hit) => {
				hits.push({
					x: x_hit,
					y: y_hit,
					y_peak: peak(y_hit.velocity, y_hit.steps)
				});
			});
		});
	});
	return hits;
}

function hits_between_x(a, b) {
	const hits = [];
	for (const velocity of range(0, 400)) {
		for (const steps of range(0, 1200)) {
			const d = distance(velocity, Math.min(steps, velocity));
			if (d >= a && d <= b) {
				index(hits, {velocity, steps, distance: d});
			}
		}
	}

	return hits;
}

function hits_between_y(a, b) {
	const hits = [];
	for (const velocity of range(-200, 400)) {
		for (const steps of range(0, 1200)) {
			const d = distance(velocity, steps);
			if (d >= a && d <= b) {
				index(hits, {velocity, steps, distance: d});
			}
		}
	}
	return hits;
}

function get_hits(scenario) {
	const x_hits = hits_between_x(...scenario.x);
	const y_hits = hits_between_y(...scenario.y);
	return join(x_hits, y_hits);
}

function highest(hits) {
	let h;
	for (const hit of hits) {
		if (!h || hit.y_peak > h.y_peak) {
			h = hit;
		}
	}
	return h;
}

for (const dataset of [sample, data]) {
	const hits = get_hits(dataset);
	const hit_strings = [...new Set(hits.map(h => `${h.x.velocity},${h.y.velocity}`))];
	// console.log(hits.map(h => `${h.x.steps}/${h.y.steps} ... ${h.x.velocity},${h.y.velocity} -> ${h.x.distance},${h.y.distance} : ${h.y_peak}`).join('\n'));
	console.log(highest(hits));
	console.log('count', hit_strings.length);
}
