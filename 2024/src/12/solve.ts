import { lines, Grid, Coord, sum } from '../common/index.js';

const plots = Grid.parse(lines);

class Region<T> {
    private _coords: Coord[] = [];

    constructor(public grid: Grid<T>, public map: Grid<Region<T> | null>) { }

    static findAll<T>(grid: Grid<T>): Set<Region<T>> {
        const map = Grid.fromDimensions<Region<T> | null>(grid.width, grid.height, () => null);
        const regions = new Set<Region<T>>();
        for (const coord of grid.coords) {
            if (map.get(coord)) continue;
            const region = new Region(grid, map);
            region.flood(coord);
            regions.add(region);
        }
        return regions;
    }

    flood(coord: Coord) {
        this.map.set(coord, this);
        this.add(coord);
        for (const n of this.grid.neighbors(coord, { withOrdinals: false })) {
            if (this.map.get(n)) continue;
            if (this.grid.get(n) !== this.grid.get(coord)) continue;
            this.flood(n);
        }
    }
    
    private add(coord: Coord) {
        this._coords.push(coord);
    }

    get area() {
        return this._coords.length;
    }

    get perimeter() {
        let perimeter = 0;

        // each coord has 4 sides and so contributes 4 perimeter *minus* the number of
        // "inside" edges. this can be determined by the number of neighbors it has.
        for (const coord of this._coords) {
            let contribution = 4;
            for (const n of this.map.neighbors(coord, { withOrdinals: false })) {
                if (this.map.get(n) === this) {
                    contribution--;
                }
            }
            perimeter += contribution;
        }

        return perimeter;
    }

    /**
     * Count of "sides".
     * 
     * A "side" is a contiguous/unbent section of the perimeter.
     * 
     * Each cell contributes to the side count based on how many corners it forms.
     * I.e., if you start following a wall, every time you need to turn, a new side
     * is formed.
     * 
     * ```
     * ..........
     * ..O.......
     * ..OOO.....
     * .OOOOO....
     * .OOO.O....
     * ...O......
     * ```
     */
    get sides() {
        return this.corners;
    }

    /**
     * Count of corners.
     * 
     * ```
     * ..........
     * ..O.......
     * ..OOO.....
     * .OOOOO....
     * .OOO.O....
     * ...O......
     * ```
     * 
     * A cell forms a corner at each "open" diagonal where the corresponding/adjacent
     * cardinals are the same -- either both "closed" or both "open".
     */
    get corners() {
        let corners = 0;

        for (const coord of this._coords) {
            const [NW, N, NE, W, E, SW, S, SE] = [
                ...this.map.neighbors(coord, { offGrid: true })
            ].map(c => this.map.get(c) === this);

            const NECorner = !NE && (N === E) ? 1 : 0;
            const NWCorner = !NW && (N === W) ? 1 : 0;
            const SECorner = !SE && (S === E) ? 1 : 0;
            const SWCorner = !SW && (S === W) ? 1 : 0;

            corners += NECorner + NWCorner + SECorner + SWCorner;
        }

        return corners;
    }

    get visual() {
        const v = Grid.fromDimensions<string>(this.map.width, this.map.height, () => '.');
        for (const c of this._coords) {
            v.set(c, 'O');
        }
        return v;
    }
}

const regions = Region.findAll(plots);

console.log('part1', sum([...regions].map(r => {
    const price = r.area * r.perimeter;
    return price;
})));

console.log('part2', sum([...regions].map(r => {
    // console.log(r.visual.toString());
    const price = r.area * r.sides;
    // console.log({ area: r.area, sides: r.sides, price });
    return price;
})));