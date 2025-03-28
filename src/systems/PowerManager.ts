import { Unit } from '../models/Unit';
import { Zone, Board } from '../models/Board';
import { CubeCoord, HexGrid } from '../models/HexGrid';

export enum TargetType {
  EnemyUnit = 'enemyUnit',
  FriendlyUnit = 'friendlyUnit',
  PassableZone = 'passableZone',
  EmptyZone = 'emptyZone',
  Any = 'any'
}

export interface PowerDefinition {
  name: string;
  minRange: number;
  maxRange: number;
  targetType: TargetType;
  fatigueIncrease: number;
  veilCost: number;
  execute: (caster: Unit, target: Unit | Zone) => void;
}

export class PowerManager {
  private static powers: Map<string, PowerDefinition> = new Map([
    ['Move', {
      name: 'Move',
      minRange: 1,
      maxRange: 1,
      targetType: TargetType.PassableZone,
      fatigueIncrease: 1,
      veilCost: 0,
      execute: (caster: Unit, target: Unit | Zone) => {
        if (target instanceof Zone) {
          const oldPosition = caster.getPosition();
          const newPosition = target.position;
          
          // Update the zone occupancy
          if (target.board.updateUnitPosition(oldPosition, newPosition, caster)) {
            // Update the unit's internal position
            caster.move(newPosition);
          }
        }
      }
    }],
    ['Fight', {
      name: 'Fight',
      minRange: 1,
      maxRange: 1,
      targetType: TargetType.EnemyUnit,
      fatigueIncrease: 2,
      veilCost: 0,
      execute: (caster: Unit, target: Unit | Zone) => {
        if (target instanceof Unit) {
          const damage = caster.calculateAttackValue();
          target.takeDamage(damage);
          
          // Apply morale effects
          if (damage > 0) {
            target.updateMorale(-1);
            caster.updateMorale(1);
          }

          // Apply fatigue
          caster.increaseFatigue(2);
        }
      }
    }],
    ['Wait', {
      name: 'Wait',
      minRange: 0,
      maxRange: 0,
      targetType: TargetType.Any,
      fatigueIncrease: 0,
      veilCost: 0,
      execute: (caster: Unit, target: Unit | Zone) => {
        // Do nothing, just end turn
      }
    }],
    ['Hellfire', {
      name: 'Hellfire',
      minRange: 2,
      maxRange: 4,
      targetType: TargetType.EnemyUnit,
      fatigueIncrease: 3,
      veilCost: 2,
      execute: (caster: Unit, target: Unit | Zone) => {
        if (target instanceof Unit && caster.useVeil(2)) {
          const magicDamage = caster.getUnitType().magic * 1.5;
          target.takeDamage(Math.floor(magicDamage));
          target.updateMorale(-2); // Extra morale damage from magic attack
          caster.increaseFatigue(3);
        }
      }
    }],
    ['Cast Spell', {
      name: 'Cast Spell',
      minRange: 1,
      maxRange: 3,
      targetType: TargetType.EnemyUnit,
      fatigueIncrease: 2,
      veilCost: 1,
      execute: (caster: Unit, target: Unit | Zone) => {
        if (target instanceof Unit && caster.useVeil(1)) {
          const magicDamage = caster.getUnitType().magic;
          target.takeDamage(Math.floor(magicDamage));
          target.updateMorale(-1);
          caster.increaseFatigue(2);
        }
      }
    }],
    ['Shoot', {
      name: 'Shoot',
      minRange: 2,
      maxRange: 5,
      targetType: TargetType.EnemyUnit,
      fatigueIncrease: 2,
      veilCost: 0,
      execute: (caster: Unit, target: Unit | Zone) => {
        if (target instanceof Unit) {
          const rangedDamage = caster.getUnitType().rangedWeaponDamage;
          target.takeDamage(Math.floor(rangedDamage));
          caster.increaseFatigue(2);
        }
      }
    }]
  ]);

  public static getPower(name: string): PowerDefinition | undefined {
    return this.powers.get(name);
  }

  public static isValidTarget(target: Unit | Zone, caster: Unit, powerName: string): boolean {
    const power = this.getPower(powerName);
    if (!power) return false;

    // Check if target is within range
    const distance = this.getDistance(caster.getPosition(), target instanceof Unit ? target.getPosition() : target.position);
    
    if (powerName === 'Move') {
      // For move power, check if target is a valid zone
      if (!(target instanceof Zone)) return false;
      if (!this.isPassableZone(target, caster)) return false;
      if (!this.isEmptyZone(target)) return false;

      // Check if target is within movement range
      if (distance > caster.getUnitType().movement) return false;
    } else {
      // For other powers, use the power's range
      if (distance < power.minRange || distance > power.maxRange) return false;
    }

    // Check if caster has enough veil for the power
    if (caster.getCurrentVeil() < power.veilCost) return false;

    // Check target type
    switch (power.targetType) {
      case TargetType.EnemyUnit:
        return target instanceof Unit && target !== caster;
      case TargetType.FriendlyUnit:
        return target instanceof Unit && target === caster;
      case TargetType.PassableZone:
        return target instanceof Zone && this.isPassableZone(target, caster);
      case TargetType.EmptyZone:
        return target instanceof Zone && this.isEmptyZone(target);
      case TargetType.Any:
        return true;
      default:
        return false;
    }
  }

  private static isPassableZone(zone: Zone, unit: Unit): boolean {
    if (zone.type === 'water' && !unit.getUnitType().canFly) {
      return false;
    }
    // Add more conditions here if needed (e.g., for other terrain types)
    return true;
  }

  private static isEmptyZone(zone: Zone): boolean {
    return !zone.isOccupied();
  }

  private static hexGrid: HexGrid = new HexGrid(60);

  private static getDistance(a: CubeCoord, b: CubeCoord): number {
    return this.hexGrid.distance(a, b);
  }
}
