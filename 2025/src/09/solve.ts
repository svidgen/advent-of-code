import fs from 'fs';
import { byValue, Coord, lines, selfJoin } from '../common/index.js';

type LogRecord = {
	a: Coord;
	b: Coord;
	error: string;
	offenderA: any;
	offenderB: any;
};

/**
 * Like a line segment, but always vertical or horizontal
 */
class BlockSegment {
	constructor(public a: Coord, public b: Coord) {}

	get isVertical() {
		return this.a.x === this.b.x;
	}

	get isHorizontal() {
		return this.a.y === this.b.y;
	}

	parallelTo(other: BlockSegment) {
		return this.isVertical === other.isVertical;
	}

	crosses(other: BlockSegment) {
		// can't cross each other if they're parallel!
		if (this.parallelTo(other)) return false;

		// remember: segments are strictly horizontal or vertical
		if (this.isVertical) {
			return (
				// !this.connectedTo(other) &&
				isBetween(other.a.y, this.a.y, this.b.y) && 
				isBetween(this.a.x, other.a.x, other.b.x)
			);
		} else {
			return other.crosses(this);
		}
	}

	touches(other: BlockSegment) {
		return this.contains(other.a) || this.contains(other.b);
	}

	contains(coord: Coord) {
		return (
			coord.x >= Math.min(this.a.x, this.b.x) &&
			coord.x <= Math.max(this.a.x, this.b.x) &&
			coord.y >= Math.min(this.a.y, this.b.y) &&
			coord.y <= Math.max(this.a.y, this.b.y)
		);
	}

	equals(other: BlockSegment) {
		return coordsEqual(this.a, other.a) && coordsEqual(this.b, other.b);
	}
}

/**
 * Whether `q` is strictly between `a` and `b`.
 * Touching is not "between" for our purposes.
 * 
 * @param q 
 * @param a 
 * @param b 
 * @returns 
 */
function isBetween(q: number, a: number, b: number) {
	if (q > a && q < b) return true;
	if (q < a && q > b) return true;
	return false;
}

const coords: Coord[] = lines.map(line => {
	const [ x , y ] = line.split(',').map(n => parseInt(n));
	return { x, y };
});

/**
 * Different than "real" area, since we're measuring between blocks; not *points*.
 * 
 * I.e., 1,1 -> 1,2 has a width of 2 and a height of 1. If we were dealing with
 * *points*, it would have a width of 1 and a height of 0. :D
 * 
 * @param a 
 * @param b 
 * @returns 
 */
function blockArea(a: Coord, b: Coord) {
	const width = 1 + Math.abs((a.x - b.x));
	const height = 1 + Math.abs((a.y - b.y));
	return width * height;
}

function coordsEqual(a: Coord, b: Coord) {
	return a.x === b.x && a.y === b.y;
}

function isValid(a: Coord, b: Coord, coords: Coord[], segments: BlockSegment[], logging: LogRecord[]) {
	const S = JSON.stringify({a, b});

	const LEFT = Math.min(a.x, b.x);
	const RIGHT = Math.max(a.x, b.x);
	const TOP = Math.min(a.y, b.y);
	const BOTTOM = Math.max(a.y, b.y);

	const TL = { x: LEFT, y: TOP };
	const TR = { x: RIGHT, y: TOP };
	const BL = { x: LEFT, y: BOTTOM };
	const BR = { x: RIGHT, y: BOTTOM };

	const T = new BlockSegment(TL, TR);
	const R = new BlockSegment(TR, BR);
	const B = new BlockSegment(BR, BL);
	const L = new BlockSegment(BL, TL);

	// a coord within the box indicates some kind of shape within the shape.
	// i.e. ... dead space.
	for (const coord of coords) {
		if (coordsEqual(coord, a) || coordsEqual(coord, b)) continue;
		if (isBetween(coord.x, LEFT, RIGHT) && isBetween(coord.y, TOP, BOTTOM)) {
			// logging.push({a, b, offender: coord, status: 'FAIL: Coord'});
			return false
		};
	}

	for (const seg of segments) {
		if ([T, R, B, L].some(bound => bound.equals(seg))) continue;

		// a segment *crossing* the bound is a dead giveway that we have dead space.
		if ([T, R, B, L].some(bound => bound.crosses(seg))) {
			logging.push({a, b, offenderA: seg.a, offenderB: seg.b, error: 'Cross'});
			return false;
		}

		// a segment that "splits" the space from top to bottom or left to right ...
		// ... also a clear signal that we have dead space.
		if (T.touches(seg) && B.touches(seg)) {
			logging.push({a, b, offenderA: seg.a, offenderB: seg.b, error: 'T/B split'});
			return false;
		}
		if (L.touches(seg) && R.touches(seg)) {
			logging.push({a, b, offenderA: seg.a, offenderB: seg.b, error: 'L/R split'});
			return false;
		}
	}

	return true;
}

function makeSegments() {
	const segments: BlockSegment[] = [];
	for (let i = 0; i < coords.length - 1; i++) {
		segments.push(new BlockSegment(coords[i], coords[i + 1]));
	}
	segments.push(new BlockSegment(coords[coords.length - 1], coords[0]));
	return segments;
}

function part1() {
	return selfJoin(coords)
		.map(({ a, b }) => blockArea(a, b))
		.sort(byValue).pop();
}

function part2() {
	const segments = makeSegments();
	const logging = [] as LogRecord[];

	const result = selfJoin(coords)
		.filter(({ a, b }) => isValid(a, b, coords, segments, logging))
		.map(({ a, b }) => blockArea(a, b))
		.sort(byValue).pop();

	// troubleshooting
	// console.table(logging.filter(l => blockArea(l.a, l.b) > 1461954456));

	return result;
}

function writeSvgFromPoints(filePath: string, points: Coord[]) {
	if (!points.length) throw new Error("Expected at least one point");

	const segments = makeSegments();
	const options = selfJoin(coords)
		.filter(({ a, b }) => isValid(a, b, coords, segments, []))
		.map(({ a, b }) => ({
			a, b,
			area: blockArea(a, b)
		}))
		.sort((a, b) => a.area === b.area ? 0 : (a.area > b.area ? 1 : 0)).reverse().slice(0, 2);

	// Determine SVG size from bounds
	const maxX = Math.max(...points.map(p => p.x));
	const maxY = Math.max(...points.map(p => p.y));

	// Build path
	const [first, ...rest] = points;
	const moveTo = `M${first.x} ${first.y}`;
	const lineTos = rest.map(p => `L${p.x} ${p.y}`).join(" ");
	const d = `${moveTo}${rest.length ? " " + lineTos + " Z" : ""}`;

	const optionsHighlight = options.map(o => `<rect
			x="${Math.min(o.a.x, o.b.x)}"
			y="${Math.min(o.a.y, o.b.y)}"
			width="${Math.abs(o.a.x - o.b.x)}"
			height="${Math.abs(o.a.y - o.b.y)}"
			style="stroke:red; stroke-width:50; fill:#0c0; opacity: 25%;"
		/>`
	).join('\n');

	const labels = points
		.map((p, i) =>`
			<text
				x="${p.x + (i % 2 === 0 ? 600 : -600)}"
				y="${p.y + (i % 2 === 0 ? 300 : -300)}"
				font-size="400" fill="red">(${p.x},${p.y})</text>
			<line
				x1="${p.x}" y1="${p.y}"
				x2="${p.x + (i % 2 === 0 ? 600 : -600)}"
				y2="${p.y + (i % 2 === 0 ? 300 : -300)}"
				stroke="gray" stroke-width="30"
			/>
			`
		)
		.join("\n  ");

	const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${maxX} ${maxY + 500}" style="width: 100vw; height 100vh">
  <path d="${d}" stroke="black" stroke-width="100" fill="none" />
  ${labels}
  ${optionsHighlight}
</svg>
`.trim();

	fs.writeFileSync(filePath, svg, "utf8");
}

writeSvgFromPoints('./debug.svg', coords);

console.log('part 1', part1());
console.log('part 2', part2());