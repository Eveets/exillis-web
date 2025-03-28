import { UnitType, UnitMusterCategory, UnitMoraleCategory } from './UnitType';

export class UnitFactory {
  public static createBillmen(level: number): UnitType {
    const unit = new UnitType(level);
    
    // Basic info
    unit.typeName = "Billmen";
    unit.category = UnitMusterCategory.Melee;
    unit.canFly = false;

    // Characteristics
    unit.maxHP = 5 + level;
    unit.maxFatigue = 5;
    unit.maxVeil = 0;
    unit.maxMorale = 6;
    unit.maxMiniatureCount = 1;

    // Rates
    unit.toughness = 1.0;
    unit.fatigueRate = 1.0;
    unit.veilRate = 0;
    unit.moraleRate = 1.0;

    // Combat stats
    unit.attack = 4 + Math.floor(level / 2);
    unit.initiative = 1;
    unit.bulk = 2;
    unit.movement = 1;

    // Weapons
    unit.retaliate = 1.0;
    unit.primaryWeaponDamage = 3 + level;
    unit.primaryArmourPiercing = 1;
    unit.secondaryWeaponDamage = 0;
    unit.secondaryArmourPiercing = 0;
    unit.rangedWeaponDamage = 0;
    unit.rangedArmourPiercing = 0;

    // Muster
    unit.pointCost = 100 + (level * 20);
    unit.affinities = {};
    unit.musterCategory = UnitMusterCategory.Melee;

    // Offence
    unit.strength = 3 + level;
    unit.shooting = 0;
    unit.magic = 0;

    // Charge
    unit.chargePriority = 2;
    unit.reactionPriority = 1;

    // Accuracy
    unit.meleeAccuracy = 70 + (level * 5);
    unit.rangedAccuracy = 0;
    unit.magicAccuracy = 0;

    // Morale
    unit.moraleType = UnitMoraleCategory.Standard;
    unit.intimidation = 1.0;

    // Defence
    unit.block = 2;
    unit.evade = 1;
    unit.deflect = 0;

    // Protection
    unit.armour = 2;
    unit.shield = 1;
    unit.missileBlock = 0.2;

    // Resistance
    unit.resistLightning = 0;
    unit.resistFire = 0;
    unit.resistIce = 0;
    unit.resistEarth = 0;
    unit.resistWater = 0;
    unit.resistWind = 0;
    unit.resistLight = 0;
    unit.resistDark = 0;

    // Abilities
    unit.talents = ["Pike Formation"];
    unit.powers = ["Move", "Fight", "Wait"];

    return unit;
  }

  public static createLucifer(level: number): UnitType {
    const unit = new UnitType(level);
    
    // Basic info
    unit.typeName = "Lucifer";
    unit.category = UnitMusterCategory.Magic;
    unit.canFly = true;

    // Characteristics
    unit.maxHP = 8 + level * 2;
    unit.maxFatigue = 7;
    unit.maxVeil = 5;
    unit.maxMorale = 8;
    unit.maxMiniatureCount = 1;

    // Rates
    unit.toughness = 1.2;
    unit.fatigueRate = 0.8;
    unit.veilRate = 1.5;
    unit.moraleRate = 1.2;

    // Combat stats
    unit.attack = 6 + Math.floor(level / 2);
    unit.initiative = 3;
    unit.bulk = 3;
    unit.movement = 2;

    // Weapons
    unit.retaliate = 1.2;
    unit.primaryWeaponDamage = 5 + level;
    unit.primaryArmourPiercing = 2;
    unit.secondaryWeaponDamage = 3 + Math.floor(level / 2);
    unit.secondaryArmourPiercing = 1;
    unit.rangedWeaponDamage = 4 + level;
    unit.rangedArmourPiercing = 2;

    // Muster
    unit.pointCost = 200 + (level * 30);
    unit.affinities = { fire: 2, dark: 1 };
    unit.musterCategory = UnitMusterCategory.Magic;

    // Offence
    unit.strength = 4 + level;
    unit.shooting = 3 + Math.floor(level / 2);
    unit.magic = 5 + level;

    // Charge
    unit.chargePriority = 3;
    unit.reactionPriority = 2;

    // Accuracy
    unit.meleeAccuracy = 75 + (level * 5);
    unit.rangedAccuracy = 70 + (level * 5);
    unit.magicAccuracy = 85 + (level * 5);

    // Morale
    unit.moraleType = UnitMoraleCategory.Exasperation;
    unit.intimidation = 1.5;

    // Defence
    unit.block = 3;
    unit.evade = 2;
    unit.deflect = 1;

    // Protection
    unit.armour = 3;
    unit.shield = 0;
    unit.missileBlock = 0.3;

    // Resistance
    unit.resistLightning = 1;
    unit.resistFire = 3;
    unit.resistIce = 0;
    unit.resistEarth = 0;
    unit.resistWater = 0;
    unit.resistWind = 1;
    unit.resistLight = -1;
    unit.resistDark = 2;

    // Abilities
    unit.talents = ["Hellfire", "Dark Pact"];
    unit.powers = ["Move", "Fight", "Shoot", "Cast Spell", "Wait"];

    return unit;
  }
}
