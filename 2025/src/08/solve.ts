import { lines, product } from '../common/index.js';

const IS_EXAMPLE_DATA = lines.length < 1000;
const EDGE_LIMIT = IS_EXAMPLE_DATA ? 10 : 1000;

class Point {
	constructor(public coords: number[]) {};
	
	/**
	 * Creates a point from a Point from a string in "a,b,...n" form.
	 * 
	 * Dimensionality is implicied from the string.
	 * 
	 * E.g., "12,34,45" parses as 3D point `[12, 34, 45]`.
	 */
	static parse(coordString: string): Point {
		const coords = coordString.split(',').map(n => parseInt(n));
		return new Point(coords);
	}

	toString() {
		return this.coords.join(',');
	}
}

class Edge {
	constructor(public a: Point, public b: Point) { }

	get distance() {
		if (this.a.coords.length !== this.b.coords.length) {
			throw new Error("Given points are in different dimensional spaces.");
		}
		let sum = 0;
		for (let i = 0; i < this.a.coords.length; i++) {
			sum += (this.a.coords[i] - this.b.coords[i])**2;
		}
		return Math.sqrt(sum);
	}

	/**
	 * Returns the canonical representation of the edge, with points serialized in
	 * alphanumerical order.
	 * 
	 * @returns 
	 */
	toString() {
		const [a, b] = [this.a.toString(), this.b.toString()].sort()
		return `${a}:${b}`;
	}

	/**
	 * Comparison function to sort an array of Edges by distance ascending.
	 * 
	 * @returns 
	 */
	static byDistance(a: Edge, b: Edge) {
		return a.distance - b.distance;
	}
}

class Cluster {
	points = new Map<string, Point>();
	edges = new Map<string, Edge>();

	constructor(edges: Edge[]) {
		for (const edge of edges) {
			this.edges.set(edge.toString(), edge);
			this.points.set(edge.a.toString(), edge.a);
			this.points.set(edge.b.toString(), edge.b);
		}
	}

	static bySize(a: Cluster, b: Cluster): number {
		return a.size - b.size;
	}

	get size() {
		return this.points.size;
	}

	contains(point: Point) {
		return this.points.has(point.toString());
	}

	touches(edge: Edge) {
		return this.contains(edge.a) || this.contains(edge.b);
	}

	/**
	 * Adds points from the edge to the cluster, even if they're not connected to
	 * any other points in the cluster.
	 * 
	 * If either point is new to the cluster, the edge is also added.
	 * 
	 * Returns the number of points from the edge that were added.
	 */
	add(edge: Edge): number {
		let pointsAdded = 0;

		if (!this.contains(edge.a)) {
			pointsAdded++;
			this.points.set(edge.a.toString(), edge.a);
		}

		if (!this.contains(edge.b)) {
			pointsAdded++;
			this.points.set(edge.b.toString(), edge.b);
		}

		this.edges.set(edge.toString(), edge);

		return pointsAdded;
	}

	cannibalize(other: Cluster) {
		for (const point of other.points.values()) {
			this.points.set(point.toString(), point);
		}
		for (const edge of other.edges.values()) {
			this.edges.set(edge.toString(), edge);
		}
	}
}

class Space {
	constructor(public points: Point[]) {}

	static parse(lines: string[]) {
		return new Space(lines.map(l => Point.parse(l)));
	}

	* _AllPossibleEdges() {
		for (let i = 0; i < this.points.length; i++) {
			for (let j = i + 1; j < this.points.length; j++) {
				yield new Edge(this.points[i], this.points[j]);
			}
		}
	}

	get AllPossibleEdges() {
		return this._AllPossibleEdges();
	}

	findClusters<T extends number | undefined>(limitEdges: T): T extends undefined ? Edge[] : Cluster[] {
		const visitedPoints = new Set<string>();
		const edges = Array.from(this.AllPossibleEdges).sort(Edge.byDistance);
		const clusters: Cluster[] = [];
		const visitedEdges: Edge[] = [];

		for (const edge of limitEdges ? edges.slice(0, limitEdges) : edges) {
			const touchingClusters = clusters.filter(c => c.touches(edge));
			if (touchingClusters.length === 0) {
				clusters.push(new Cluster([edge]));
			} else if (touchingClusters.length === 1) {
				touchingClusters[0].add(edge);
			} else if (touchingClusters.length === 2) {
				touchingClusters[0].cannibalize(touchingClusters[1]);
				const indexB = clusters.indexOf(touchingClusters[1]);
				clusters.splice(indexB, 1);
			}

			visitedPoints.add(edge.a.toString());
			visitedPoints.add(edge.b.toString());
			const allPointsConsumed = visitedPoints.size === this.points.length;
			const allOneCluster = clusters.length === 1;

			visitedEdges.push(edge);
			
			if (allPointsConsumed && allOneCluster) {
				break;
			}
		}

		return (typeof limitEdges === 'undefined' ? visitedEdges : clusters) as any;
	}
}

function part1() {
	const space = Space.parse(lines);
	const clusters = space.findClusters(EDGE_LIMIT);
	clusters.sort(Cluster.bySize).reverse();
	return product(clusters.slice(0, 3).map(c => c.size));
}

function part2() {
	const space = Space.parse(lines);
	const edges = space.findClusters(undefined);
	const bottleneck = edges.pop();
	return bottleneck!.a.coords[0] * bottleneck!.b.coords[0]
}

console.log('part 1', part1());
console.log('part 2', part2());