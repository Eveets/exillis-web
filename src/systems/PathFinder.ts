import { CubeCoord } from '../models/HexGrid';
import { Board, Zone } from '../models/Board';
import { Unit } from '../models/Unit';

interface QueueItem {
    position: CubeCoord;
    cost: number;
    parent: CubeCoord | null;
}

export class PathFinder {
    private board: Board;

    constructor(board: Board) {
        this.board = board;
    }

    public findReachableTiles(unit: Unit, maxDistance: number): Set<string> {
        const start = unit.getPosition();
        const frontier: QueueItem[] = [{ position: start, cost: 0, parent: null }];
        const visited = new Set<string>();
        const reachable = new Set<string>();
        const costSoFar = new Map<string, number>();

        const posToString = (pos: CubeCoord) => `${pos.q},${pos.r},${pos.s}`;
        costSoFar.set(posToString(start), 0);

        while (frontier.length > 0) {
            const current = frontier.shift()!;
            const currentKey = posToString(current.position);

            if (visited.has(currentKey)) continue;
            visited.add(currentKey);

            if (current.cost <= maxDistance) {
                reachable.add(currentKey);

                // Get neighbors
                const neighbors = this.board.getNeighbors(current.position);
                for (const neighbor of neighbors) {
                    const neighborKey = posToString(neighbor.position);
                    if (visited.has(neighborKey)) continue;

                    // Check if the tile is passable
                    if (!this.isPassable(neighbor, unit)) continue;

                    const newCost = current.cost + this.getMovementCost(neighbor, unit);
                    if (!costSoFar.has(neighborKey) || newCost < costSoFar.get(neighborKey)!) {
                        costSoFar.set(neighborKey, newCost);
                        frontier.push({
                            position: neighbor.position,
                            cost: newCost,
                            parent: current.position
                        });
                    }
                }
            }
        }

        return reachable;
    }

    public findPath(start: CubeCoord, end: CubeCoord, unit: Unit): CubeCoord[] | null {
        const frontier: QueueItem[] = [{ position: start, cost: 0, parent: null }];
        const cameFrom = new Map<string, CubeCoord>();
        const costSoFar = new Map<string, number>();

        const posToString = (pos: CubeCoord) => `${pos.q},${pos.r},${pos.s}`;
        costSoFar.set(posToString(start), 0);

        while (frontier.length > 0) {
            // Sort frontier by cost
            frontier.sort((a, b) => a.cost - b.cost);
            const current = frontier.shift()!;

            if (this.isSamePosition(current.position, end)) {
                return this.reconstructPath(start, end, cameFrom);
            }

            const neighbors = this.board.getNeighbors(current.position);
            for (const neighbor of neighbors) {
                if (!this.isPassable(neighbor, unit)) continue;

                const newCost = costSoFar.get(posToString(current.position))! + 
                    this.getMovementCost(neighbor, unit);
                const neighborKey = posToString(neighbor.position);

                if (!costSoFar.has(neighborKey) || newCost < costSoFar.get(neighborKey)!) {
                    costSoFar.set(neighborKey, newCost);
                    const priority = newCost + this.heuristic(neighbor.position, end);
                    frontier.push({
                        position: neighbor.position,
                        cost: priority,
                        parent: current.position
                    });
                    cameFrom.set(neighborKey, current.position);
                }
            }
        }

        return null; // No path found
    }

    private isPassable(zone: Zone, unit: Unit): boolean {
        // A tile is passable if:
        // 1. It's not occupied by another unit
        // 2. The unit can traverse the terrain type
        const occupyingUnit = zone.getOccupyingUnit();
        if (occupyingUnit && occupyingUnit !== unit) {
            return false;
        }

        const unitType = unit.getUnitType();
        if (!unitType.canFly) {
            // Add terrain-specific movement restrictions here
            // For example, ground units can't move through water
            if (zone.type === 'water') {
                return false;
            }
        }

        return true;
    }

    private getMovementCost(zone: Zone, unit: Unit): number {
        // Base movement cost is 1
        let cost = 1;

        // Add terrain-specific movement costs
        const unitType = unit.getUnitType();
        if (!unitType.canFly) {
            switch (zone.type) {
                case 'forest':
                    cost = 2; // Forests are harder to traverse
                    break;
                case 'highGround':
                    cost = 1.5; // Moving uphill costs more
                    break;
            }
        }

        return cost;
    }

    private heuristic(a: CubeCoord, b: CubeCoord): number {
        // Use hex distance as heuristic
        return this.board.getHexGrid().distance(a, b);
    }

    private isSamePosition(a: CubeCoord, b: CubeCoord): boolean {
        return a.q === b.q && a.r === b.r && a.s === b.s;
    }

    private reconstructPath(start: CubeCoord, end: CubeCoord, cameFrom: Map<string, CubeCoord>): CubeCoord[] {
        const path: CubeCoord[] = [end];
        let current = end;
        const posToString = (pos: CubeCoord) => `${pos.q},${pos.r},${pos.s}`;

        while (!this.isSamePosition(current, start)) {
            current = cameFrom.get(posToString(current))!;
            path.unshift(current);
        }

        return path;
    }
}
