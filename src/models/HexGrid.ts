export interface OffsetCoord {
    col: number;
    row: number;
}

export interface CubeCoord {
    q: number;
    r: number;
    s: number;
}

export interface AxialCoord {
    q: number;
    r: number;
}

export interface PixelCoord {
    x: number;
    y: number;
}

interface Orientation {
    f0: number; f1: number; f2: number; f3: number;
    b0: number; b1: number; b2: number; b3: number;
    startAngle: number;
}

const POINTY_TOP: Orientation = {
    f0: Math.sqrt(3.0),
    f1: Math.sqrt(3.0) / 2.0,
    f2: 0.0,
    f3: 3.0 / 2.0,
    b0: Math.sqrt(3.0) / 3.0,
    b1: -1.0 / 3.0,
    b2: 0.0,
    b3: 2.0 / 3.0,
    startAngle: 0.5
};

export class HexGrid {
    private size: number;
    private orientation: Orientation;

    constructor(size: number) {
        this.size = size;
        this.orientation = POINTY_TOP;
    }

    offsetToCube(hex: OffsetCoord): CubeCoord {
        const q = hex.col - (hex.row - (hex.row & 1)) / 2;
        const r = hex.row;
        const s = -q - r;
        return { q, r, s };
    }

    cubeToOffset(hex: CubeCoord): OffsetCoord {
        const col = hex.q + (hex.r - (hex.r & 1)) / 2;
        const row = hex.r;
        return { col, row };
    }

    add(a: CubeCoord, b: CubeCoord): CubeCoord {
        return { q: a.q + b.q, r: a.r + b.r, s: a.s + b.s };
    }

    subtract(a: CubeCoord, b: CubeCoord): CubeCoord {
        return { q: a.q - b.q, r: a.r - b.r, s: a.s - b.s };
    }

    scale(a: CubeCoord, k: number): CubeCoord {
        return { q: a.q * k, r: a.r * k, s: a.s * k };
    }

    direction(direction: number): CubeCoord {
        const directions: CubeCoord[] = [
            { q: 1, r: 0, s: -1 }, { q: 1, r: -1, s: 0 }, { q: 0, r: -1, s: 1 },
            { q: -1, r: 0, s: 1 }, { q: -1, r: 1, s: 0 }, { q: 0, r: 1, s: -1 }
        ];
        return directions[direction];
    }

    neighbor(hex: CubeCoord, direction: number): CubeCoord {
        return this.add(hex, this.direction(direction));
    }

    neighbors(hex: CubeCoord): CubeCoord[] {
        return [0, 1, 2, 3, 4, 5].map(i => this.neighbor(hex, i));
    }

    pixelToHex(point: PixelCoord): CubeCoord {
        // Convert from pixels to hex coordinates
        const size = this.size;
        const q = ((Math.sqrt(3)/3 * point.x) - (1/3 * point.y)) / size;
        const r = (2/3 * point.y) / size;
        return this.round({ q, r, s: -q - r });
    }

    hexToPixel(hex: CubeCoord): PixelCoord {
        // Convert from hex coordinates to pixels
        const size = this.size;
        const x = size * (Math.sqrt(3) * hex.q + Math.sqrt(3)/2 * hex.r);
        const y = size * (3/2 * hex.r);
        return { x, y };
    }

    round(hex: CubeCoord): CubeCoord {
        let q = Math.round(hex.q);
        let r = Math.round(hex.r);
        let s = Math.round(hex.s);

        const q_diff = Math.abs(q - hex.q);
        const r_diff = Math.abs(r - hex.r);
        const s_diff = Math.abs(s - hex.s);

        if (q_diff > r_diff && q_diff > s_diff) {
            q = -r - s;
        } else if (r_diff > s_diff) {
            r = -q - s;
        } else {
            s = -q - r;
        }

        return { q, r, s };
    }

    distance(a: CubeCoord, b: CubeCoord): number {
        return Math.max(Math.abs(a.q - b.q), Math.abs(a.r - b.r), Math.abs(a.s - b.s));
    }

    hexWidth(): number {
        return this.size * 2;
    }

    hexHeight(): number {
        return Math.sqrt(3) * this.size;
    }
}
