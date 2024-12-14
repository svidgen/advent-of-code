import { lines, mod, product, Coord, Velocity } from '../common/index.js';

const settings = lines.shift();

const [ width, height ] = settings!.trim().split('x').map(v => parseInt(v));

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

type Box = {
    top: number;
    left: number;
    bottom: number;
    right: number;
};

console.log('Settings', { width, height });

/**
 * Moves like a projectile, but teleports across the board when it
 * hits an edge.
 */
class Ghost {
    public initial: Coord;

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

    public move(seconds: number) {
        this.position.x =
            mod((this.position.x + this.velocity.x * seconds), this.boundingBox.width);

        this.position.y =
            mod((this.position.y + this.velocity.y * seconds ), this.boundingBox.height);
    }

    public isInside(box: Box) {
        return (true
            && this.position.x <= box.right
            && this.position.x >= box.left
            && this.position.y >= box.top
            && this.position.y <= box.bottom
        );
    }
}

const ghosts = lines.map(line => {
    const m = line.match(/^p=(\d+),(\d+) v=([-\d]+),([-\d]+)$/);
    if (!m) return;
    const [px, py, vx, vy] = m.slice(1).map(v => parseInt(v));
    return new Ghost( { x: px, y: py }, { x: vx, y: vy }, { width, height });
}).filter(Boolean) as Ghost[];

ghosts.forEach(g => g.move(100));
const part1 = Object.values(quadrants)
    .map(q => ghosts.filter(g => g.isInside(q)).length);

console.log('part1', product(part1));