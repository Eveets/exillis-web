import { Board } from './Board';
import { Unit } from './Unit';
import { UnitType } from './UnitType';
import { CubeCoord, HexGrid } from './HexGrid';

export interface Player {
  id: string;
  name: string;
  units: Map<string, Unit>;
}

export class Game {
  private board: Board;
  private players: Player[];
  private currentPlayerIndex: number;
  private turnNumber: number;
  private hexGrid: HexGrid;

  constructor(radius: number, hexSize: number, players: Player[]) {
    this.hexGrid = new HexGrid(hexSize);
    this.board = new Board(radius, hexSize);
    this.players = players;
    this.currentPlayerIndex = 0;
    this.turnNumber = 1;

    // Initialize units on the board
    this.players.forEach(player => {
      player.units.forEach((unit, id) => {
        this.board.addUnit(id, unit);
      });
    });
  }

  public getCurrentPlayer(): Player {
    return this.players[this.currentPlayerIndex];
  }

  public getBoard(): Board {
    return this.board;
  }

  public getTurnNumber(): number {
    return this.turnNumber;
  }

  public nextTurn(): void {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    if (this.currentPlayerIndex === 0) {
      this.turnNumber++;
      // Apply end of turn effects
      this.players.forEach(player => {
        player.units.forEach(unit => {
          unit.rest(); // Units recover from fatigue at end of round
          unit.regenerateVeil(); // Magic units regenerate veil
        });
      });
    }
    this.checkForDeadUnits();
  }

  public createUnit(playerId: string, unitType: UnitType, position: CubeCoord): string {
    const player = this.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    const zone = this.board.getZone(position);
    if (!zone) {
      throw new Error('Invalid position: outside board boundaries');
    }

    const unit = new Unit(unitType, position);
    const unitId = `${playerId}_unit_${player.units.size}`;
    player.units.set(unitId, unit);
    this.board.addUnit(unitId, unit);

    return unitId;
  }

  public moveUnit(unitId: string, newPosition: CubeCoord): boolean {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer.units.has(unitId)) {
      return false;
    }

    const unit = currentPlayer.units.get(unitId);
    if (!unit) return false;

    const newZone = this.board.getZone(newPosition);
    if (!newZone) return false;

    const oldPosition = unit.getPosition();
    const distance = this.hexGrid.distance(oldPosition, newPosition);

    // Check if the move is valid (e.g., within movement range)
    if (distance <= unit.getUnitType().movement) {
      return this.board.moveUnit(unitId, newPosition);
    }

    return false;
  }

  public isGameOver(): boolean {
    // Game is over if any player has no units left
    return this.players.some(player => player.units.size === 0);
  }

  public getWinner(): Player | null {
    if (!this.isGameOver()) {
      return null;
    }

    // Find the player with remaining units
    return this.players.find(player => player.units.size > 0) || null;
  }

  public getUnitAtPosition(position: CubeCoord): Unit | null {
    const zone = this.board.getZone(position);
    if (!zone) return null;
    return zone.getOccupyingUnit();
  }

  public getUnitOwner(unit: Unit): string | null {
    for (const player of this.players) {
      if (Array.from(player.units.values()).includes(unit)) {
        return player.id;
      }
    }
    return null;
  }

  private checkForDeadUnits(): void {
    this.players.forEach(player => {
      const deadUnits: string[] = [];
      player.units.forEach((unit, unitId) => {
        if (unit.getCurrentHp() <= 0) {
          deadUnits.push(unitId);
        }
      });

      deadUnits.forEach(unitId => {
        const unit = player.units.get(unitId);
        if (unit) {
          this.board.removeUnit(unitId);
          player.units.delete(unitId);
        }
      });
    });
  }

  public static createNewGame(radius: number, hexSize: number, playerNames: string[]): Game {
    const players: Player[] = playerNames.map((name, index) => ({
      id: `player_${index}`,
      name,
      units: new Map()
    }));

    return new Game(radius, hexSize, players);
  }
}
