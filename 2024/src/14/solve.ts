import {
    lines,
    mod,
    product,
    copy,
    byValue,
    Coord,
    Velocity,
    Grid,
    Region
} from '../common/index.js';

const settings = lines.shift();

const [ width, height ] = settings!.trim().split('x').map(v => parseInt(v));

type Box = {
    top: number;
    left: number;
    bottom: number;
    right: number;
};

type BoundingBox = {
    width: number;
    height: number;
}

const quadrants = {
    NW: {
        top: 0,
        left: 0,
        bottom: Math.floor(height / 2) - 1,
        right: Math.floor(width / 2) - 1,
    },
    NE: {
        top: 0,
        left: Math.ceil(width / 2),
        bottom: Math.floor(height / 2) - 1,
        right: width - 1,
    },
    SW: {
        top: Math.ceil(height / 2),
        left: 0,
        bottom: height - 1,
        right: Math.floor(width / 2) - 1,
    },
    SE: {
        top: Math.ceil(height / 2),
        left: Math.ceil(width / 2),
        bottom: height - 1,
        right: width - 1,
    },
};

console.log('Settings', { width, height });

/**
 * Moves like a projectile, but teleports across the board when it
 * hits an edge.
 */
class Ghost {
    public initial: Coord;
    private _pattern: Coord[] | undefined = undefined;

    constructor(
        public position: Coord,
        public velocity: Velocity,
        public boundingBox: {
            width: number;
            height: number;
        }
    ) {
        this.initial = { ...this.position };
    }

    private computeMove(
        position: Coord,
        seconds: number
    ) {
        return {
            x: mod((position.x + this.velocity.x * seconds), this.boundingBox.width),
            y: mod((position.y + this.velocity.y * seconds), this.boundingBox.height)
        };
    }

    public move(seconds: number) {
        const { x, y } = this.computeMove(this.position, seconds);
        this.position.x = x;
        this.position.y = y;
    }

    public at(seconds: number) {
        return this.computeMove(this.initial, seconds);
    }

    public isInside(box: Box) {
        return (true
            && this.position.x <= box.right
            && this.position.x >= box.left
            && this.position.y >= box.top
            && this.position.y <= box.bottom
        );
    }

    /**
     * Determine the repeating patrol pattern.
     * 
     * Useful if N ghosts are patrolling on patterns in distinct intervals.
     * 
     * (In this case, they aren't.)
     * 
     * @returns 
     */
    private computePatrolPattern() {
        const coords: Coord[] = [copy(this.initial)];
        let seconds = 1;
        while (true) {
            const { x, y } = this.computeMove(this.initial, seconds);
            if (x === this.initial.x && y === this.initial.y) {
                // we're back at the start. (pattern found.)
                break;
            }
            coords.push({ x, y });
            seconds++;
        }
        return coords;
    }

    get pattern(): Coord[] {
        if (!this._pattern) this._pattern = this.computePatrolPattern();
        return this._pattern!;
    }

    get interval(): number {
        return this.pattern.length;
    }
}

function parseGhosts() {
    return lines.map(line => {
        const m = line.match(/^p=(\d+),(\d+) v=([-\d]+),([-\d]+)$/);
        if (!m) return;
        const [px, py, vx, vy] = m.slice(1).map(v => parseInt(v));
        return new Ghost( { x: px, y: py }, { x: vx, y: vy }, { width, height });
    }).filter(Boolean) as Ghost[];
}

function isTreeCoord(coord: Coord): boolean {
    const center = Math.floor(width / 2);
    const dCenter = Math.abs(coord.x - center);
    return (coord.y <=center && dCenter <= coord.y) || (coord.y > center && dCenter <= 3);
}

function treeNess(coords: Coord[]) {
    let count = 0;
    const filled = new Set<string>();
    for (const c of coords) {
        const lookup = `${c.x},${c.y}`;
        if (filled.has(lookup)) continue;
        filled.add(lookup);
        count += isTreeCoord(c) ? 1 : 0;
    }
    return count;
}

function biggestCluster(coords: Coord[]): number {
    const trackingGrid = Grid.fromDimensions<number>(width, height);
    coords.forEach(c => trackingGrid.set(c, 1));
    const regions = [...Region.findAll(trackingGrid, {
        withOrdinals: true
    })];
    const biggest = regions
        .filter(r => r.value === 1)
        .map(r => r.coords.length)
        .sort(byValue).reverse()[0];
    return biggest;
}

function part1() {
    const ghosts = parseGhosts();
    ghosts.forEach(g => g.move(100));
    return product(Object.values(quadrants)
        .map(q => ghosts.filter(g => g.isInside(q)).length));
}

/**
 * I pre-validated that the ghosts all have the interval. That means we have a
 * maximum of 101 * 103 steps to look at. So, we're going to look at each one
 * individually.
 * 
 * Full disclosure. I tried 2 things before looking for a hint:
 * 
 * 1. I created treeNess function that ranks configurations by how many ghosts
 * are present in the tree-shape that most-fills the space. IIR, this approach found
 * a solution *near* the real/final solution at around the 6800 mark. It involved
 * about 200 ghosts. (See `isTreeCoord` and `treeNess`)
 * 
 * 2. I updated the `isTreeCoord` function to rank configurations by how many ghosts
 * fell strictly on the *outline* of tree shape. This was roughly the same.
 * 
 * 3. I updated the `isTreeCoord` to include the "stem". This passed a threshold where
 * it involved more ghosts. But, still wasn't sufficient for the puzzle.
 * 
 * Finally, I googled for a hint, which suggested that I just look for the frame
 * with the biggest cluster of connected ghosts -- which would *probably* be the
 * intended tree shape. (It is.)
 * 
 * @returns 
 */
function part2() {
    const ghosts = parseGhosts();
    let scores: number[] = [];
    for (let seconds = 0; seconds < 101 * 103; seconds++) {
        scores.push(biggestCluster(ghosts.map(ghost => ghost.at(seconds))));
    }
    const bestScore = [...scores].sort(byValue).reverse()[0];
    return scores.indexOf(bestScore);
}


console.log('part1', part1());
console.log('part2', part2());