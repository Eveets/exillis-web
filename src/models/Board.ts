import { Unit } from './Unit';
import { UnitType } from './UnitType';
import { HexGrid, CubeCoord, OffsetCoord } from './HexGrid';

export enum ZoneType {
  Normal = 'normal',
  Water = 'water',
  Forest = 'forest',
  HighGround = 'highGround'
}

export class Zone {
  private occupyingUnit: Unit | null = null;
  public readonly board: Board;

  constructor(
    public readonly position: CubeCoord,
    public readonly type: ZoneType = ZoneType.Normal,
    board: Board
  ) {
    this.board = board;
  }

  public isOccupied(): boolean {
    return this.occupyingUnit !== null;
  }

  public setOccupyingUnit(unit: Unit | null): void {
    this.occupyingUnit = unit;
  }

  public getOccupyingUnit(): Unit | null {
    return this.occupyingUnit;
  }
}

export class Board {
  private zones: Map<string, Zone>;
  private units: Map<string, Unit>;
  private hexGrid: HexGrid;
  private radius: number;

  constructor(radius: number, hexSize: number) {
    this.radius = radius;
    this.zones = new Map();
    this.units = new Map();
    this.hexGrid = new HexGrid(hexSize);
  
    for (let q = -radius; q <= radius; q++) {
      const r1 = Math.max(-radius, -q - radius);
      const r2 = Math.min(radius, -q + radius);
      for (let r = r1; r <= r2; r++) {
        const cubeCoord: CubeCoord = { q, r, s: -q - r };
        this.zones.set(this.positionToKey(cubeCoord), new Zone(cubeCoord, ZoneType.Normal, this));
      }
    }
  }

  private positionToKey(position: CubeCoord): string {
    return `${position.q},${position.r},${position.s}`;
  }

  private isWithinBoard(position: CubeCoord): boolean {
    const maxDistance = Math.max(
      Math.abs(position.q),
      Math.abs(position.r),
      Math.abs(position.s)
    );
    return maxDistance <= this.radius;
  }

  public getZone(position: CubeCoord): Zone | null {
    if (!this.isWithinBoard(position)) {
      return null;
    }
    const key = this.positionToKey(position);
    return this.zones.get(key) || null;
  }

  public setZoneType(position: CubeCoord, type: ZoneType): void {
    const key = this.positionToKey(position);
    const zone = this.zones.get(key);
    if (zone) {
      const newZone = new Zone(position, type, this);
      newZone.setOccupyingUnit(zone.getOccupyingUnit());
      this.zones.set(key, newZone);
    }
  }

  public addUnit(id: string, unit: Unit): void {
    this.units.set(id, unit);
    const zone = this.getZone(unit.getPosition());
    if (zone) {
      zone.setOccupyingUnit(unit);
    }
  }

  public getUnit(id: string): Unit | undefined {
    return this.units.get(id);
  }

  public moveUnit(id: string, newPosition: CubeCoord): boolean {
    const unit = this.units.get(id);
    const newZone = this.getZone(newPosition);
    if (unit && newZone) {
      const oldZone = this.getZone(unit.getPosition());
      if (oldZone && !newZone.isOccupied()) {
        oldZone.setOccupyingUnit(null);
        newZone.setOccupyingUnit(unit);
        unit.move(newPosition);
        return true;
      }
    }
    return false;
  }

  public updateUnitPosition(oldPosition: CubeCoord, newPosition: CubeCoord, unit: Unit): boolean {
    const oldZone = this.getZone(oldPosition);
    const newZone = this.getZone(newPosition);
    
    if (oldZone && newZone && !newZone.isOccupied()) {
      oldZone.setOccupyingUnit(null);
      newZone.setOccupyingUnit(unit);
      return true;
    }
    return false;
  }

  public removeUnit(id: string): void {
    const unit = this.units.get(id);
    if (unit) {
      const zone = this.getZone(unit.getPosition());
      if (zone) {
        zone.setOccupyingUnit(null);
      }
      this.units.delete(id);
    }
  }

  public getUnitsInRange(position: CubeCoord, range: number): Unit[] {
    return Array.from(this.units.values()).filter(unit => {
      const unitPos = unit.getPosition();
      const distance = this.hexGrid.distance(position, unitPos);
      return distance <= range;
    });
  }

  public getUnitsOfType(unitType: UnitType): Unit[] {
    return Array.from(this.units.values()).filter(unit => unit.getUnitType() === unitType);
  }

  public getAllZones(): Zone[] {
    return Array.from(this.zones.values());
  }

  public getAllUnits(): Map<string, Unit> {
    return new Map(this.units);
  }

  public getNeighbors(position: CubeCoord): Zone[] {
    return this.hexGrid.neighbors(position)
      .map(pos => this.getZone(pos))
      .filter((zone): zone is Zone => zone !== null);
  }

  public getHexGrid(): HexGrid {
    return this.hexGrid;
  }
}
