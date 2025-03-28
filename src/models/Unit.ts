import { UnitType, UnitMoraleCategory } from './UnitType';
import { Zone } from './Board';
import { PowerManager } from '../systems/PowerManager';
import { CubeCoord } from './HexGrid';

export class Unit {
  private unitType: UnitType;
  private position: CubeCoord;
  private currentFatigue: number;
  private currentHp: number;
  private currentVeil: number;
  private currentMorale: number;

  constructor(unitType: UnitType, position: CubeCoord) {
    this.unitType = unitType;
    this.position = position;
    this.currentFatigue = 0;
    this.currentHp = unitType.maxHP;
    this.currentVeil = unitType.maxVeil;
    this.currentMorale = unitType.maxMorale;
  }

  public getUnitType(): UnitType {
    return this.unitType;
  }

  public getPosition(): CubeCoord {
    return { ...this.position };
  }

  public getCurrentFatigue(): number {
    return this.currentFatigue;
  }

  public getCurrentHp(): number {
    return this.currentHp;
  }

  public getCurrentVeil(): number {
    return this.currentVeil;
  }

  public getCurrentMorale(): number {
    return this.currentMorale;
  }

  public move(newPosition: CubeCoord): void {
    this.position = { ...newPosition };
    this.increaseFatigue(1);
  }

  public takeDamage(amount: number): void {
    this.currentHp = Math.max(0, this.currentHp - amount);
    if (this.currentHp === 0) {
      this.currentMorale = 0;
    }
  }

  public increaseFatigue(amount: number): void {
    this.currentFatigue = Math.min(this.unitType.maxFatigue, this.currentFatigue + amount);
  }

  public rest(): void {
    this.currentFatigue = Math.max(0, this.currentFatigue - 2);
  }

  public updateMorale(change: number): void {
    this.currentMorale = Math.max(0, Math.min(this.unitType.maxMorale, this.currentMorale + change));
  }

  public calculateAttackValue(): number {
    let value = this.unitType.attack;
    
    // Apply morale modifiers
    if (this.currentMorale >= this.unitType.maxMorale * 0.8) {
      value *= 1.1; // Confident
    } else if (this.currentMorale <= this.unitType.maxMorale * 0.2) {
      value *= 0.8; // Shaky
    }

    // Apply fatigue penalty
    value -= Math.floor(this.currentFatigue / 2);

    return Math.max(0, value);
  }

  public getMoraleCategory(): UnitMoraleCategory {
    const moralePercentage = this.currentMorale / this.unitType.maxMorale;
    if (moralePercentage >= 0.8) return UnitMoraleCategory.Exasperation;
    if (moralePercentage <= 0.2) return UnitMoraleCategory.Enraged;
    return UnitMoraleCategory.Standard;
  }

  public getAvailablePowers(): string[] {
    return this.unitType.powers;
  }

  public usePower(powerName: string, target: Unit | Zone): void {
    const power = PowerManager.getPower(powerName);
    if (power && PowerManager.isValidTarget(target, this, powerName)) {
      power.execute(this, target);
    }
  }

  public useVeil(amount: number): boolean {
    if (this.currentVeil >= amount) {
      this.currentVeil -= amount;
      return true;
    }
    return false;
  }

  public regenerateVeil(): void {
    this.currentVeil = Math.min(this.unitType.maxVeil, this.currentVeil + this.unitType.veilRate);
  }
}
