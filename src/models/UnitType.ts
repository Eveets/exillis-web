export enum UnitMusterCategory {
  None = 0,
  Melee,
  Shooting,
  Magic,
  Fast,
  Hero,
  Elite,
  Monster,
  Artillery,
  Special
}

export enum UnitMoraleCategory {
  Standard = 0,
  Exasperation,
  Enraged
}

export class UnitType {
  level: number;
  typeName: string;
  category: number;
  canFly: boolean;

  // Characteristics
  maxHP: number;
  maxFatigue: number;
  maxVeil: number;
  maxMorale: number;
  maxMiniatureCount: number;

  toughness: number;
  fatigueRate: number;
  veilRate: number;
  moraleRate: number;

  aggressiveness: number;

  attack: number;
  initiative: number;
  bulk: number;
  movement: number;

  // Weapons
  retaliate: number;
  primaryWeaponDamage: number;
  primaryArmourPiercing: number;
  secondaryWeaponDamage: number;
  secondaryArmourPiercing: number;
  rangedWeaponDamage: number;
  rangedArmourPiercing: number;

  // Muster
  pointCost: number;
  affinities: Record<string, number>;
  musterCategory: UnitMusterCategory;

  // Offence
  strength: number;
  shooting: number;
  magic: number;

  // Charge
  chargePriority: number;
  reactionPriority: number;

  // Accuracy
  meleeAccuracy: number;
  rangedAccuracy: number;
  magicAccuracy: number;

  // Morale
  moraleType: UnitMoraleCategory;
  intimidation: number;

  // Defence
  block: number;
  evade: number;
  deflect: number;

  // Protection
  armour: number;
  shield: number;
  missileBlock: number;

  // Resistance
  resistLightning: number;
  resistFire: number;
  resistIce: number;
  resistEarth: number;
  resistWater: number;
  resistWind: number;
  resistLight: number;
  resistDark: number;

  // Talents and Abilities
  talents: string[];
  powers: string[];

  constructor(level: number) {
    this.level = level;
    this.typeName = "";
    this.category = 0;
    this.canFly = false;

    // Initialize all other properties with default values
    this.maxHP = 0;
    this.maxFatigue = 0;
    this.maxVeil = 0;
    this.maxMorale = 0;
    this.maxMiniatureCount = 0;

    this.toughness = 0;
    this.fatigueRate = 0;
    this.veilRate = 0;
    this.moraleRate = 0;

    this.aggressiveness = 0;

    this.attack = 0;
    this.initiative = 0;
    this.bulk = 0;
    this.movement = 0;

    this.retaliate = 0;
    this.primaryWeaponDamage = 0;
    this.primaryArmourPiercing = 0;
    this.secondaryWeaponDamage = 0;
    this.secondaryArmourPiercing = 0;
    this.rangedWeaponDamage = 0;
    this.rangedArmourPiercing = 0;

    this.pointCost = 0;
    this.affinities = {};
    this.musterCategory = UnitMusterCategory.None;

    this.strength = 0;
    this.shooting = 0;
    this.magic = 0;

    this.chargePriority = 0;
    this.reactionPriority = 0;

    this.meleeAccuracy = 0;
    this.rangedAccuracy = 0;
    this.magicAccuracy = 0;

    this.moraleType = UnitMoraleCategory.Standard;
    this.intimidation = 0;

    this.block = 0;
    this.evade = 0;
    this.deflect = 0;

    this.armour = 0;
    this.shield = 0;
    this.missileBlock = 0;

    this.resistLightning = 0;
    this.resistFire = 0;
    this.resistIce = 0;
    this.resistEarth = 0;
    this.resistWater = 0;
    this.resistWind = 0;
    this.resistLight = 0;
    this.resistDark = 0;

    this.talents = [];
    this.powers = [];
  }

  // Add methods as needed
}

export class Billmen extends UnitType {
  constructor(name: string, level: number) {
    super(level);
    this.typeName = name;
    // Set Billmen-specific properties
    this.category = UnitMusterCategory.Melee;
    // ... set other Billmen-specific properties
  }

  // Add Billmen-specific methods if any
}
