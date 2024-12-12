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

    get visual() {
        const v = Grid.fromDimensions<string>(this.map.width, this.map.height, () => '.');
        for (const c of this._coords) {
            v.set(c, '#');
        }
        return v;
    }
}

const regions = Region.findAll(plots);
console.log(sum([...regions].map(r => {
    console.log(r.visual.toString());
    const price = r.area * r.perimeter;
    console.log({ area: r.area, perimeter: r.perimeter, price });
    return price;
})));