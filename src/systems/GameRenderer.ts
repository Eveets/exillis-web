import { Game } from '../models/Game';
import { Unit } from '../models/Unit';
import { ZoneType, Zone, Board } from '../models/Board';
import { UnitMusterCategory } from '../models/UnitType';
import { PowerManager, PowerDefinition } from '../systems/PowerManager';
import { CubeCoord, HexGrid, PixelCoord } from '../models/HexGrid';
import { PathFinder } from './PathFinder';

export class GameRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private game: Game;
  private board: Board;
  private hexSize: number;
  private selectedUnit: Unit | null = null;
  private selectedPower: PowerDefinition | null = null;
  private showCoordinates: boolean = false;
  private offsetX: number = 0;
  private offsetY: number = 0;
  private validMoveTargets: Set<string> = new Set();
  private pathFinder: PathFinder;

  constructor(canvas: HTMLCanvasElement, game: Game) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.game = game;
    this.board = game.getBoard();
    this.hexSize = this.calculateHexSize();
    this.pathFinder = new PathFinder(this.board);

    this.resizeCanvas();
    window.addEventListener('resize', () => {
      this.hexSize = this.calculateHexSize();
      this.resizeCanvas();
      this.render();
    });
  }

  public screenToHex(screenX: number, screenY: number): CubeCoord {
    const board = this.game.getBoard();
    const hexGrid = board.getHexGrid();
    const zones = board.getAllZones();

    // Calculate grid bounds
    let minQ = Infinity, maxQ = -Infinity, minR = Infinity, maxR = -Infinity;
    zones.forEach(zone => {
      minQ = Math.min(minQ, zone.position.q);
      maxQ = Math.max(maxQ, zone.position.q);
      minR = Math.min(minR, zone.position.r);
      maxR = Math.max(maxR, zone.position.r);
    });

    // Convert screen coordinates to pixel coordinates relative to the grid origin
    const relativeX = screenX - this.offsetX;
    const relativeY = screenY - this.offsetY;

    // Convert to hex coordinates
    const hexCoord = hexGrid.pixelToHex({ x: relativeX, y: relativeY });

    // Adjust the coordinates back to the original grid position
    return {
      q: Math.round(hexCoord.q + minQ),
      r: Math.round(hexCoord.r + minR),
      s: Math.round(-(hexCoord.q + minQ) - (hexCoord.r + minR))
    };
  }

  public getCanvasOffset(): { x: number; y: number } {
    return { x: this.offsetX, y: this.offsetY };
  }

  public setShowCoordinates(show: boolean) {
    this.showCoordinates = show;
    this.render();
  }

  public setSelectedUnit(unit: Unit | null) {
    this.selectedUnit = unit;
    this.validMoveTargets.clear();
    
    if (unit) {
      // Calculate valid move targets when a unit is selected
      this.validMoveTargets = this.pathFinder.findReachableTiles(unit, unit.getUnitType().movement);
    }
    
    this.render();
  }

  public setSelectedPower(power: PowerDefinition | null) {
    this.selectedPower = power;
    this.render();
  }

  private calculateHexSize(): number {
    return 60; // Fixed larger hex size
  }

  private resizeCanvas(): void {
    const board = this.game.getBoard();
    const hexGrid = board.getHexGrid();
    const zones = board.getAllZones();
    let minQ = Infinity, maxQ = -Infinity, minR = Infinity, maxR = -Infinity;
    
    zones.forEach(zone => {
      minQ = Math.min(minQ, zone.position.q);
      maxQ = Math.max(maxQ, zone.position.q);
      minR = Math.min(minR, zone.position.r);
      maxR = Math.max(maxR, zone.position.r);
    });

    const gridWidth = (maxQ - minQ + 1) * hexGrid.hexWidth();
    const gridHeight = (maxR - minR + 1) * hexGrid.hexHeight();

    // Add padding for centering
    this.canvas.width = gridWidth + this.hexSize * 4;
    this.canvas.height = gridHeight + this.hexSize * 4;
  }

  public render(): void {
    const board = this.game.getBoard();
    const hexGrid = board.getHexGrid();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Calculate grid bounds
    const zones = board.getAllZones();
    let minQ = Infinity, maxQ = -Infinity, minR = Infinity, maxR = -Infinity;
    zones.forEach(zone => {
      minQ = Math.min(minQ, zone.position.q);
      maxQ = Math.max(maxQ, zone.position.q);
      minR = Math.min(minR, zone.position.r);
      maxR = Math.max(maxR, zone.position.r);
    });

    // Calculate centering offsets
    this.offsetX = (this.canvas.width - (maxQ - minQ + 1) * hexGrid.hexWidth()) / 2;
    this.offsetY = (this.canvas.height - (maxR - minR + 1) * hexGrid.hexHeight()) / 2;

    // Translate context to center the grid
    this.ctx.save();
    this.ctx.translate(this.offsetX, this.offsetY);

    // Render zones with adjusted positions
    zones.forEach(zone => {
      if (this.board.getZone(zone.position)) { // Only render zones that are within board boundaries
        const originalPos = zone.position;
        const adjustedPos = {
          q: originalPos.q - minQ,
          r: originalPos.r - minR,
          s: -originalPos.q + minQ - originalPos.r + minR
        };
        
        // Temporarily modify the context transform for this zone
        const pixelCoord = hexGrid.hexToPixel(adjustedPos);
        this.ctx.save();
        this.ctx.translate(pixelCoord.x, pixelCoord.y);
        this.renderZone(zone, this.isValidTarget(zone), hexGrid);
        this.ctx.restore();
      }
    });

    // Render all units with adjusted positions
    const allUnits = board.getAllUnits();
    allUnits.forEach((unit, id) => {
      const zone = this.board.getZone(unit.getPosition());
      if (zone) { // Only render units that are within board boundaries
        const originalPos = unit.getPosition();
        const adjustedPos = {
          q: originalPos.q - minQ,
          r: originalPos.r - minR,
          s: -originalPos.q + minQ - originalPos.r + minR
        };
        
        // Temporarily modify the context transform for this unit
        const pixelCoord = hexGrid.hexToPixel(adjustedPos);
        this.ctx.save();
        this.ctx.translate(pixelCoord.x, pixelCoord.y);
        this.renderUnit(unit, id, this.isValidTarget(unit), hexGrid);
        this.ctx.restore();
      }
    });

    this.ctx.restore();
  }

  private isValidTarget(target: Unit | Zone): boolean {
    if (this.selectedUnit && this.selectedPower) {
      return PowerManager.isValidTarget(target, this.selectedUnit, this.selectedPower.name);
    }
    return false;
  }

  private renderZone(zone: Zone, isValid: boolean, hexGrid: HexGrid): void {
    // Draw base zone
    this.ctx.fillStyle = this.getZoneColor(zone.type);
    this.renderHexagon(0, 0, this.hexSize);
    this.ctx.fill();

    // Draw highlight if valid target
    if (isValid) {
      this.ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
      this.renderHexagon(0, 0, this.hexSize);
      this.ctx.fill();
    }

    // Draw move target highlight
    if (this.selectedUnit && this.isValidMoveTarget(zone)) {
      this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
      this.renderHexagon(0, 0, this.hexSize);
      this.ctx.fill();
    }

    this.ctx.strokeStyle = '#000';
    this.ctx.stroke();

    // Draw coordinates if debug mode is enabled
    if (this.showCoordinates) {
      this.ctx.fillStyle = '#000';
      this.ctx.font = '10px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        `q:${zone.position.q}, r:${zone.position.r}`,
        0,
        0
      );
    }
  }

  private isValidMoveTarget(zone: Zone): boolean {
    if (!this.selectedUnit) return false;
    const posKey = `${zone.position.q},${zone.position.r},${zone.position.s}`;
    return this.validMoveTargets.has(posKey);
  }

  private renderUnit(unit: Unit, id: string, isValid: boolean, hexGrid: HexGrid): void {
    const unitType = unit.getUnitType();

    // Draw unit shape based on category
    this.ctx.beginPath();
    switch (unitType.musterCategory) {
      case UnitMusterCategory.Melee:
        this.ctx.arc(0, 0, this.hexSize / 3, 0, Math.PI * 2);
        break;
      case UnitMusterCategory.Shooting:
        this.drawSquare(0, 0, this.hexSize / 2);
        break;
      case UnitMusterCategory.Magic:
        this.drawTriangle(0, 0, this.hexSize / 2);
        break;
      default:
        this.ctx.arc(0, 0, this.hexSize / 3, 0, Math.PI * 2);
    }

    // Fill with unit color or highlight if valid target
    this.ctx.fillStyle = isValid ? 'rgba(255, 255, 0, 0.5)' : this.getUnitColor(id);
    this.ctx.fill();

    // Highlight selected unit
    if (unit === this.selectedUnit) {
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
      this.ctx.lineWidth = 1;
    }

    this.ctx.strokeStyle = '#000';
    this.ctx.stroke();

    // Render unit info
    this.ctx.fillStyle = '#000';
    this.ctx.textAlign = 'center';
    
    // Unit name
    this.ctx.font = 'bold 12px Arial';
    this.ctx.fillText(unitType.typeName, 0, -20);

    // Stats
    this.ctx.font = '10px Arial';
    this.ctx.fillText(
      `HP: ${unit.getCurrentHp()}/${unitType.maxHP} FT: ${unit.getCurrentFatigue()}/${unitType.maxFatigue}`,
      0,
      -8
    );

    this.ctx.fillText(
      `ATK: ${unitType.attack} DEF: ${unitType.block}`,
      0,
      16
    );

    if (unitType.musterCategory === UnitMusterCategory.Magic) {
      // Magic stats
      this.ctx.fillText(
        `MAG: ${unitType.magic} VEIL: ${unit.getCurrentVeil()}/${unitType.maxVeil}`,
        0,
        28
      );

      // Magic aura (outer circle)
      this.ctx.beginPath();
      this.ctx.arc(0, 0, this.hexSize / 2, 0, Math.PI * 2);
      this.ctx.strokeStyle = 'rgba(255, 0, 255, 0.3)';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      this.ctx.lineWidth = 1;

      // Veil indicator (inner circle)
      const veilPercentage = unit.getCurrentVeil() / unitType.maxVeil;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, this.hexSize / 3, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(147, 87, 255, ${veilPercentage * 0.5})`;
      this.ctx.fill();
    }

    // Draw movement range indicator
    this.ctx.beginPath();
    this.ctx.arc(0, 0, (this.hexSize / 3) + 5, 0, Math.PI * 2);
    this.ctx.strokeStyle = unitType.canFly ? '#87CEEB' : '#8B4513';
    this.ctx.stroke();
  }

  private renderHexagon(x: number, y: number, size: number): void {
    const angles = Array.from({ length: 6 }, (_, i) => (i * Math.PI / 3) + Math.PI / 6);
    const vertices = angles.map(angle => ({
      x: x + size * Math.cos(angle),
      y: y + size * Math.sin(angle)
    }));

    this.ctx.beginPath();
    vertices.forEach((vertex, i) => {
      if (i === 0) {
        this.ctx.moveTo(vertex.x, vertex.y);
      } else {
        this.ctx.lineTo(vertex.x, vertex.y);
      }
    });
    this.ctx.closePath();
  }

  private drawSquare(x: number, y: number, size: number): void {
    const halfSize = size / 2;
    this.ctx.rect(x - halfSize, y - halfSize, size, size);
  }

  private drawTriangle(x: number, y: number, size: number): void {
    const height = size * Math.sqrt(3) / 2;
    this.ctx.moveTo(x, y - height / 2);
    this.ctx.lineTo(x - size / 2, y + height / 2);
    this.ctx.lineTo(x + size / 2, y + height / 2);
    this.ctx.closePath();
  }

  private getZoneColor(type: ZoneType): string {
    switch (type) {
      case ZoneType.Normal:
        return '#90EE90'; // Light green
      case ZoneType.Water:
        return '#87CEFA'; // Light blue
      case ZoneType.Forest:
        return '#228B22'; // Forest green
      case ZoneType.HighGround:
        return '#DEB887'; // Burlywood
      default:
        return '#FFF';
    }
  }

  private getUnitColor(id: string): string {
    const hash = id.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return `hsl(${hash % 360}, 70%, 50%)`;
  }

  public getHexSize(): number {
    return this.hexSize;
  }
}
