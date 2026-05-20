import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import operativeCatalogData from '@/data/solo/operativeCatalog.json';
import './SoloJointOpsView.css';

type ActivationSide = 'player' | 'npo';
type SoloTab =
  | 'game-runner'
  | 'list-builder'
  | 'npo-profile-manager'
  | 'nemesis-profile-manager';
type NemesisSize = 'small' | 'medium' | 'large' | 'custom';
type NemesisWeaponType = 'ranged' | 'melee';
type NpoTeamSelectionRule =
  | 'manual'
  | 'random'
  | 'melee-heavy'
  | 'ranged-heavy'
  | 'elite'
  | 'horde';

type TeamSetupPane = 'player' | 'npo';
type TransferDirection = 'to-selected' | 'to-unselected';

interface SoloWeaponProfile {
  id: string;
  name: string;
  attacks: number;
  skill: string;
  damage: string;
  criticalDamage: string;
  specialRules: string;
}

interface SoloProfile {
  id: string;
  name: string;
  apl: number;
  move: string;
  save: string;
  wounds: number;
  rangedWeapons: SoloWeaponProfile[];
  meleeWeapons: SoloWeaponProfile[];
  behaviorRules: string;
  usesControlStat?: boolean;
  allegianceTraits?: string[];
  nemesisTraits?: string[];
}

interface SoloListOperative {
  id: string;
  name: string;
  profileId: string;
  modelId?: string;
  teamId?: string;
  teamName?: string;
  customDescription?: string;
  requiresExplicitProfile?: boolean;
  operativeType?: 'catalog' | 'custom' | 'nemesis';
  nemesisId?: string;
  activationCardCount?: number;
}

interface NemesisOperative {
  id: string;
  name: string;
  size: NemesisSize;
  profileId: string;
  rangedWeapons: SoloWeaponProfile[];
  meleeWeapons: SoloWeaponProfile[];
  allegianceTraits?: string[];
  nemesisTraits?: string[];
}

interface NemesisTraitOption {
  id: string;
  name: string;
  description: string;
}

interface NemesisWeaponOption {
  id: string;
  type: NemesisWeaponType;
  source: 'official' | 'consolidated';
  profile: SoloWeaponProfile;
}

interface CatalogTeam {
  id: string;
  name: string;
  side: 'player' | 'npo' | 'both';
}

interface CatalogOperative {
  id: string;
  teamId: string;
  teamName: string;
  name: string;
  profile: SoloProfile;
}

interface OperativeCatalog {
  teams: CatalogTeam[];
  operatives: CatalogOperative[];
}

interface SoloList {
  id: string;
  name: string;
  side: ActivationSide;
  operatives: SoloListOperative[];
}

interface SoloTeam {
  id: string;
  name: string;
  side: ActivationSide;
  sourceListId: string;
  operativeIds: string[];
  selectionRule: NpoTeamSelectionRule;
  autoWoundsLimit: number;
}

interface ActivationCard {
  id: string;
  label: string;
  operativeIds: string[]; // SoloListOperative ids of linked operatives
  count: number;
}

interface RunnerOperative {
  id: string;
  side: ActivationSide;
  sourceOperativeId: string;
  name: string;
  profileId: string;
  activationCardCount: number;
  damageTaken: number;
  injured: boolean;
  incapacitated: boolean;
}

interface SoloBackupFile {
  schemaVersion: 1;
  profiles?: SoloProfile[];
  lists?: SoloList[];
  teams?: SoloTeam[];
  nemesisOperatives?: NemesisOperative[];
}

interface AddListOperativeInput {
  name: string;
  profileId: string;
  modelId?: string;
  teamId?: string;
  teamName?: string;
  customDescription?: string;
  requiresExplicitProfile?: boolean;
  operativeType?: 'catalog' | 'custom' | 'nemesis';
  nemesisId?: string;
  activationCardCount?: number;
}

interface ProfileSelectOption {
  id: string;
  name: string;
}

interface TransferHint {
  teamId: string;
  operativeId: string;
  direction: TransferDirection;
}

const STORAGE_KEY = 'kill-team-solo-joint-ops-v2';
const LEGACY_STORAGE_KEY = 'kill-team-solo-joint-ops';

const hasLocalStorageApi = (): boolean => {
  if (typeof window === 'undefined') return false;
  const storage = window.localStorage;
  return (
    typeof storage?.getItem === 'function' &&
    typeof storage?.setItem === 'function'
  );
};
const DATACARD_PROFILE_ID = 'datacard';
const NPO_OPERATIVES_TEAM_ID = 'mission-pack-npo-operatives';
const NEMESIS_TEAM_ID = 'nemesis-operatives';
const ALL_TEAMS_ID = '__all-teams__';
const CUSTOM_MODEL_ID = '__custom-model__';

const NEMESIS_SIZE_PRESETS: Record<
  Exclude<NemesisSize, 'custom'>,
  {
    control: number;
    move: string;
    save: string;
    wounds: number;
    maxWeapons: number;
  }
> = {
  small: { control: 4, move: '6"', save: '4+', wounds: 35, maxWeapons: 2 },
  medium: { control: 5, move: '6"', save: '4+', wounds: 50, maxWeapons: 2 },
  large: { control: 6, move: '6"', save: '4+', wounds: 75, maxWeapons: 3 },
};

const CUSTOM_NEMESIS_WEAPON_LIMIT = 2;
const NEMESIS_TRAIT_LIMIT = 1;

const NEMESIS_ALLEGIANCE_TRAITS: NemesisTraitOption[] = [
  {
    id: 'aeldari-arrogant-superiority',
    name: 'Arrogant Superiority',
    description: 'Aeldari allegiance trait.',
  },
  {
    id: 'chaos-let-the-galaxy-burn',
    name: 'Let the Galaxy Burn',
    description: 'Chaos allegiance trait.',
  },
  {
    id: 'imperium-defenders-of-the-imperium',
    name: 'Defenders of the Imperium',
    description: 'Imperium allegiance trait.',
  },
  {
    id: 'leagues-of-votann-acquisition-at-all-costs',
    name: 'Acquisition at All Costs',
    description: 'Leagues of Votann allegiance trait.',
  },
  {
    id: 'necron-living-metal',
    name: 'Living Metal',
    description: 'Necron allegiance trait.',
  },
  {
    id: 'ork-waaagh',
    name: 'Waaagh!',
    description: 'Ork allegiance trait.',
  },
  {
    id: 'tau-empire-supporting-fire',
    name: 'Supporting Fire',
    description: 'Tau Empire allegiance trait.',
  },
  {
    id: 'tyranid-will-of-the-hive-mind',
    name: 'Will of the Hive Mind',
    description: 'Tyranid allegiance trait.',
  },
];

const NEMESIS_TRAITS: NemesisTraitOption[] = [
  {
    id: 'nemesis-armoured',
    name: 'Armoured',
    description:
      "Improve this operative's Save stat by 1 against shooting attacks with normal damage 3 or less.",
  },
  {
    id: 'nemesis-blitz',
    name: 'Blitz',
    description:
      'After this operative performs Charge, its melee weapons gain Severe and Shock for the rest of that activation.',
  },
  {
    id: 'nemesis-duellist',
    name: 'Duellist',
    description:
      'When fighting or retaliating, resolve one success before the normal order; if used, that success must be blocked.',
  },
  {
    id: 'nemesis-focused-targeting',
    name: 'Focused Targeting',
    description:
      'If this operative shoots before performing another action in its activation, ranged weapons gain Punishing.',
  },
  {
    id: 'nemesis-close-range-lethality',
    name: 'Close-range Lethality',
    description:
      'When shooting the closest valid target within 8 inches, ranged weapons gain Lethal 5+ and Severe if they already have Lethal.',
  },
  {
    id: 'nemesis-fury',
    name: 'Fury',
    description:
      "Melee weapons gain Ceaseless (or Relentless if already Ceaseless); worsen this operative's ranged Hit stat by 1.",
  },
  {
    id: 'nemesis-implacable',
    name: 'Implacable',
    description: 'Ignore Save stat changes from being injured.',
  },
  {
    id: 'nemesis-crushing-impact',
    name: 'Crushing Impact',
    description:
      'After finishing movement during Charge, inflict D3+3 damage on one enemy operative within control range.',
  },
  {
    id: 'nemesis-shielded',
    name: 'Shielded',
    description:
      'Once per battle, when an attack die inflicts damage on this operative, ignore that inflicted damage.',
  },
  {
    id: 'nemesis-shrouded',
    name: 'Shrouded',
    description:
      'When an enemy shoots this operative from more than 8 inches away, attack dice cannot be re-rolled.',
  },
  {
    id: 'nemesis-tenacious',
    name: 'Tenacious',
    description: 'Ignore Move stat changes from being injured.',
  },
  {
    id: 'nemesis-tough',
    name: 'Tough',
    description:
      'When an attack die inflicts damage 4 or more, roll one D6; on 5+, subtract 1 from that inflicted damage.',
  },
  {
    id: 'nemesis-violent-demise',
    name: 'Violent Demise',
    description:
      'If this operative is incapacitated, before removal inflict D6+1 damage on each other operative within 3 inches (with normal heavy-terrain exceptions).',
  },
];

// Official nemesis weapons from uploaded tables.
const OFFICIAL_NEMESIS_RANGED_WEAPONS: SoloWeaponProfile[] = [
  {
    id: 'official-ranged-autocannon',
    name: 'Autocannon',
    attacks: 5,
    skill: '3+',
    damage: '5',
    criticalDamage: '6',
    specialRules: '',
  },
  {
    id: 'official-ranged-burst-cannon',
    name: 'Burst cannon',
    attacks: 5,
    skill: '3+',
    damage: '3',
    criticalDamage: '4',
    specialRules: 'Ceaseless, Torrent 1"',
  },
  {
    id: 'official-ranged-cyclic-ion-raker',
    name: 'Cyclic ion raker',
    attacks: 5,
    skill: '3+',
    damage: '4',
    criticalDamage: '5',
    specialRules:
      'Heavy (Reposition only), Piercing 1, Selection 2, Torrent 2"',
  },
  {
    id: 'official-ranged-flamestorm-cannon',
    name: 'Flamestorm cannon',
    attacks: 6,
    skill: '2+',
    damage: '3',
    criticalDamage: '3',
    specialRules: 'Range 8", Heavy (Reposition only), Selection 2, Torrent 2"',
  },
  {
    id: 'official-ranged-havoc-launcher',
    name: 'Havoc launcher',
    attacks: 4,
    skill: '3+',
    damage: '4',
    criticalDamage: '6',
    specialRules: 'Blast 2"',
  },
  {
    id: 'official-ranged-heavy-bolter',
    name: 'Heavy bolter',
    attacks: 5,
    skill: '3+',
    damage: '4',
    criticalDamage: '5',
    specialRules: 'Piercing Crits 1, Torrent 1"',
  },
  {
    id: 'official-ranged-heavy-flamer',
    name: 'Heavy flamer',
    attacks: 5,
    skill: '2+',
    damage: '3',
    criticalDamage: '3',
    specialRules: 'Range 8", Saturate, Torrent 2"',
  },
  {
    id: 'official-ranged-heavy-onslaught-gatling-cannon',
    name: 'Heavy onslaught gatling cannon',
    attacks: 6,
    skill: '3+',
    damage: '4',
    criticalDamage: '5',
    specialRules: 'Heavy (Reposition only), Selection 2, Torrent 2"',
  },
  {
    id: 'official-ranged-heavy-phosphor-blaster',
    name: 'Heavy phosphor blaster',
    attacks: 5,
    skill: '3+',
    damage: '4',
    criticalDamage: '5',
    specialRules: 'Saturate, Severe',
  },
  {
    id: 'official-ranged-heavy-rail-rifle',
    name: 'Heavy rail rifle',
    attacks: 5,
    skill: '3+',
    damage: '6',
    criticalDamage: '7',
    specialRules: 'Heavy (Reposition only), Piercing 2, Selection 2',
  },
  {
    id: 'official-ranged-heavy-stubber',
    name: 'Heavy stubber',
    attacks: 5,
    skill: '3+',
    damage: '4',
    criticalDamage: '5',
    specialRules: 'Torrent 1"',
  },
  {
    id: 'official-ranged-lascannon',
    name: 'Lascannon',
    attacks: 4,
    skill: '3+',
    damage: '6',
    criticalDamage: '7',
    specialRules: 'Heavy (Reposition only), Piercing 2',
  },
  {
    id: 'official-ranged-macro-plasma-incinerator-standard',
    name: 'Macro plasma incinerator (standard)',
    attacks: 5,
    skill: '3+',
    damage: '4',
    criticalDamage: '6',
    specialRules: 'Blast 2", Heavy (Reposition only), Piercing 1, Selection 2',
  },
  {
    id: 'official-ranged-macro-plasma-incinerator-supercharge',
    name: 'Macro plasma incinerator (supercharge)',
    attacks: 5,
    skill: '3+',
    damage: '5',
    criticalDamage: '6',
    specialRules:
      'Blast 2", Heavy (Reposition only), Lethal 5+, Piercing 1, Selection 2',
  },
  {
    id: 'official-ranged-meltagun',
    name: 'Meltagun',
    attacks: 4,
    skill: '3+',
    damage: '6',
    criticalDamage: '3',
    specialRules: 'Range 6", Devastating 4, Piercing 2',
  },
  {
    id: 'official-ranged-missile-launcher-frag',
    name: 'Missile launcher (frag)',
    attacks: 4,
    skill: '3+',
    damage: '3',
    criticalDamage: '5',
    specialRules: 'Blast 2"',
  },
  {
    id: 'official-ranged-missile-launcher-krak',
    name: 'Missile launcher (krak)',
    attacks: 4,
    skill: '3+',
    damage: '5',
    criticalDamage: '7',
    specialRules: 'Piercing 1',
  },
  {
    id: 'official-ranged-multi-melta',
    name: 'Multi-melta',
    attacks: 4,
    skill: '3+',
    damage: '6',
    criticalDamage: '3',
    specialRules: 'Devastating 4, Heavy (Reposition only), Piercing 2',
  },
  {
    id: 'official-ranged-plasma-cannon-standard',
    name: 'Plasma cannon (standard)',
    attacks: 4,
    skill: '3+',
    damage: '4',
    criticalDamage: '6',
    specialRules: 'Blast 2", Heavy (Reposition only), Piercing 1',
  },
  {
    id: 'official-ranged-plasma-cannon-supercharge',
    name: 'Plasma cannon (supercharge)',
    attacks: 4,
    skill: '3+',
    damage: '5',
    criticalDamage: '6',
    specialRules:
      'Blast 2", Heavy (Reposition only), Hot, Lethal 5+, Piercing 1',
  },
  {
    id: 'official-ranged-plasma-gun-standard',
    name: 'Plasma gun (standard)',
    attacks: 4,
    skill: '3+',
    damage: '4',
    criticalDamage: '6',
    specialRules: 'Piercing 1',
  },
  {
    id: 'official-ranged-plasma-gun-supercharge',
    name: 'Plasma gun (supercharge)',
    attacks: 4,
    skill: '3+',
    damage: '5',
    criticalDamage: '6',
    specialRules: 'Hot, Lethal 5+, Piercing 1',
  },
  {
    id: 'official-ranged-rokkit-launcha',
    name: 'Rokkit launcha',
    attacks: 6,
    skill: '4+',
    damage: '4',
    criticalDamage: '5',
    specialRules: 'Blast 1"',
  },
  {
    id: 'official-ranged-shuriken-cannon',
    name: 'Shuriken cannon',
    attacks: 5,
    skill: '3+',
    damage: '4',
    criticalDamage: '5',
    specialRules: 'Rending, Torrent 1"',
  },
  {
    id: 'official-ranged-splinter-cannon',
    name: 'Splinter cannon',
    attacks: 5,
    skill: '3+',
    damage: '3',
    criticalDamage: '5',
    specialRules: 'Lethal 5+, Torrent 1"',
  },
  {
    id: 'official-ranged-starcannon',
    name: 'Starcannon',
    attacks: 4,
    skill: '3+',
    damage: '5',
    criticalDamage: '6',
    specialRules: 'Lethal 5+, Piercing 1',
  },
  {
    id: 'official-ranged-stranglethorn-cannon',
    name: 'Stranglethorn cannon',
    attacks: 5,
    skill: '3+',
    damage: '3',
    criticalDamage: '5',
    specialRules: 'Blast 2", Lethal 5+',
  },
  {
    id: 'official-ranged-thermal-spear',
    name: 'Thermal spear',
    attacks: 5,
    skill: '3+',
    damage: '6',
    criticalDamage: '3',
    specialRules:
      "Devastating 4, Heavy (Reposition only), Piercing 2, Selection 2, Twinned: Select one other ranged weapon this operative has to have the Ceaseless weapon rule; if it's a burst cannon, add 1 to its Atk stat instead.",
  },
];
const OFFICIAL_NEMESIS_MELEE_WEAPONS: SoloWeaponProfile[] = [
  {
    id: 'official-melee-chain-weapon',
    name: 'Chain weapon',
    attacks: 4,
    skill: '3+',
    damage: '5',
    criticalDamage: '6',
    specialRules: 'Brutal, Rending',
  },
  {
    id: 'official-melee-close-combat-weapon',
    name: 'Close combat weapon',
    attacks: 3,
    skill: '4+',
    damage: '4',
    criticalDamage: '5',
    specialRules: 'Selection 0',
  },
  {
    id: 'official-melee-dread-saw',
    name: 'Dread saw',
    attacks: 5,
    skill: '3+',
    damage: '4',
    criticalDamage: '5',
    specialRules: 'Rending',
  },
  {
    id: 'official-melee-fleshmower',
    name: 'Fleshmower',
    attacks: 5,
    skill: '2+',
    damage: '4',
    criticalDamage: '5',
    specialRules: 'Brutal',
  },
  {
    id: 'official-melee-power-fist',
    name: 'Power fist',
    attacks: 4,
    skill: '3+',
    damage: '6',
    criticalDamage: '8',
    specialRules: 'Brutal, Shock',
  },
  {
    id: 'official-melee-power-scourge',
    name: 'Power scourge',
    attacks: 6,
    skill: '3+',
    damage: '3',
    criticalDamage: '5',
    specialRules: 'Lethal 5+',
  },
  {
    id: 'official-melee-power-talon',
    name: 'Power talon',
    attacks: 4,
    skill: '3+',
    damage: '5',
    criticalDamage: '6',
    specialRules: 'Lethal 5+, Rending',
  },
  {
    id: 'official-melee-power-weapon',
    name: 'Power weapon',
    attacks: 4,
    skill: '3+',
    damage: '5',
    criticalDamage: '7',
    specialRules: 'Lethal 5+',
  },
  {
    id: 'official-melee-scything-talons',
    name: 'Scything talons',
    attacks: 5,
    skill: '3+',
    damage: '4',
    criticalDamage: '6',
    specialRules: 'Ceaseless',
  },
  {
    id: 'official-melee-thunder-hammer',
    name: 'Thunder hammer',
    attacks: 4,
    skill: '3+',
    damage: '6',
    criticalDamage: '8',
    specialRules: 'Shock, Stun',
  },
];

const operativeCatalog = operativeCatalogData as OperativeCatalog;

const generateUniqueId = (prefix: string) =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? `${prefix}-${crypto.randomUUID()}`
    : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const defaultWeapon = (name = 'Weapon Profile'): SoloWeaponProfile => ({
  id: generateUniqueId('weapon'),
  name,
  attacks: 4,
  skill: '4+',
  damage: '3',
  criticalDamage: '4',
  specialRules: '',
});

const toWeaponKey = (weapon: SoloWeaponProfile): string =>
  [
    weapon.name.trim().toLowerCase(),
    weapon.attacks,
    weapon.skill.trim().toLowerCase(),
    weapon.damage.trim().toLowerCase(),
    weapon.criticalDamage.trim().toLowerCase(),
    weapon.specialRules.trim().toLowerCase(),
  ].join('|');

const toWeaponOptionId = (weapon: SoloWeaponProfile, source: string): string =>
  `${source}-${toWeaponKey(weapon)
    .replace(/[^a-z0-9|]/g, '-')
    .replace(/\|+/g, '-')}`;

const dedupeWeapons = (weapons: SoloWeaponProfile[]): SoloWeaponProfile[] => {
  const deduped = new Map<string, SoloWeaponProfile>();
  weapons.forEach((weapon) => {
    const key = toWeaponKey(weapon);
    if (!deduped.has(key)) {
      deduped.set(key, weapon);
    }
  });

  return Array.from(deduped.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
};

const getNemesisWeaponLimit = (size: NemesisSize): number =>
  size === 'custom'
    ? CUSTOM_NEMESIS_WEAPON_LIMIT
    : NEMESIS_SIZE_PRESETS[size].maxWeapons;

const getWeaponSelectionCost = (weapon: SoloWeaponProfile): number => {
  const matches = Array.from(
    weapon.specialRules.matchAll(/\bselection\s+(\d+)\b/gi)
  );
  if (matches.length === 0) return 1;

  const parsed = matches
    .map((match) => Number(match[1]))
    .filter((value) => Number.isFinite(value));
  if (parsed.length === 0) return 1;

  return Math.max(0, parsed[parsed.length - 1]);
};

const defaultProfile = (): SoloProfile => ({
  id: generateUniqueId('profile'),
  name: 'NPO Trooper',
  apl: 2,
  move: '6"',
  save: '5+',
  wounds: 7,
  rangedWeapons: [defaultWeapon('Rifle')],
  meleeWeapons: [defaultWeapon('Combat Blade')],
  behaviorRules: 'Advance to nearest visible enemy operative and engage.',
});

const createDefaultLists = (): { player: SoloList; npo: SoloList } => ({
  player: {
    id: generateUniqueId('list'),
    name: 'Player List',
    side: 'player',
    operatives: [],
  },
  npo: {
    id: generateUniqueId('list'),
    name: 'NPO List',
    side: 'npo',
    operatives: [],
  },
});

const createDefaultTeams = (
  lists: { player: SoloList; npo: SoloList },
  names?: { player?: string; npo?: string }
): { player: SoloTeam; npo: SoloTeam } => ({
  player: {
    id: generateUniqueId('team'),
    name: names?.player?.trim() || 'Player Team',
    side: 'player',
    sourceListId: lists.player.id,
    operativeIds: [],
    selectionRule: 'manual',
    autoWoundsLimit: 0,
  },
  npo: {
    id: generateUniqueId('team'),
    name: names?.npo?.trim() || 'NPO Team',
    side: 'npo',
    sourceListId: lists.npo.id,
    operativeIds: [],
    selectionRule: 'manual',
    autoWoundsLimit: 20,
  },
});

const buildInitialState = () => {
  const starterProfile = defaultProfile();
  const starterLists = createDefaultLists();
  const starterTeams = createDefaultTeams(starterLists);
  return {
    profiles: [starterProfile],
    nemesisOperatives: [] as NemesisOperative[],
    lists: [starterLists.player, starterLists.npo],
    teams: [starterTeams.player, starterTeams.npo],
    selectedPlayerListId: starterLists.player.id,
    selectedNpoListId: starterLists.npo.id,
    selectedPlayerTeamId: starterTeams.player.id,
    selectedNpoTeamId: starterTeams.npo.id,
    initiative: 'player' as ActivationSide,
    turningPoint: 1,
    activationNumber: 0,
    activeSide: 'player' as ActivationSide,
    activationDeck: [] as ActivationCard[],
  };
};

type SoloJointOpsState = ReturnType<typeof buildInitialState>;

const isString = (value: unknown): value is string => typeof value === 'string';

const isValidWeaponProfile = (value: unknown): value is SoloWeaponProfile => {
  if (!value || typeof value !== 'object') return false;
  const weapon = value as Partial<SoloWeaponProfile>;
  return (
    isString(weapon.id) &&
    isString(weapon.name) &&
    typeof weapon.attacks === 'number' &&
    isString(weapon.skill) &&
    isString(weapon.damage) &&
    isString(weapon.criticalDamage) &&
    isString(weapon.specialRules)
  );
};

const isValidProfile = (value: unknown): value is SoloProfile => {
  if (!value || typeof value !== 'object') return false;
  const profile = value as Partial<SoloProfile>;
  return (
    isString(profile.id) &&
    isString(profile.name) &&
    typeof profile.apl === 'number' &&
    isString(profile.move) &&
    isString(profile.save) &&
    typeof profile.wounds === 'number' &&
    Array.isArray(profile.rangedWeapons) &&
    profile.rangedWeapons.every(isValidWeaponProfile) &&
    Array.isArray(profile.meleeWeapons) &&
    profile.meleeWeapons.every(isValidWeaponProfile) &&
    isString(profile.behaviorRules) &&
    (profile.usesControlStat === undefined ||
      typeof profile.usesControlStat === 'boolean') &&
    (profile.allegianceTraits === undefined ||
      (Array.isArray(profile.allegianceTraits) &&
        profile.allegianceTraits.every(isString))) &&
    (profile.nemesisTraits === undefined ||
      (Array.isArray(profile.nemesisTraits) &&
        profile.nemesisTraits.every(isString)))
  );
};

const isValidNemesisSize = (value: unknown): value is NemesisSize =>
  value === 'small' ||
  value === 'medium' ||
  value === 'large' ||
  value === 'custom';

const isValidNemesisOperative = (value: unknown): value is NemesisOperative => {
  if (!value || typeof value !== 'object') return false;
  const nemesis = value as Partial<NemesisOperative>;
  return (
    isString(nemesis.id) &&
    isString(nemesis.name) &&
    isValidNemesisSize(nemesis.size) &&
    isString(nemesis.profileId) &&
    Array.isArray(nemesis.rangedWeapons) &&
    nemesis.rangedWeapons.every(isValidWeaponProfile) &&
    Array.isArray(nemesis.meleeWeapons) &&
    nemesis.meleeWeapons.every(isValidWeaponProfile) &&
    (nemesis.allegianceTraits === undefined ||
      (Array.isArray(nemesis.allegianceTraits) &&
        nemesis.allegianceTraits.every(isString))) &&
    (nemesis.nemesisTraits === undefined ||
      (Array.isArray(nemesis.nemesisTraits) &&
        nemesis.nemesisTraits.every(isString)))
  );
};

const isValidListOperative = (value: unknown): value is SoloListOperative => {
  if (!value || typeof value !== 'object') return false;
  const operative = value as Partial<SoloListOperative>;
  return (
    isString(operative.id) &&
    isString(operative.name) &&
    isString(operative.profileId) &&
    (operative.modelId === undefined || isString(operative.modelId)) &&
    (operative.teamId === undefined || isString(operative.teamId)) &&
    (operative.teamName === undefined || isString(operative.teamName)) &&
    (operative.customDescription === undefined ||
      isString(operative.customDescription)) &&
    (operative.requiresExplicitProfile === undefined ||
      typeof operative.requiresExplicitProfile === 'boolean') &&
    (operative.operativeType === undefined ||
      operative.operativeType === 'catalog' ||
      operative.operativeType === 'custom' ||
      operative.operativeType === 'nemesis') &&
    (operative.nemesisId === undefined || isString(operative.nemesisId)) &&
    (operative.activationCardCount === undefined ||
      typeof operative.activationCardCount === 'number')
  );
};

const isValidList = (value: unknown): value is SoloList => {
  if (!value || typeof value !== 'object') return false;
  const list = value as Partial<SoloList>;
  return (
    isString(list.id) &&
    isString(list.name) &&
    (list.side === 'player' || list.side === 'npo') &&
    Array.isArray(list.operatives) &&
    list.operatives.every(isValidListOperative)
  );
};

const isValidTeam = (value: unknown): value is SoloTeam => {
  if (!value || typeof value !== 'object') return false;
  const team = value as Partial<SoloTeam>;
  return (
    isString(team.id) &&
    isString(team.name) &&
    (team.side === 'player' || team.side === 'npo') &&
    isString(team.sourceListId) &&
    Array.isArray(team.operativeIds) &&
    team.operativeIds.every(isString) &&
    (team.selectionRule === 'manual' ||
      team.selectionRule === 'random' ||
      team.selectionRule === 'melee-heavy' ||
      team.selectionRule === 'ranged-heavy' ||
      team.selectionRule === 'elite' ||
      team.selectionRule === 'horde') &&
    typeof team.autoWoundsLimit === 'number'
  );
};

const toDamageNumber = (value: string): number => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getWeaponPotential = (weapon: SoloWeaponProfile): number =>
  weapon.attacks *
  (toDamageNumber(weapon.damage) + toDamageNumber(weapon.criticalDamage));

const getMeleeScore = (profile: SoloProfile | null): number =>
  profile
    ? profile.meleeWeapons.reduce(
        (total, weapon) => total + getWeaponPotential(weapon),
        0
      )
    : 0;

const getRangedScore = (profile: SoloProfile | null): number =>
  profile
    ? profile.rangedWeapons.reduce(
        (total, weapon) => total + getWeaponPotential(weapon),
        0
      )
    : 0;

const shuffle = <T,>(items: T[]): T[] => {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

/**
 * Loads persisted solo/joint ops state from localStorage.
 * Tries the current storage key first, then the legacy key for migration.
 * Returns a fresh default state when stored data is missing or invalid.
 */
const loadState = (): SoloJointOpsState => {
  const fallback = buildInitialState();
  if (!hasLocalStorageApi()) {
    return fallback;
  }

  try {
    for (const key of [STORAGE_KEY, LEGACY_STORAGE_KEY]) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') continue;

      const maybe = parsed as Partial<SoloJointOpsState>;
      if (!Array.isArray(maybe.profiles) || !Array.isArray(maybe.lists)) {
        continue;
      }

      const profiles = maybe.profiles.filter(isValidProfile);
      const nemesisOperatives = Array.isArray(
        (maybe as { nemesisOperatives?: unknown[] }).nemesisOperatives
      )
        ? (
            (maybe as { nemesisOperatives?: unknown[] }).nemesisOperatives ?? []
          ).flatMap((entry) => {
            if (!entry || typeof entry !== 'object') return [];
            const legacy = entry as Partial<NemesisOperative>;
            const normalized = {
              ...legacy,
              rangedWeapons: Array.isArray(legacy.rangedWeapons)
                ? legacy.rangedWeapons
                : [],
              meleeWeapons: Array.isArray(legacy.meleeWeapons)
                ? legacy.meleeWeapons
                : [],
            };
            return isValidNemesisOperative(normalized) ? [normalized] : [];
          })
        : [];
      const lists = maybe.lists.filter(isValidList);
      if (profiles.length === 0 || lists.length === 0) continue;

      const playerList = lists.find((list) => list.side === 'player');
      const npoList = lists.find((list) => list.side === 'npo');
      if (!playerList || !npoList) continue;

      const fallbackTeams = createDefaultTeams(
        { player: playerList, npo: npoList },
        {
          player:
            isString((maybe as { playerTeamName?: unknown }).playerTeamName) &&
            (maybe as { playerTeamName?: string }).playerTeamName
              ? (maybe as { playerTeamName?: string }).playerTeamName
              : 'Player Team',
          npo:
            isString((maybe as { npoTeamName?: unknown }).npoTeamName) &&
            (maybe as { npoTeamName?: string }).npoTeamName
              ? (maybe as { npoTeamName?: string }).npoTeamName
              : 'NPO Team',
        }
      );

      const teams = Array.isArray((maybe as { teams?: unknown[] }).teams)
        ? ((maybe as { teams?: unknown[] }).teams ?? []).filter(isValidTeam)
        : [fallbackTeams.player, fallbackTeams.npo];

      const validTeams = teams.map((team) => {
        const fallbackListId =
          team.side === 'player' ? playerList.id : npoList.id;
        const sourceListId = lists.some((list) => list.id === team.sourceListId)
          ? team.sourceListId
          : fallbackListId;
        const sourceList =
          lists.find((list) => list.id === sourceListId) ??
          (team.side === 'player' ? playerList : npoList);
        const validOperativeIds = team.operativeIds.filter((operativeId) =>
          sourceList.operatives.some(
            (operative) => operative.id === operativeId
          )
        );

        return {
          ...team,
          sourceListId,
          operativeIds: validOperativeIds,
        };
      });

      const playerTeam =
        validTeams.find((team) => team.side === 'player') ??
        fallbackTeams.player;
      const npoTeam =
        validTeams.find((team) => team.side === 'npo') ?? fallbackTeams.npo;

      const normalizedTeams = [
        ...validTeams.filter((team) => team.side === 'player'),
        ...validTeams.filter((team) => team.side === 'npo'),
      ];

      if (!normalizedTeams.some((team) => team.id === playerTeam.id)) {
        normalizedTeams.push(playerTeam);
      }

      if (!normalizedTeams.some((team) => team.id === npoTeam.id)) {
        normalizedTeams.push(npoTeam);
      }

      return {
        profiles,
        nemesisOperatives,
        lists,
        teams: normalizedTeams,
        selectedPlayerListId:
          maybe.selectedPlayerListId &&
          lists.some((list) => list.id === maybe.selectedPlayerListId)
            ? maybe.selectedPlayerListId
            : playerList.id,
        selectedNpoListId:
          maybe.selectedNpoListId &&
          lists.some((list) => list.id === maybe.selectedNpoListId)
            ? maybe.selectedNpoListId
            : npoList.id,
        selectedPlayerTeamId:
          isString(
            (maybe as { selectedPlayerTeamId?: unknown }).selectedPlayerTeamId
          ) &&
          normalizedTeams.some(
            (team) =>
              team.side === 'player' &&
              team.id ===
                (maybe as { selectedPlayerTeamId?: string })
                  .selectedPlayerTeamId
          )
            ? ((maybe as { selectedPlayerTeamId?: string })
                .selectedPlayerTeamId ?? playerTeam.id)
            : playerTeam.id,
        selectedNpoTeamId:
          isString(
            (maybe as { selectedNpoTeamId?: unknown }).selectedNpoTeamId
          ) &&
          normalizedTeams.some(
            (team) =>
              team.side === 'npo' &&
              team.id ===
                (maybe as { selectedNpoTeamId?: string }).selectedNpoTeamId
          )
            ? ((maybe as { selectedNpoTeamId?: string }).selectedNpoTeamId ??
              npoTeam.id)
            : npoTeam.id,
        initiative: maybe.initiative === 'npo' ? 'npo' : 'player',
        turningPoint:
          typeof maybe.turningPoint === 'number' && maybe.turningPoint > 0
            ? maybe.turningPoint
            : fallback.turningPoint,
        activationNumber:
          typeof maybe.activationNumber === 'number' &&
          maybe.activationNumber >= 0
            ? maybe.activationNumber
            : fallback.activationNumber,
        activeSide: maybe.activeSide === 'npo' ? 'npo' : 'player',
        activationDeck: Array.isArray(
          (maybe as { activationDeck?: unknown }).activationDeck
        )
          ? (
              (maybe as { activationDeck?: unknown[] }).activationDeck ?? []
            ).flatMap((cardLike) => {
              if (!cardLike || typeof cardLike !== 'object') return [];
              const card = cardLike as Partial<ActivationCard>;
              if (
                !isString(card.id) ||
                !isString(card.label) ||
                !Array.isArray(card.operativeIds) ||
                !card.operativeIds.every(isString)
              ) {
                return [];
              }

              const count =
                typeof card.count === 'number' && card.count > 0
                  ? Math.floor(card.count)
                  : 1;

              return [
                {
                  id: card.id,
                  label: card.label,
                  operativeIds: card.operativeIds,
                  count,
                },
              ];
            })
          : [],
      };
    }

    return fallback;
  } catch {
    return fallback;
  }
};

/** Reads a backup file selected from an import input and returns its text content. */
const readFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      reader.onload = null;
      reader.onerror = null;
      resolve(String(reader.result ?? ''));
    };
    reader.onerror = () => {
      reader.onload = null;
      reader.onerror = null;
      reject(reader.error ?? new Error('Failed to read selected file.'));
    };
    reader.readAsText(file);
  });

function TeamOperativeTransfer({
  team,
  sourceOperatives,
  selectedOperatives,
  transferHint,
  onMoveOperative,
}: {
  team: SoloTeam | null;
  sourceOperatives: SoloListOperative[];
  selectedOperatives: SoloListOperative[];
  transferHint: TransferHint | null;
  onMoveOperative: (operativeId: string, direction: TransferDirection) => void;
}) {
  const selectedIds = useMemo(
    () => new Set(selectedOperatives.map((operative) => operative.id)),
    [selectedOperatives]
  );

  const unselectedOperatives = useMemo(
    () =>
      sourceOperatives.filter((operative) => !selectedIds.has(operative.id)),
    [selectedIds, sourceOperatives]
  );

  const getTransferClassName = (
    operativeId: string,
    expectedDirection: TransferDirection
  ) => {
    if (!transferHint) return '';
    const hasHint =
      transferHint.teamId === team?.id &&
      transferHint.operativeId === operativeId &&
      transferHint.direction === expectedDirection;
    if (!hasHint) return '';
    return expectedDirection === 'to-selected'
      ? 'transfer-in-right'
      : 'transfer-in-left';
  };

  return (
    <div className="team-transfer">
      <div className="team-transfer-grid">
        <section className="team-transfer-column">
          <h5>Available Operatives</h5>
          <ul
            className="team-transfer-list"
            aria-label={`${team?.name ?? 'Team'} available operatives`}
          >
            {unselectedOperatives.length === 0 ? (
              <li className="team-transfer-empty">No available operatives.</li>
            ) : (
              unselectedOperatives.map((operative) => (
                <li
                  key={operative.id}
                  className={getTransferClassName(
                    operative.id,
                    'to-unselected'
                  )}
                >
                  <button
                    type="button"
                    className="team-transfer-item"
                    onClick={() => onMoveOperative(operative.id, 'to-selected')}
                  >
                    <span>{operative.name}</span>
                    <span className="team-transfer-action">Add</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>

        <div className="team-transfer-divider" aria-hidden="true">
          ⇄
        </div>

        <section className="team-transfer-column">
          <h5>Selected Operatives</h5>
          <ul
            className="team-transfer-list team-transfer-list-selected"
            aria-label={`${team?.name ?? 'Team'} selected operatives`}
          >
            {selectedOperatives.length === 0 ? (
              <li className="team-transfer-empty">No selected operatives.</li>
            ) : (
              selectedOperatives.map((operative) => (
                <li
                  key={operative.id}
                  className={getTransferClassName(operative.id, 'to-selected')}
                >
                  <button
                    type="button"
                    className="team-transfer-item"
                    onClick={() =>
                      onMoveOperative(operative.id, 'to-unselected')
                    }
                  >
                    <span>{operative.name}</span>
                    <span className="team-transfer-action">Remove</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

function SoloListEditor({
  side,
  lists,
  selectedListId,
  availableTeams,
  catalogOperatives,
  nemesisOperatives,
  profiles,
  profileLookup,
  defaultTeamId,
  onSelectList,
  onCreateList,
  onDeleteList,
  onRenameList,
  onAddOperative,
  onAddNemesisOperative,
  onRemoveOperative,
}: {
  side: ActivationSide;
  lists: SoloList[];
  selectedListId: string;
  availableTeams: CatalogTeam[];
  catalogOperatives: CatalogOperative[];
  nemesisOperatives: NemesisOperative[];
  profiles: SoloProfile[];
  profileLookup: Map<string, SoloProfile>;
  defaultTeamId: string;
  onSelectList: (listId: string) => void;
  onCreateList: (name: string) => void;
  onDeleteList: (listId: string) => void;
  onRenameList: (listId: string, name: string) => void;
  onAddOperative: (listId: string, operative: AddListOperativeInput) => void;
  onAddNemesisOperative: (listId: string, nemesisId: string) => void;
  onRemoveOperative: (listId: string, operativeId: string) => void;
}) {
  const [newListName, setNewListName] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState(defaultTeamId);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [selectedProfileOverrideId, setSelectedProfileOverrideId] =
    useState('');
  const [customModelDescription, setCustomModelDescription] = useState('');
  const [selectedNemesisId, setSelectedNemesisId] = useState(
    nemesisOperatives[0]?.id ?? ''
  );

  const sideLabel = side === 'player' ? 'Player' : 'NPO';
  const selectedList = lists.find((list) => list.id === selectedListId) ??
    lists[0] ?? {
      id: '',
      name: '',
      operatives: [],
    };

  useEffect(() => {
    if (!availableTeams.some((team) => team.id === selectedTeamId)) {
      setSelectedTeamId(defaultTeamId);
    }
  }, [availableTeams, defaultTeamId, selectedTeamId]);

  const filteredCatalogOperatives = useMemo(() => {
    if (side === 'npo' && selectedTeamId === ALL_TEAMS_ID) {
      return catalogOperatives;
    }
    return catalogOperatives.filter(
      (operative) => operative.teamId === selectedTeamId
    );
  }, [catalogOperatives, selectedTeamId, side]);

  useEffect(() => {
    const validModelIds = new Set([
      ...filteredCatalogOperatives.map((operative) => operative.id),
      CUSTOM_MODEL_ID,
    ]);
    if (!validModelIds.has(selectedModelId)) {
      setSelectedModelId(filteredCatalogOperatives[0]?.id ?? CUSTOM_MODEL_ID);
    }
  }, [filteredCatalogOperatives, selectedModelId]);

  const selectedModelOperative =
    filteredCatalogOperatives.find(
      (operative) => operative.id === selectedModelId
    ) ?? null;
  const isCustomModel = selectedModelId === CUSTOM_MODEL_ID;
  const customModelText = customModelDescription.trim();
  const selectedTeamName =
    availableTeams.find((team) => team.id === selectedTeamId)?.name ??
    'Custom Model';
  const defaultModelProfileId = selectedModelOperative
    ? side === 'player'
      ? DATACARD_PROFILE_ID
      : selectedModelOperative.profile.id
    : DATACARD_PROFILE_ID;
  const operativeProfileId =
    selectedProfileOverrideId || defaultModelProfileId || DATACARD_PROFILE_ID;
  const canAddCustomModel =
    customModelText.length > 0 && selectedProfileOverrideId.length > 0;

  const totals = useMemo(() => {
    return selectedList.operatives.reduce(
      (acc, operative) => {
        const profile =
          operative.profileId === DATACARD_PROFILE_ID
            ? null
            : (profileLookup.get(operative.profileId) ?? null);

        return {
          count: acc.count + 1,
          apl: acc.apl + (profile?.apl ?? 0),
          wounds: acc.wounds + (profile?.wounds ?? 0),
        };
      },
      { count: 0, apl: 0, wounds: 0 }
    );
  }, [profileLookup, selectedList.operatives]);

  const groupedCatalogOperatives = useMemo(() => {
    const grouped = new Map<string, CatalogOperative[]>();
    filteredCatalogOperatives.forEach((operative) => {
      const current = grouped.get(operative.teamName) ?? [];
      current.push(operative);
      grouped.set(operative.teamName, current);
    });

    return Array.from(grouped.entries()).sort((a, b) =>
      a[0].localeCompare(b[0])
    );
  }, [filteredCatalogOperatives]);

  const selectableProfileOverrides = useMemo(() => {
    if (side !== 'npo') {
      return profiles;
    }

    const npoTeamIds = new Set(
      availableTeams
        .filter((team) => team.side === 'npo')
        .map((team) => team.id)
    );
    const profileOptions = new Map<string, ProfileSelectOption>();

    catalogOperatives
      .filter((operative) => npoTeamIds.has(operative.teamId))
      .forEach((operative) => {
        profileOptions.set(operative.profile.id, {
          id: operative.profile.id,
          name: operative.profile.name,
        });
      });

    profiles.forEach((profile) => {
      profileOptions.set(profile.id, profile);
    });

    return Array.from(profileOptions.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [availableTeams, catalogOperatives, profiles, side]);

  useEffect(() => {
    if (!selectedProfileOverrideId) return;
    if (
      !selectableProfileOverrides.some(
        (profile) => profile.id === selectedProfileOverrideId
      )
    ) {
      setSelectedProfileOverrideId('');
    }
  }, [selectableProfileOverrides, selectedProfileOverrideId]);

  useEffect(() => {
    if (
      !nemesisOperatives.some((nemesis) => nemesis.id === selectedNemesisId)
    ) {
      setSelectedNemesisId(nemesisOperatives[0]?.id ?? '');
    }
  }, [nemesisOperatives, selectedNemesisId]);

  return (
    <article className="team-builder" aria-label={`${sideLabel} list builder`}>
      <h4>{sideLabel} Lists</h4>
      <label htmlFor={`${side}-list-select`}>{sideLabel} Active List</label>
      <select
        id={`${side}-list-select`}
        value={selectedList.id}
        onChange={(event) => onSelectList(event.target.value)}
      >
        {lists.map((list) => (
          <option key={list.id} value={list.id}>
            {list.name}
          </option>
        ))}
      </select>

      <div className="input-row list-name-row">
        <input
          value={newListName}
          placeholder={`New ${sideLabel} list name`}
          onChange={(event) => setNewListName(event.target.value)}
          aria-label={`New ${sideLabel} list name`}
        />
        <button
          type="button"
          onClick={() => {
            onCreateList(newListName);
            setNewListName('');
          }}
        >
          Add List
        </button>
      </div>

      <label htmlFor={`${side}-list-name`}>{sideLabel} List Name</label>
      <input
        id={`${side}-list-name`}
        value={selectedList.name}
        onChange={(event) => onRenameList(selectedList.id, event.target.value)}
        disabled={!selectedList.id}
      />

      <div className="list-totals" aria-live="polite">
        <span>Operatives: {totals.count}</span>
        <span>APL Total: {totals.apl}</span>
        <span>Wounds Total: {totals.wounds}</span>
      </div>

      <button
        type="button"
        className="danger-button"
        onClick={() => onDeleteList(selectedList.id)}
        disabled={lists.length <= 1 || !selectedList.id}
      >
        Delete List
      </button>

      <label htmlFor={`${side}-team-select`}>{sideLabel} Team</label>
      <div className="input-row input-row-stack-mobile catalog-add-row">
        <select
          id={`${side}-team-select`}
          value={selectedTeamId}
          onChange={(event) => setSelectedTeamId(event.target.value)}
          aria-label={`${sideLabel} team selection`}
        >
          {side === 'npo' && <option value={ALL_TEAMS_ID}>All Teams</option>}
          {availableTeams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>

        <select
          value={selectedModelId}
          onChange={(event) => setSelectedModelId(event.target.value)}
          aria-label={`${sideLabel} model selection`}
        >
          {groupedCatalogOperatives.length === 0 && (
            <option value={CUSTOM_MODEL_ID}>Custom Model</option>
          )}
          {side === 'npo' && selectedTeamId === ALL_TEAMS_ID
            ? groupedCatalogOperatives.map(([teamName, operatives]) => (
                <optgroup key={teamName} label={teamName}>
                  {operatives.map((operative) => (
                    <option key={operative.id} value={operative.id}>
                      {operative.name}
                    </option>
                  ))}
                </optgroup>
              ))
            : groupedCatalogOperatives.flatMap(([, operatives]) =>
                operatives.map((operative) => (
                  <option key={operative.id} value={operative.id}>
                    {operative.name}
                  </option>
                ))
              )}
          <option value={CUSTOM_MODEL_ID}>Custom Model</option>
        </select>

        <select
          value={selectedProfileOverrideId}
          onChange={(event) => setSelectedProfileOverrideId(event.target.value)}
          aria-label={`${sideLabel} profile override`}
        >
          {!isCustomModel && (
            <option value="">
              {side === 'player'
                ? 'Default (Datacard)'
                : `Default (${selectedModelOperative?.profile.name ?? 'Model Profile'})`}
            </option>
          )}
          {selectableProfileOverrides.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => {
            if (!selectedList.id) return;
            if (isCustomModel) {
              if (!canAddCustomModel) return;
              onAddOperative(selectedList.id, {
                name: customModelText,
                profileId: selectedProfileOverrideId,
                modelId: CUSTOM_MODEL_ID,
                teamId:
                  selectedTeamId === ALL_TEAMS_ID ? undefined : selectedTeamId,
                teamName: selectedTeamName,
                customDescription: customModelText,
                requiresExplicitProfile: true,
                operativeType: 'custom',
                activationCardCount: 1,
              });
              setCustomModelDescription('');
              return;
            }
            if (!selectedModelOperative) return;
            onAddOperative(selectedList.id, {
              name: selectedModelOperative.name,
              profileId: operativeProfileId,
              modelId: selectedModelOperative.id,
              teamId: selectedModelOperative.teamId,
              teamName: selectedModelOperative.teamName,
              operativeType: 'catalog',
              activationCardCount: 1,
            });
          }}
          disabled={
            !selectedList.id ||
            (isCustomModel ? !canAddCustomModel : !selectedModelOperative)
          }
        >
          Add {sideLabel} Model
        </button>
      </div>

      {isCustomModel && (
        <label htmlFor={`${side}-custom-model-description`}>
          {sideLabel} Custom Model Description
        </label>
      )}
      {isCustomModel && (
        <input
          id={`${side}-custom-model-description`}
          value={customModelDescription}
          placeholder="Describe the custom model"
          onChange={(event) => setCustomModelDescription(event.target.value)}
          aria-label={`${sideLabel} custom model description`}
        />
      )}

      <label htmlFor={`${side}-nemesis-selection`}>{sideLabel} Nemesis</label>
      <div className="input-row input-row-stack-mobile catalog-add-row">
        <select
          id={`${side}-nemesis-selection`}
          value={selectedNemesisId}
          onChange={(event) => setSelectedNemesisId(event.target.value)}
          aria-label={`${sideLabel} nemesis operative selection`}
        >
          {nemesisOperatives.length === 0 ? (
            <option value="">No nemesis operatives created yet</option>
          ) : (
            nemesisOperatives.map((nemesis) => (
              <option key={nemesis.id} value={nemesis.id}>
                {nemesis.name}
              </option>
            ))
          )}
        </select>
        <button
          type="button"
          onClick={() => {
            if (!selectedList.id || !selectedNemesisId) return;
            onAddNemesisOperative(selectedList.id, selectedNemesisId);
          }}
          disabled={!selectedList.id || !selectedNemesisId}
        >
          Add Nemesis Operative
        </button>
      </div>

      <ul>
        {selectedList.operatives.map((operative) => {
          const profileName =
            operative.profileId === DATACARD_PROFILE_ID
              ? 'Datacard'
              : (profileLookup.get(operative.profileId)?.name ??
                'Unknown Profile');
          return (
            <li key={operative.id}>
              <span>
                {operative.name}{' '}
                <small>({operative.teamName ?? 'Unknown Team'})</small>
                <br />
                <small>
                  Profile: {profileName}
                  {operative.requiresExplicitProfile ? ' (required)' : ''}
                </small>
              </span>
              <button
                type="button"
                onClick={() => onRemoveOperative(selectedList.id, operative.id)}
              >
                Remove
              </button>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

function ProfileWeaponEditor({
  title,
  weapons,
  onChange,
}: {
  title: string;
  weapons: SoloWeaponProfile[];
  onChange: (next: SoloWeaponProfile[]) => void;
}) {
  return (
    <section className="profile-weapon-group">
      <h5>{title}</h5>
      {weapons.map((weapon) => (
        <div className="weapon-editor" key={weapon.id}>
          <input
            aria-label={`${title} name ${weapon.id}`}
            value={weapon.name}
            onChange={(event) =>
              onChange(
                weapons.map((item) =>
                  item.id === weapon.id
                    ? { ...item, name: event.target.value }
                    : item
                )
              )
            }
            placeholder="Name"
          />
          <input
            type="number"
            aria-label={`${title} attacks ${weapon.id}`}
            min={1}
            value={weapon.attacks}
            onChange={(event) =>
              onChange(
                weapons.map((item) =>
                  item.id === weapon.id
                    ? {
                        ...item,
                        attacks: Math.max(1, Number(event.target.value) || 1),
                      }
                    : item
                )
              )
            }
            placeholder="Attacks"
          />
          <input
            aria-label={`${title} skill ${weapon.id}`}
            value={weapon.skill}
            onChange={(event) =>
              onChange(
                weapons.map((item) =>
                  item.id === weapon.id
                    ? { ...item, skill: event.target.value }
                    : item
                )
              )
            }
            placeholder="Skill (e.g. 3+)"
          />
          <input
            aria-label={`${title} damage ${weapon.id}`}
            value={weapon.damage}
            onChange={(event) =>
              onChange(
                weapons.map((item) =>
                  item.id === weapon.id
                    ? { ...item, damage: event.target.value }
                    : item
                )
              )
            }
            placeholder="Damage"
          />
          <input
            aria-label={`${title} critical damage ${weapon.id}`}
            value={weapon.criticalDamage}
            onChange={(event) =>
              onChange(
                weapons.map((item) =>
                  item.id === weapon.id
                    ? { ...item, criticalDamage: event.target.value }
                    : item
                )
              )
            }
            placeholder="Crit Damage"
          />
          <input
            aria-label={`${title} special rules ${weapon.id}`}
            value={weapon.specialRules}
            onChange={(event) =>
              onChange(
                weapons.map((item) =>
                  item.id === weapon.id
                    ? { ...item, specialRules: event.target.value }
                    : item
                )
              )
            }
            placeholder="Special Rules"
          />
          <button
            type="button"
            onClick={() =>
              onChange(weapons.filter((item) => item.id !== weapon.id))
            }
            disabled={weapons.length <= 1}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...weapons, defaultWeapon(`${title} Weapon`)])}
      >
        Add {title} Weapon
      </button>
    </section>
  );
}

export function SoloJointOpsView() {
  const initialState = useMemo(() => loadState(), []);
  const [activeTab, setActiveTab] = useState<SoloTab>('game-runner');
  const [activeListBuilderSide, setActiveListBuilderSide] =
    useState<ActivationSide>('npo');
  const [activeTeamSetupPane, setActiveTeamSetupPane] =
    useState<TeamSetupPane>('npo');
  const [state, setState] = useState<SoloJointOpsState>(initialState);
  const [runnerOperatives, setRunnerOperatives] = useState<RunnerOperative[]>(
    []
  );
  const [selectedPlayerTeamForList, setSelectedPlayerTeamForList] = useState(
    () =>
      operativeCatalog.teams.find((team) => team.id !== NPO_OPERATIVES_TEAM_ID)
        ?.id ?? ''
  );
  const [selectedNpoTeamForList, setSelectedNpoTeamForList] = useState(
    NPO_OPERATIVES_TEAM_ID
  );
  const [newPlayerTeamName, setNewPlayerTeamName] = useState('');
  const [newNpoTeamName, setNewNpoTeamName] = useState('');
  const [editingProfileId, setEditingProfileId] = useState(
    initialState.profiles[0]?.id ?? ''
  );
  const [newNemesisName, setNewNemesisName] = useState('');
  const [newNemesisSize, setNewNemesisSize] = useState<NemesisSize>('small');
  const [customNemesisControl, setCustomNemesisControl] = useState(5);
  const [customNemesisMove, setCustomNemesisMove] = useState('6"');
  const [customNemesisSave, setCustomNemesisSave] = useState('4+');
  const [customNemesisWounds, setCustomNemesisWounds] = useState(50);
  const [showExtendedNemesisWeapons, setShowExtendedNemesisWeapons] =
    useState(false);
  const [isRangedNemesisEditorOpen, setIsRangedNemesisEditorOpen] =
    useState(false);
  const [isMeleeNemesisEditorOpen, setIsMeleeNemesisEditorOpen] =
    useState(false);
  const [selectedNemesisRangedWeaponIds, setSelectedNemesisRangedWeaponIds] =
    useState<string[]>([]);
  const [selectedNemesisMeleeWeaponIds, setSelectedNemesisMeleeWeaponIds] =
    useState<string[]>([]);
  const [
    selectedNemesisAllegianceTraitIds,
    setSelectedNemesisAllegianceTraitIds,
  ] = useState<string[]>([]);
  const [selectedNemesisTraitIds, setSelectedNemesisTraitIds] = useState<
    string[]
  >([]);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [transferHint, setTransferHint] = useState<TransferHint | null>(null);
  // Ephemeral draw-pile: card IDs in shuffled order, reset via Reset Deck
  const [drawPile, setDrawPile] = useState<string[]>([]);
  const [drawnCardId, setDrawnCardId] = useState<string | null>(null);
  const [editingDeckCardId, setEditingDeckCardId] = useState<string | null>(
    null
  );
  const [isDeckSetupOpen, setIsDeckSetupOpen] = useState(false);
  const [isTeamSetupOpen, setIsTeamSetupOpen] = useState(false);

  const listsImportRef = useRef<HTMLInputElement | null>(null);
  const profilesImportRef = useRef<HTMLInputElement | null>(null);

  const playerLists = useMemo(
    () => state.lists.filter((list) => list.side === 'player'),
    [state.lists]
  );
  const npoLists = useMemo(
    () => state.lists.filter((list) => list.side === 'npo'),
    [state.lists]
  );
  const playerTeams = useMemo(
    () => state.teams.filter((team) => team.side === 'player'),
    [state.teams]
  );
  const npoTeams = useMemo(
    () => state.teams.filter((team) => team.side === 'npo'),
    [state.teams]
  );

  const selectedPlayerList =
    playerLists.find((list) => list.id === state.selectedPlayerListId) ??
    playerLists[0] ??
    null;
  const selectedNpoList =
    npoLists.find((list) => list.id === state.selectedNpoListId) ??
    npoLists[0] ??
    null;
  const selectedPlayerTeam =
    playerTeams.find((team) => team.id === state.selectedPlayerTeamId) ??
    playerTeams[0] ??
    null;
  const selectedNpoTeam =
    npoTeams.find((team) => team.id === state.selectedNpoTeamId) ??
    npoTeams[0] ??
    null;

  const profileLookup = useMemo(() => {
    const map = new Map<string, SoloProfile>();

    operativeCatalog.operatives.forEach((operative) => {
      map.set(operative.profile.id, operative.profile);
    });

    state.profiles.forEach((profile) => {
      map.set(profile.id, profile);
    });

    return map;
  }, [state.profiles]);

  const playerCatalogTeams = useMemo(
    () =>
      operativeCatalog.teams.filter(
        (team) => team.id !== NPO_OPERATIVES_TEAM_ID
      ),
    []
  );

  const npoCatalogTeams = useMemo(() => operativeCatalog.teams, []);

  const getTeamSourceList = (team: SoloTeam | null) => {
    if (!team) return null;
    return state.lists.find((list) => list.id === team.sourceListId) ?? null;
  };

  const pickNpoOperativeIds = (
    operatives: SoloListOperative[],
    selectionRule: NpoTeamSelectionRule,
    autoWoundsLimit: number
  ) => {
    const withProfiles = operatives.map((operative) => ({
      operative,
      profile:
        operative.profileId === DATACARD_PROFILE_ID
          ? null
          : (profileLookup.get(operative.profileId) ?? null),
    }));

    let ordered = withProfiles;
    if (selectionRule === 'random') {
      ordered = shuffle(withProfiles);
    } else if (selectionRule === 'melee-heavy') {
      ordered = [...withProfiles].sort(
        (a, b) => getMeleeScore(b.profile) - getMeleeScore(a.profile)
      );
    } else if (selectionRule === 'ranged-heavy') {
      ordered = [...withProfiles].sort(
        (a, b) => getRangedScore(b.profile) - getRangedScore(a.profile)
      );
    } else if (selectionRule === 'elite') {
      ordered = [...withProfiles].sort(
        (a, b) => (b.profile?.wounds ?? 0) - (a.profile?.wounds ?? 0)
      );
    } else if (selectionRule === 'horde') {
      ordered = [...withProfiles].sort(
        (a, b) => (a.profile?.wounds ?? 0) - (b.profile?.wounds ?? 0)
      );
    }

    if (selectionRule === 'manual') {
      return ordered.map((entry) => entry.operative.id);
    }

    const woundsLimit = Math.max(0, autoWoundsLimit);
    if (woundsLimit === 0) {
      return ordered.map((entry) => entry.operative.id);
    }

    const picked: string[] = [];
    let totalWounds = 0;

    ordered.forEach(({ operative, profile }) => {
      const wounds = Math.max(0, profile?.wounds ?? 0);
      const nextTotal = totalWounds + wounds;
      if (picked.length === 0 || nextTotal <= woundsLimit) {
        picked.push(operative.id);
        totalWounds = nextTotal;
      }
    });

    return picked;
  };

  const selectedPlayerTeamOperatives = useMemo(() => {
    if (!selectedPlayerTeam) return [];
    const sourceList = state.lists.find(
      (list) => list.id === selectedPlayerTeam.sourceListId
    );
    if (!sourceList) return [];
    const allowedIds = new Set(selectedPlayerTeam.operativeIds);
    return sourceList.operatives.filter((operative) =>
      allowedIds.has(operative.id)
    );
  }, [selectedPlayerTeam, state.lists]);

  const selectedNpoTeamOperatives = useMemo(() => {
    if (!selectedNpoTeam) return [];
    const sourceList = state.lists.find(
      (list) => list.id === selectedNpoTeam.sourceListId
    );
    if (!sourceList) return [];
    const allowedIds = new Set(selectedNpoTeam.operativeIds);
    return sourceList.operatives.filter((operative) =>
      allowedIds.has(operative.id)
    );
  }, [selectedNpoTeam, state.lists]);

  const isGameSetupComplete =
    !!selectedNpoTeam && selectedNpoTeamOperatives.length > 0;

  const npoRunnerOperatives = useMemo(
    () => runnerOperatives.filter((operative) => operative.side === 'npo'),
    [runnerOperatives]
  );

  const npoRunnerOperativeNames = useMemo(
    () =>
      new Map(
        npoRunnerOperatives.map((operative) => [
          operative.sourceOperativeId,
          operative.name,
        ])
      ),
    [npoRunnerOperatives]
  );

  const currentDrawnCard = useMemo(
    () => state.activationDeck.find((card) => card.id === drawnCardId) ?? null,
    [drawnCardId, state.activationDeck]
  );

  const currentActivatedOperatives = useMemo(() => {
    if (!currentDrawnCard) return [];
    const linkedIds = new Set(currentDrawnCard.operativeIds);
    return npoRunnerOperatives.filter(
      (operative) =>
        linkedIds.has(operative.sourceOperativeId) && !operative.incapacitated
    );
  }, [currentDrawnCard, npoRunnerOperatives]);

  const currentDrawnCardLinkedNames = useMemo(
    () => currentActivatedOperatives.map((operative) => operative.name),
    [currentActivatedOperatives]
  );

  const totalDeckCardInstances = useMemo(
    () =>
      state.activationDeck.reduce(
        (total, card) => total + Math.max(1, Math.floor(card.count || 1)),
        0
      ),
    [state.activationDeck]
  );

  useEffect(() => {
    if (!hasLocalStorageApi()) {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (
      !playerCatalogTeams.some((team) => team.id === selectedPlayerTeamForList)
    ) {
      setSelectedPlayerTeamForList(playerCatalogTeams[0]?.id ?? '');
    }
  }, [playerCatalogTeams, selectedPlayerTeamForList]);

  useEffect(() => {
    if (!npoCatalogTeams.some((team) => team.id === selectedNpoTeamForList)) {
      setSelectedNpoTeamForList(NPO_OPERATIVES_TEAM_ID);
    }
  }, [npoCatalogTeams, selectedNpoTeamForList]);

  useEffect(() => {
    if (!editingProfileId || !profileLookup.has(editingProfileId)) {
      setEditingProfileId(state.profiles[0]?.id ?? '');
    }
  }, [editingProfileId, profileLookup, state.profiles]);

  useEffect(() => {
    if (!playerTeams.some((team) => team.id === state.selectedPlayerTeamId)) {
      setState((prev) => ({
        ...prev,
        selectedPlayerTeamId: playerTeams[0]?.id ?? '',
      }));
    }
  }, [playerTeams, state.selectedPlayerTeamId]);

  useEffect(() => {
    if (!npoTeams.some((team) => team.id === state.selectedNpoTeamId)) {
      setState((prev) => ({
        ...prev,
        selectedNpoTeamId: npoTeams[0]?.id ?? '',
      }));
    }
  }, [npoTeams, state.selectedNpoTeamId]);

  useEffect(() => {
    const teamListPairs = state.teams.map((team) => {
      const fallbackListId =
        team.side === 'player'
          ? (playerLists[0]?.id ?? '')
          : (npoLists[0]?.id ?? '');
      const sourceListId = state.lists.some(
        (list) => list.id === team.sourceListId
      )
        ? team.sourceListId
        : fallbackListId;
      const sourceList = state.lists.find((list) => list.id === sourceListId);
      const filteredIds = sourceList
        ? team.operativeIds.filter((operativeId) =>
            sourceList.operatives.some(
              (operative) => operative.id === operativeId
            )
          )
        : [];
      return { team, sourceListId, filteredIds };
    });

    const needsRepair = teamListPairs.some(
      ({ team, sourceListId, filteredIds }) =>
        sourceListId !== team.sourceListId ||
        filteredIds.length !== team.operativeIds.length
    );

    if (!needsRepair) return;

    setState((prev) => ({
      ...prev,
      teams: prev.teams.map((team) => {
        const next = teamListPairs.find((pair) => pair.team.id === team.id);
        if (!next) return team;
        return {
          ...team,
          sourceListId: next.sourceListId,
          operativeIds: next.filteredIds,
        };
      }),
    }));
  }, [npoLists, playerLists, state.lists, state.teams]);

  useEffect(() => {
    const activeOperatives = [
      ...selectedPlayerTeamOperatives.map((operative) => ({
        ...operative,
        side: 'player' as const,
      })),
      ...selectedNpoTeamOperatives.map((operative) => ({
        ...operative,
        side: 'npo' as const,
      })),
    ];

    setRunnerOperatives((prev) => {
      const existing = new Map(
        prev.map((operative) => [
          `${operative.side}:${operative.sourceOperativeId}`,
          operative,
        ])
      );

      return activeOperatives.map((operative) => {
        const key = `${operative.side}:${operative.id}`;
        const persisted = existing.get(key);
        return {
          id: persisted?.id ?? generateUniqueId('runner-op'),
          sourceOperativeId: operative.id,
          side: operative.side,
          name: operative.name,
          profileId: operative.profileId,
          activationCardCount: Math.max(
            1,
            persisted?.activationCardCount ?? operative.activationCardCount ?? 1
          ),
          damageTaken: persisted?.damageTaken ?? 0,
          injured: persisted?.injured ?? false,
          incapacitated: persisted?.incapacitated ?? false,
        };
      });
    });
  }, [selectedNpoTeamOperatives, selectedPlayerTeamOperatives]);

  const updateState = (updates: Partial<SoloJointOpsState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const addList = (side: ActivationSide, name: string) => {
    const normalized = name.trim();
    if (!normalized) return;
    const newList: SoloList = {
      id: generateUniqueId('list'),
      name: normalized,
      side,
      operatives: [],
    };
    setState((prev) => ({
      ...prev,
      lists: [...prev.lists, newList],
      ...(side === 'player'
        ? { selectedPlayerListId: newList.id }
        : { selectedNpoListId: newList.id }),
    }));
  };

  const addTeam = (side: ActivationSide, name: string) => {
    const normalized = name.trim();
    if (!normalized) return;

    const sourceList = state.lists.find((list) => list.side === side);
    if (!sourceList) return;

    const team: SoloTeam = {
      id: generateUniqueId('team'),
      name: normalized,
      side,
      sourceListId: sourceList.id,
      operativeIds: [],
      selectionRule: 'manual',
      autoWoundsLimit: side === 'npo' ? 20 : 0,
    };

    setState((prev) => ({
      ...prev,
      teams: [...prev.teams, team],
      ...(side === 'player'
        ? { selectedPlayerTeamId: team.id }
        : { selectedNpoTeamId: team.id }),
    }));
  };

  const updateTeam = (teamId: string, updates: Partial<SoloTeam>) => {
    setState((prev) => ({
      ...prev,
      teams: prev.teams.map((team) =>
        team.id === teamId ? { ...team, ...updates } : team
      ),
    }));
  };

  const deleteTeam = (teamId: string) => {
    setState((prev) => {
      const team = prev.teams.find((item) => item.id === teamId);
      if (!team) return prev;

      const remaining = prev.teams.filter((item) => item.id !== teamId);
      const sameSide = remaining.filter((item) => item.side === team.side);
      if (sameSide.length === 0) return prev;

      return {
        ...prev,
        teams: remaining,
        ...(team.side === 'player'
          ? {
              selectedPlayerTeamId:
                prev.selectedPlayerTeamId === teamId
                  ? sameSide[0].id
                  : prev.selectedPlayerTeamId,
            }
          : {
              selectedNpoTeamId:
                prev.selectedNpoTeamId === teamId
                  ? sameSide[0].id
                  : prev.selectedNpoTeamId,
            }),
      };
    });
  };

  const toggleTeamOperative = (teamId: string, operativeId: string) => {
    setState((prev) => ({
      ...prev,
      teams: prev.teams.map((team) => {
        if (team.id !== teamId) return team;
        const hasOperative = team.operativeIds.includes(operativeId);
        return {
          ...team,
          operativeIds: hasOperative
            ? team.operativeIds.filter((id) => id !== operativeId)
            : [...team.operativeIds, operativeId],
        };
      }),
    }));
  };

  const moveTeamOperative = (
    team: SoloTeam,
    operativeId: string,
    direction: TransferDirection
  ) => {
    const hasOperative = team.operativeIds.includes(operativeId);
    if (direction === 'to-selected' && hasOperative) return;
    if (direction === 'to-unselected' && !hasOperative) return;

    toggleTeamOperative(team.id, operativeId);
    setTransferHint({ teamId: team.id, operativeId, direction });
  };

  const applyNpoTeamSelectionRule = (teamId: string) => {
    setState((prev) => {
      const team = prev.teams.find((item) => item.id === teamId);
      if (!team || team.side !== 'npo') return prev;

      const sourceList = prev.lists.find(
        (list) => list.id === team.sourceListId
      );
      if (!sourceList) return prev;

      const operativeIds = pickNpoOperativeIds(
        sourceList.operatives,
        team.selectionRule,
        team.autoWoundsLimit
      );

      return {
        ...prev,
        teams: prev.teams.map((item) =>
          item.id === teamId ? { ...item, operativeIds } : item
        ),
      };
    });
  };

  const renameList = (listId: string, name: string) => {
    const normalized = name.trim();
    setState((prev) => ({
      ...prev,
      lists: prev.lists.map((list) =>
        list.id === listId ? { ...list, name: normalized || list.name } : list
      ),
    }));
  };

  const deleteList = (listId: string) => {
    setState((prev) => {
      const target = prev.lists.find((list) => list.id === listId);
      if (!target) return prev;
      const remaining = prev.lists.filter((list) => list.id !== listId);
      const sameSide = remaining.filter((list) => list.side === target.side);
      if (sameSide.length === 0) return prev;

      return {
        ...prev,
        lists: remaining,
        teams: prev.teams.map((team) => {
          if (team.sourceListId !== listId) return team;
          return {
            ...team,
            sourceListId: sameSide[0].id,
            operativeIds: [],
          };
        }),
        ...(target.side === 'player'
          ? {
              selectedPlayerListId:
                prev.selectedPlayerListId === listId
                  ? sameSide[0].id
                  : prev.selectedPlayerListId,
            }
          : {
              selectedNpoListId:
                prev.selectedNpoListId === listId
                  ? sameSide[0].id
                  : prev.selectedNpoListId,
            }),
      };
    });
  };

  const addOperativeToList = (
    listId: string,
    operative: AddListOperativeInput
  ) => {
    setState((prev) => ({
      ...prev,
      lists: prev.lists.map((list) =>
        list.id === listId
          ? {
              ...list,
              operatives: [
                ...list.operatives,
                {
                  id: generateUniqueId('list-op'),
                  name: operative.name,
                  profileId: operative.profileId,
                  modelId: operative.modelId,
                  teamId: operative.teamId,
                  teamName: operative.teamName,
                  customDescription: operative.customDescription,
                  requiresExplicitProfile: operative.requiresExplicitProfile,
                  operativeType: operative.operativeType,
                  nemesisId: operative.nemesisId,
                  activationCardCount: operative.activationCardCount,
                },
              ],
            }
          : list
      ),
    }));
  };

  const addNemesisToList = (listId: string, nemesisId: string) => {
    const list = state.lists.find((item) => item.id === listId);
    const nemesis = state.nemesisOperatives.find(
      (item) => item.id === nemesisId
    );
    if (!list || !nemesis) return;

    addOperativeToList(listId, {
      name: nemesis.name,
      profileId: nemesis.profileId,
      teamId: NEMESIS_TEAM_ID,
      teamName: 'Nemesis',
      modelId: `nemesis:${nemesis.id}`,
      operativeType: 'nemesis',
      nemesisId: nemesis.id,
      activationCardCount: list.side === 'npo' ? 2 : 1,
      requiresExplicitProfile: true,
    });
  };

  const removeOperativeFromList = (listId: string, operativeId: string) => {
    setState((prev) => ({
      ...prev,
      lists: prev.lists.map((list) =>
        list.id === listId
          ? {
              ...list,
              operatives: list.operatives.filter(
                (operative) => operative.id !== operativeId
              ),
            }
          : list
      ),
      teams: prev.teams.map((team) => ({
        ...team,
        operativeIds: team.operativeIds.filter((id) => id !== operativeId),
      })),
    }));
  };

  const updateRunnerOperative = (
    operativeId: string,
    updates: Partial<RunnerOperative>
  ) => {
    setRunnerOperatives((prev) =>
      prev.map((operative) =>
        operative.id === operativeId ? { ...operative, ...updates } : operative
      )
    );
  };

  // --- Activation Deck helpers ---

  /** Returns true if every operative linked to a card is incapacitated. */
  const isCardExhausted = (
    card: ActivationCard,
    ops: RunnerOperative[]
  ): boolean => {
    if (card.operativeIds.length === 0) return false;
    const incapacitatedIds = new Set(
      ops
        .filter((op) => op.side === 'npo' && op.incapacitated)
        .map((op) => op.sourceOperativeId)
    );
    return card.operativeIds.every((id) => incapacitatedIds.has(id));
  };

  /** Builds a shuffled draw pile from the deck, excluding exhausted cards. */
  const buildShuffledPile = (
    deck: ActivationCard[],
    ops: RunnerOperative[]
  ): string[] =>
    shuffle(
      deck
        .filter((card) => !isCardExhausted(card, ops))
        .flatMap((card) =>
          Array.from(
            { length: Math.max(1, Math.floor(card.count || 1)) },
            () => card.id
          )
        )
    );

  /** Auto-generates default cards from NPO runner operatives. */
  const buildDeckFromNpoOperatives = (
    ops: RunnerOperative[]
  ): ActivationCard[] =>
    ops
      .filter((op) => op.side === 'npo')
      .map((op) => ({
        id: generateUniqueId('deck-card'),
        label: op.name,
        operativeIds: [op.sourceOperativeId],
        count: Math.max(1, op.activationCardCount),
      }));

  const addDeckCard = () => {
    const card: ActivationCard = {
      id: generateUniqueId('deck-card'),
      label: 'New Card',
      operativeIds: [],
      count: 1,
    };
    setState((prev) => ({
      ...prev,
      activationDeck: [...prev.activationDeck, card],
    }));
    setEditingDeckCardId(card.id);
  };

  const updateDeckCard = (cardId: string, updates: Partial<ActivationCard>) => {
    setState((prev) => ({
      ...prev,
      activationDeck: prev.activationDeck.map((c) =>
        c.id === cardId ? { ...c, ...updates } : c
      ),
    }));
  };

  const removeDeckCard = (cardId: string) => {
    setState((prev) => ({
      ...prev,
      activationDeck: prev.activationDeck.filter((c) => c.id !== cardId),
    }));
    setDrawPile((prev) => prev.filter((id) => id !== cardId));
    if (drawnCardId === cardId) setDrawnCardId(null);
    if (editingDeckCardId === cardId) setEditingDeckCardId(null);
  };

  // --- Activation flow ---

  const resetActivationDeck = () => {
    setState((prev) => {
      let deck = prev.activationDeck;
      if (deck.length === 0) {
        deck = buildDeckFromNpoOperatives(runnerOperatives);
        setIsDeckSetupOpen(false);
      }
      const pile = buildShuffledPile(deck, runnerOperatives);
      setDrawPile(pile);
      setDrawnCardId(null);
      return {
        ...prev,
        activationDeck: deck,
        activationNumber: 0,
        activeSide: 'npo',
      };
    });
  };

  const drawNextNpoCard = (
    pile: string[],
    deck: ActivationCard[],
    ops: RunnerOperative[]
  ): { cardId: string | null; remaining: string[] } => {
    const remaining = [...pile];
    while (remaining.length > 0) {
      const cardId = remaining.shift()!;
      const card = deck.find((c) => c.id === cardId);
      if (!card || isCardExhausted(card, ops)) continue;
      return { cardId, remaining };
    }
    return { cardId: null, remaining: [] };
  };

  const drawActivation = () => {
    setState((prev) => {
      const { cardId, remaining } = drawNextNpoCard(
        drawPile,
        prev.activationDeck,
        runnerOperatives
      );

      setDrawPile(remaining);
      setDrawnCardId(cardId);

      if (!cardId) {
        return prev;
      }

      return {
        ...prev,
        activationNumber: prev.activationNumber + 1,
        activeSide: 'npo',
      };
    });
  };

  const createProfile = () => {
    const profile = defaultProfile();
    setState((prev) => ({ ...prev, profiles: [...prev.profiles, profile] }));
    setEditingProfileId(profile.id);
  };

  const updateProfile = (profileId: string, updates: Partial<SoloProfile>) => {
    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((profile) =>
        profile.id === profileId ? { ...profile, ...updates } : profile
      ),
    }));
  };

  const deleteProfile = (profileId: string) => {
    setState((prev) => {
      if (prev.profiles.length <= 1) return prev;

      const nextProfiles = prev.profiles.filter(
        (profile) => profile.id !== profileId
      );
      const fallbackProfileId = nextProfiles[0]?.id ?? '';

      return {
        ...prev,
        profiles: nextProfiles,
        lists: prev.lists.map((list) => ({
          ...list,
          operatives: list.operatives.map((operative) =>
            operative.profileId === profileId
              ? {
                  ...operative,
                  profileId: operative.requiresExplicitProfile
                    ? fallbackProfileId || operative.profileId
                    : list.side === 'player'
                      ? DATACARD_PROFILE_ID
                      : fallbackProfileId || operative.profileId,
                }
              : operative
          ),
        })),
      };
    });
  };

  const createNemesisOperative = () => {
    const normalizedName = newNemesisName.trim();
    if (!normalizedName) return;

    const selectedRangedWeapons = selectedNemesisRangedWeaponIds
      .map(
        (weaponId) =>
          nemesisRangedWeaponOptions.find((option) => option.id === weaponId)
            ?.profile
      )
      .filter((weapon): weapon is SoloWeaponProfile => Boolean(weapon))
      .map((weapon) => ({
        ...weapon,
        id: generateUniqueId('weapon'),
      }));
    const selectedMeleeWeapons = selectedNemesisMeleeWeaponIds
      .map(
        (weaponId) =>
          nemesisMeleeWeaponOptions.find((option) => option.id === weaponId)
            ?.profile
      )
      .filter((weapon): weapon is SoloWeaponProfile => Boolean(weapon))
      .map((weapon) => ({
        ...weapon,
        id: generateUniqueId('weapon'),
      }));

    const resolvedStats =
      newNemesisSize === 'custom'
        ? {
            control: Math.max(1, customNemesisControl),
            move: customNemesisMove.trim() || '6"',
            save: customNemesisSave.trim() || '4+',
            wounds: Math.max(1, customNemesisWounds),
          }
        : NEMESIS_SIZE_PRESETS[newNemesisSize];

    const profileId = generateUniqueId('nemesis-profile');
    const nemesisId = generateUniqueId('nemesis');
    const profile: SoloProfile = {
      id: profileId,
      name: `${normalizedName} (Nemesis)`,
      apl: resolvedStats.control,
      move: resolvedStats.move,
      save: resolvedStats.save,
      wounds: resolvedStats.wounds,
      rangedWeapons: selectedRangedWeapons,
      meleeWeapons: selectedMeleeWeapons,
      behaviorRules: '',
      usesControlStat: true,
      allegianceTraits: selectedNemesisAllegianceTraitIds,
      nemesisTraits: selectedNemesisTraitIds,
    };

    const nemesisOperative: NemesisOperative = {
      id: nemesisId,
      name: normalizedName,
      size: newNemesisSize,
      profileId,
      rangedWeapons: selectedRangedWeapons,
      meleeWeapons: selectedMeleeWeapons,
      allegianceTraits: selectedNemesisAllegianceTraitIds,
      nemesisTraits: selectedNemesisTraitIds,
    };

    setState((prev) => ({
      ...prev,
      profiles: [...prev.profiles, profile],
      nemesisOperatives: [...prev.nemesisOperatives, nemesisOperative],
    }));
    setNewNemesisName('');
    setSelectedNemesisAllegianceTraitIds([]);
    setSelectedNemesisTraitIds([]);
  };

  const deleteNemesisOperative = (nemesisId: string) => {
    setState((prev) => {
      const target = prev.nemesisOperatives.find(
        (item) => item.id === nemesisId
      );
      if (!target) return prev;

      const removedOperativeIds = new Set<string>();
      const nextLists = prev.lists.map((list) => ({
        ...list,
        operatives: list.operatives.filter((operative) => {
          const matches = operative.nemesisId === nemesisId;
          if (matches) {
            removedOperativeIds.add(operative.id);
          }
          return !matches;
        }),
      }));

      return {
        ...prev,
        nemesisOperatives: prev.nemesisOperatives.filter(
          (item) => item.id !== nemesisId
        ),
        profiles: prev.profiles.filter(
          (profile) => profile.id !== target.profileId
        ),
        lists: nextLists,
        teams: prev.teams.map((team) => ({
          ...team,
          operativeIds: team.operativeIds.filter(
            (id) => !removedOperativeIds.has(id)
          ),
        })),
      };
    });
  };

  /**
   * Serializes backup payload JSON and triggers a browser download.
   * Creates and revokes a temporary object URL for cleanup.
   */
  const downloadBackup = (fileName: string, payload: object) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const exportLists = () => {
    downloadBackup('solo-joint-ops-lists.json', {
      schemaVersion: 1,
      lists: state.lists,
      teams: state.teams,
    });
  };

  const exportProfiles = () => {
    downloadBackup('solo-joint-ops-profiles.json', {
      schemaVersion: 1,
      profiles: state.profiles,
      nemesisOperatives: state.nemesisOperatives,
    });
  };

  const handleListsImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const content = await readFile(file);
      const parsed = JSON.parse(content) as SoloBackupFile;
      const importedLists = Array.isArray(parsed.lists)
        ? parsed.lists.filter(isValidList)
        : [];
      const importedTeams = Array.isArray(parsed.teams)
        ? parsed.teams.filter(isValidTeam)
        : [];

      if (importedLists.length === 0) {
        setImportMessage('No valid lists were found in this backup file.');
        return;
      }

      if (
        !importedLists.some((list) => list.side === 'player') ||
        !importedLists.some((list) => list.side === 'npo')
      ) {
        setImportMessage(
          'Backup must include at least one player list and one NPO list.'
        );
        return;
      }

      const firstPlayer = importedLists.find((list) => list.side === 'player');
      const firstNpo = importedLists.find((list) => list.side === 'npo');
      if (!firstPlayer || !firstNpo) return;

      setState((prev) => {
        const candidateTeams =
          importedTeams.length > 0 ? importedTeams : prev.teams;

        const remappedTeams = candidateTeams.map((team) => {
          const fallbackListId =
            team.side === 'player' ? firstPlayer.id : firstNpo.id;
          const sourceListId = importedLists.some(
            (list) => list.id === team.sourceListId && list.side === team.side
          )
            ? team.sourceListId
            : fallbackListId;
          const sourceList = importedLists.find(
            (list) => list.id === sourceListId
          );

          return {
            ...team,
            sourceListId,
            operativeIds: sourceList
              ? team.operativeIds.filter((operativeId) =>
                  sourceList.operatives.some(
                    (operative) => operative.id === operativeId
                  )
                )
              : [],
          };
        });

        const fallbackTeams = createDefaultTeams(
          { player: firstPlayer, npo: firstNpo },
          {
            player: prev.teams.find((team) => team.side === 'player')?.name,
            npo: prev.teams.find((team) => team.side === 'npo')?.name,
          }
        );

        const nextTeams = [...remappedTeams];
        if (!nextTeams.some((team) => team.side === 'player')) {
          nextTeams.push(fallbackTeams.player);
        }
        if (!nextTeams.some((team) => team.side === 'npo')) {
          nextTeams.push(fallbackTeams.npo);
        }

        const selectedPlayerTeamId = nextTeams.some(
          (team) =>
            team.side === 'player' && team.id === prev.selectedPlayerTeamId
        )
          ? prev.selectedPlayerTeamId
          : (nextTeams.find((team) => team.side === 'player')?.id ?? '');

        const selectedNpoTeamId = nextTeams.some(
          (team) => team.side === 'npo' && team.id === prev.selectedNpoTeamId
        )
          ? prev.selectedNpoTeamId
          : (nextTeams.find((team) => team.side === 'npo')?.id ?? '');

        return {
          ...prev,
          lists: importedLists,
          teams: nextTeams,
          selectedPlayerListId: firstPlayer.id,
          selectedNpoListId: firstNpo.id,
          selectedPlayerTeamId,
          selectedNpoTeamId,
        };
      });
      setImportMessage(`Imported ${importedLists.length} list(s).`);
    } catch (error) {
      setImportMessage(
        error instanceof SyntaxError
          ? 'Unable to import lists: invalid JSON format.'
          : 'Unable to import lists. Ensure the file contains valid list backup data.'
      );
    } finally {
      event.target.value = '';
    }
  };

  const handleProfilesImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const content = await readFile(file);
      const parsed = JSON.parse(content) as SoloBackupFile;
      const importedProfiles = Array.isArray(parsed.profiles)
        ? parsed.profiles.filter(isValidProfile)
        : [];
      const importedNemesisOperatives = Array.isArray(parsed.nemesisOperatives)
        ? parsed.nemesisOperatives.flatMap((entry) => {
            if (!entry || typeof entry !== 'object') return [];
            const legacy = entry as Partial<NemesisOperative>;
            const normalized = {
              ...legacy,
              rangedWeapons: Array.isArray(legacy.rangedWeapons)
                ? legacy.rangedWeapons
                : [],
              meleeWeapons: Array.isArray(legacy.meleeWeapons)
                ? legacy.meleeWeapons
                : [],
            };

            return isValidNemesisOperative(normalized) ? [normalized] : [];
          })
        : [];

      if (importedProfiles.length === 0) {
        setImportMessage('No valid profiles were found in this backup file.');
        return;
      }

      setState((prev) => ({
        ...prev,
        profiles: importedProfiles,
        nemesisOperatives: importedNemesisOperatives,
      }));
      setEditingProfileId(importedProfiles[0].id);
      setImportMessage(`Imported ${importedProfiles.length} profile(s).`);
    } catch (error) {
      setImportMessage(
        error instanceof SyntaxError
          ? 'Unable to import profiles: invalid JSON format.'
          : 'Unable to import profiles. Ensure the file contains valid profile backup data.'
      );
    } finally {
      event.target.value = '';
    }
  };

  const activeProfile =
    state.profiles.find((profile) => profile.id === editingProfileId) ?? null;
  const consolidatedRangedWeaponPool = useMemo(
    () =>
      dedupeWeapons(
        operativeCatalog.operatives.flatMap(
          (operative) => operative.profile.rangedWeapons
        )
      ),
    []
  );
  const consolidatedMeleeWeaponPool = useMemo(
    () =>
      dedupeWeapons(
        operativeCatalog.operatives.flatMap(
          (operative) => operative.profile.meleeWeapons
        )
      ),
    []
  );
  const officialRangedWeaponPool = useMemo(
    () => dedupeWeapons(OFFICIAL_NEMESIS_RANGED_WEAPONS),
    []
  );
  const officialMeleeWeaponPool = useMemo(
    () => dedupeWeapons(OFFICIAL_NEMESIS_MELEE_WEAPONS),
    []
  );
  const allNemesisRangedWeaponOptions = useMemo(() => {
    const options: NemesisWeaponOption[] = [
      ...officialRangedWeaponPool.map((profile) => ({
        id: toWeaponOptionId(profile, 'official-ranged'),
        type: 'ranged' as const,
        source: 'official' as const,
        profile,
      })),
      ...consolidatedRangedWeaponPool.map((profile) => ({
        id: toWeaponOptionId(profile, 'consolidated-ranged'),
        type: 'ranged' as const,
        source: 'consolidated' as const,
        profile,
      })),
    ];

    const deduped = new Map<string, NemesisWeaponOption>();
    options.forEach((option) => {
      const key = `${option.type}:${toWeaponKey(option.profile)}`;
      if (!deduped.has(key) || option.source === 'official') {
        deduped.set(key, option);
      }
    });

    return Array.from(deduped.values());
  }, [consolidatedRangedWeaponPool, officialRangedWeaponPool]);
  const allNemesisMeleeWeaponOptions = useMemo(() => {
    const options: NemesisWeaponOption[] = [
      ...officialMeleeWeaponPool.map((profile) => ({
        id: toWeaponOptionId(profile, 'official-melee'),
        type: 'melee' as const,
        source: 'official' as const,
        profile,
      })),
      ...consolidatedMeleeWeaponPool.map((profile) => ({
        id: toWeaponOptionId(profile, 'consolidated-melee'),
        type: 'melee' as const,
        source: 'consolidated' as const,
        profile,
      })),
    ];

    const deduped = new Map<string, NemesisWeaponOption>();
    options.forEach((option) => {
      const key = `${option.type}:${toWeaponKey(option.profile)}`;
      if (!deduped.has(key) || option.source === 'official') {
        deduped.set(key, option);
      }
    });

    return Array.from(deduped.values());
  }, [consolidatedMeleeWeaponPool, officialMeleeWeaponPool]);
  const nemesisRangedWeaponOptions = useMemo(
    () =>
      showExtendedNemesisWeapons
        ? allNemesisRangedWeaponOptions
        : allNemesisRangedWeaponOptions.filter(
            (option) => option.source === 'official'
          ),
    [allNemesisRangedWeaponOptions, showExtendedNemesisWeapons]
  );
  const nemesisMeleeWeaponOptions = useMemo(
    () =>
      showExtendedNemesisWeapons
        ? allNemesisMeleeWeaponOptions
        : allNemesisMeleeWeaponOptions.filter(
            (option) => option.source === 'official'
          ),
    [allNemesisMeleeWeaponOptions, showExtendedNemesisWeapons]
  );
  const selectedNemesisPreset =
    newNemesisSize === 'custom' ? null : NEMESIS_SIZE_PRESETS[newNemesisSize];
  const nemesisPreviewStats = selectedNemesisPreset
    ? {
        control: selectedNemesisPreset.control,
        move: selectedNemesisPreset.move,
        save: selectedNemesisPreset.save,
        wounds: selectedNemesisPreset.wounds,
      }
    : {
        control: customNemesisControl,
        move: customNemesisMove,
        save: customNemesisSave,
        wounds: customNemesisWounds,
      };
  const selectedNemesisRangedWeapons = useMemo(
    () =>
      allNemesisRangedWeaponOptions.filter((option) =>
        selectedNemesisRangedWeaponIds.includes(option.id)
      ),
    [allNemesisRangedWeaponOptions, selectedNemesisRangedWeaponIds]
  );
  const selectedNemesisMeleeWeapons = useMemo(
    () =>
      allNemesisMeleeWeaponOptions.filter((option) =>
        selectedNemesisMeleeWeaponIds.includes(option.id)
      ),
    [allNemesisMeleeWeaponOptions, selectedNemesisMeleeWeaponIds]
  );
  const selectedNemesisWeaponCount = useMemo(
    () =>
      [...selectedNemesisRangedWeapons, ...selectedNemesisMeleeWeapons].reduce(
        (total, weapon) => total + getWeaponSelectionCost(weapon.profile),
        0
      ),
    [selectedNemesisMeleeWeapons, selectedNemesisRangedWeapons]
  );
  const selectedNemesisWeaponLimit = getNemesisWeaponLimit(newNemesisSize);
  const isNemesisWeaponLimitExceeded =
    selectedNemesisWeaponCount > selectedNemesisWeaponLimit;
  const isNemesisAllegianceTraitLimitExceeded =
    selectedNemesisAllegianceTraitIds.length > NEMESIS_TRAIT_LIMIT;
  const isNemesisTraitLimitExceeded =
    selectedNemesisTraitIds.length > NEMESIS_TRAIT_LIMIT;
  const selectedPlayerTeamSourceList = getTeamSourceList(selectedPlayerTeam);
  const selectedNpoTeamSourceList = getTeamSourceList(selectedNpoTeam);

  const getProfileDisplayName = (profileId: string): string => {
    if (profileId === DATACARD_PROFILE_ID) return 'Datacard';
    return profileLookup.get(profileId)?.name ?? 'Unknown Profile';
  };

  useEffect(() => {
    const validIds = new Set(
      nemesisRangedWeaponOptions.map((option) => option.id)
    );
    setSelectedNemesisRangedWeaponIds((prev) => {
      const filtered = prev.filter((id) => validIds.has(id));
      if (filtered.length > 0) return filtered;

      const defaults = nemesisRangedWeaponOptions
        .filter((option) => option.source === 'official')
        .slice(0, selectedNemesisWeaponLimit)
        .map((option) => option.id);
      if (defaults.length > 0) return defaults;

      return nemesisRangedWeaponOptions
        .slice(0, Math.min(1, selectedNemesisWeaponLimit))
        .map((option) => option.id);
    });
  }, [nemesisRangedWeaponOptions, selectedNemesisWeaponLimit]);

  useEffect(() => {
    const validIds = new Set(
      nemesisMeleeWeaponOptions.map((option) => option.id)
    );
    setSelectedNemesisMeleeWeaponIds((prev) => {
      const filtered = prev.filter((id) => validIds.has(id));
      if (filtered.length > 0) return filtered;

      const defaults = nemesisMeleeWeaponOptions
        .filter((option) => option.source === 'official')
        .slice(0, selectedNemesisWeaponLimit)
        .map((option) => option.id);
      if (defaults.length > 0) return defaults;

      return nemesisMeleeWeaponOptions
        .slice(0, Math.min(1, selectedNemesisWeaponLimit))
        .map((option) => option.id);
    });
  }, [nemesisMeleeWeaponOptions, selectedNemesisWeaponLimit]);

  useEffect(() => {
    if (!transferHint) return;
    const timeout = setTimeout(() => setTransferHint(null), 280);
    return () => clearTimeout(timeout);
  }, [transferHint]);

  /**
   * Renders summary content for Datacard entries, resolved profiles,
   * or a fallback when the referenced profile cannot be found.
   */
  const parseSpecialRules = (specialRules: string): string[] =>
    specialRules
      .split(',')
      .map((rule) => rule.trim())
      .filter(Boolean);

  const parseBehaviorRules = (
    behaviorRules: string
  ): { intro: string; steps: string[] } => {
    const normalized = behaviorRules.replace(/\s+/g, ' ').trim();
    if (!normalized) {
      return { intro: '', steps: [] };
    }

    const firstStepIndex = normalized.search(/\b1\.\s*/);
    if (firstStepIndex === -1) {
      return { intro: normalized, steps: [] };
    }

    const intro = normalized.slice(0, firstStepIndex).trim();
    const steps = normalized
      .slice(firstStepIndex)
      .split(/(?=\b\d+\.\s)/)
      .map((step) => step.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean);

    return { intro, steps };
  };

  const renderProfileSummary = (profileId: string) => {
    if (profileId === DATACARD_PROFILE_ID) {
      return (
        <p className="profile-summary">
          Profile: Datacard (use faction operative datacard)
        </p>
      );
    }
    const profile = profileLookup.get(profileId);
    if (!profile) {
      return <p className="profile-summary">Profile data unavailable.</p>;
    }

    const behavior = parseBehaviorRules(profile.behaviorRules);
    const primaryStatLabel = profile.usesControlStat ? '🎛️ Control' : '⚡ APL';
    const allegianceTraits =
      profile.allegianceTraits
        ?.map((traitId) =>
          NEMESIS_ALLEGIANCE_TRAITS.find((trait) => trait.id === traitId)
        )
        .filter((trait): trait is NemesisTraitOption => Boolean(trait)) ?? [];
    const nemesisTraits =
      profile.nemesisTraits
        ?.map((traitId) => NEMESIS_TRAITS.find((trait) => trait.id === traitId))
        .filter((trait): trait is NemesisTraitOption => Boolean(trait)) ?? [];

    return (
      <div className="profile-summary">
        <div className="profile-stats-grid">
          <div className="profile-stat-chip is-apl">
            <span className="profile-stat-label">{primaryStatLabel}</span>
            <strong>{profile.apl}</strong>
          </div>
          <div className="profile-stat-chip is-move">
            <span className="profile-stat-label">🏃 Move</span>
            <strong>{profile.move}</strong>
          </div>
          <div className="profile-stat-chip is-save">
            <span className="profile-stat-label">🛡️ Save</span>
            <strong>{profile.save}</strong>
          </div>
          <div className="profile-stat-chip is-wounds">
            <span className="profile-stat-label">❤️ Wounds</span>
            <strong>{profile.wounds}</strong>
          </div>
        </div>

        {(allegianceTraits.length > 0 || nemesisTraits.length > 0) && (
          <div className="runner-weapon-section">
            <h5>☠️ Traits</h5>
            {allegianceTraits.length > 0 && (
              <>
                <p className="team-selection-meta">Allegiance Traits</p>
                <div className="runner-weapon-list">
                  {allegianceTraits.map((trait) => (
                    <article
                      className="runner-weapon-card"
                      key={`allegiance-${profile.id}-${trait.id}`}
                    >
                      <p className="runner-weapon-name">{trait.name}</p>
                      <p className="runner-weapon-no-rules">
                        {trait.description}
                      </p>
                    </article>
                  ))}
                </div>
              </>
            )}
            {nemesisTraits.length > 0 && (
              <>
                <p className="team-selection-meta">Nemesis Traits</p>
                <div className="runner-weapon-list">
                  {nemesisTraits.map((trait) => (
                    <article
                      className="runner-weapon-card"
                      key={`nemesis-${profile.id}-${trait.id}`}
                    >
                      <p className="runner-weapon-name">{trait.name}</p>
                      <p className="runner-weapon-no-rules">
                        {trait.description}
                      </p>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="runner-weapon-section">
          <h5>🔫 Ranged Weapons</h5>
          {profile.rangedWeapons.length === 0 ? (
            <p className="runner-weapon-none">None</p>
          ) : (
            <div className="runner-weapon-list">
              {profile.rangedWeapons.map((weapon) => {
                const rules = parseSpecialRules(weapon.specialRules);
                return (
                  <article className="runner-weapon-card" key={weapon.id}>
                    <p className="runner-weapon-name">{weapon.name}</p>
                    <div className="runner-weapon-metrics">
                      <div className="runner-weapon-metric-chip is-attacks">
                        <span className="runner-weapon-metric-label">
                          🎲 Attacks
                        </span>
                        <strong>{weapon.attacks}</strong>
                      </div>
                      <div className="runner-weapon-metric-chip is-hit">
                        <span className="runner-weapon-metric-label">
                          🎯 Hit
                        </span>
                        <strong>{weapon.skill}</strong>
                      </div>
                      <div className="runner-weapon-metric-chip is-damage">
                        <span className="runner-weapon-metric-label">
                          💥 Damage
                        </span>
                        <strong>
                          N {weapon.damage} / C {weapon.criticalDamage}
                        </strong>
                      </div>
                    </div>
                    {rules.length > 0 ? (
                      <div className="runner-weapon-rules">
                        {rules.map((rule) => (
                          <span className="runner-weapon-rule-chip" key={rule}>
                            {rule}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="runner-weapon-no-rules">No special rules</p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="runner-weapon-section">
          <h5>⚔️ Melee Weapons</h5>
          {profile.meleeWeapons.length === 0 ? (
            <p className="runner-weapon-none">None</p>
          ) : (
            <div className="runner-weapon-list">
              {profile.meleeWeapons.map((weapon) => {
                const rules = parseSpecialRules(weapon.specialRules);
                return (
                  <article className="runner-weapon-card" key={weapon.id}>
                    <p className="runner-weapon-name">{weapon.name}</p>
                    <div className="runner-weapon-metrics">
                      <div className="runner-weapon-metric-chip is-attacks">
                        <span className="runner-weapon-metric-label">
                          🎲 Attacks
                        </span>
                        <strong>{weapon.attacks}</strong>
                      </div>
                      <div className="runner-weapon-metric-chip is-hit">
                        <span className="runner-weapon-metric-label">
                          🎯 Hit
                        </span>
                        <strong>{weapon.skill}</strong>
                      </div>
                      <div className="runner-weapon-metric-chip is-damage">
                        <span className="runner-weapon-metric-label">
                          💥 Damage
                        </span>
                        <strong>
                          N {weapon.damage} / C {weapon.criticalDamage}
                        </strong>
                      </div>
                    </div>
                    {rules.length > 0 ? (
                      <div className="runner-weapon-rules">
                        {rules.map((rule) => (
                          <span className="runner-weapon-rule-chip" key={rule}>
                            {rule}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="runner-weapon-no-rules">No special rules</p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {profile.behaviorRules && (
          <div className="runner-behavior">
            <p className="runner-behavior-title">🤖 Behavior</p>
            {behavior.intro && (
              <p className="runner-behavior-intro">{behavior.intro}</p>
            )}
            {behavior.steps.length > 0 ? (
              <ol className="runner-behavior-steps">
                {behavior.steps.map((step, index) => (
                  <li key={`${profile.id}-step-${index}`}>{step}</li>
                ))}
              </ol>
            ) : null}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="solo-joint-ops-view">
      <header>
        <h2>Solo / Joint Ops</h2>
        <p>
          Game runner, list builder, NPO profile manager, and nemesis manager
          for solo or joint operations.
        </p>
      </header>

      <nav className="solo-tabs" aria-label="Solo Joint Ops tabs">
        <button
          type="button"
          className={activeTab === 'game-runner' ? 'active' : ''}
          onClick={() => setActiveTab('game-runner')}
        >
          Game Runner
        </button>
        <button
          type="button"
          className={activeTab === 'list-builder' ? 'active' : ''}
          onClick={() => setActiveTab('list-builder')}
        >
          List Builder
        </button>
        <button
          type="button"
          className={activeTab === 'npo-profile-manager' ? 'active' : ''}
          onClick={() => setActiveTab('npo-profile-manager')}
        >
          NPO Profile Manager
        </button>
        <button
          type="button"
          className={activeTab === 'nemesis-profile-manager' ? 'active' : ''}
          onClick={() => setActiveTab('nemesis-profile-manager')}
        >
          Nemesis Profile Manager
        </button>
      </nav>

      {importMessage && (
        <div
          className="import-message"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span>{importMessage}</span>
          <button type="button" onClick={() => setImportMessage(null)}>
            Dismiss
          </button>
        </div>
      )}

      {activeTab === 'game-runner' && (
        <div className="game-runner-layout">
          <section
            className={`solo-card game-runner-setup-gate${
              isGameSetupComplete ? '' : ' is-warning'
            }`}
          >
            <div className="game-runner-setup-copy">
              <h3>Game Runner</h3>
              <p className="setup-gate-text">
                {isGameSetupComplete
                  ? 'NPO team is configured. Open setup to manage teams.'
                  : 'Game setup is incomplete. Configure your NPO team before running activations.'}
              </p>
            </div>
            <div className="game-runner-setup-actions">
              <div className="game-runner-setup-action">
                <span className="setup-action-label">Team Setup</span>
                <button type="button" onClick={() => setIsTeamSetupOpen(true)}>
                  {isGameSetupComplete ? 'Manage Team Setup' : '⚠️ Setup Team'}
                </button>
                <p className="setup-action-meta">
                  {isGameSetupComplete
                    ? 'NPO team ready. Player team is optional.'
                    : 'Required before activation flow can start.'}
                </p>
              </div>
              <div className="game-runner-setup-action">
                <span className="setup-action-label">
                  Activation Deck Setup
                </span>
                <button type="button" onClick={() => setIsDeckSetupOpen(true)}>
                  Manage Activation Deck ({totalDeckCardInstances} card
                  {totalDeckCardInstances !== 1 ? 's' : ''})
                </button>
                <p className="setup-action-meta">
                  {totalDeckCardInstances} activation card
                  {totalDeckCardInstances !== 1 ? 's' : ''} configured.
                </p>
              </div>
            </div>
          </section>

          {isTeamSetupOpen && (
            <div className="setup-modal-backdrop" role="dialog" aria-modal>
              <section className="solo-card setup-modal">
                <div className="setup-modal-header">
                  <h3>Team Setup</h3>
                  <button
                    type="button"
                    onClick={() => setIsTeamSetupOpen(false)}
                  >
                    Done
                  </button>
                </div>
                <div
                  className="solo-tabs game-runner-setup-tabs"
                  role="tablist"
                >
                  <button
                    type="button"
                    className={activeTeamSetupPane === 'npo' ? 'active' : ''}
                    onClick={() => setActiveTeamSetupPane('npo')}
                    role="tab"
                    aria-selected={activeTeamSetupPane === 'npo'}
                  >
                    NPO Team Setup
                  </button>
                  <button
                    type="button"
                    className={activeTeamSetupPane === 'player' ? 'active' : ''}
                    onClick={() => setActiveTeamSetupPane('player')}
                    role="tab"
                    aria-selected={activeTeamSetupPane === 'player'}
                  >
                    Player Team Setup (Optional)
                  </button>
                </div>

                <div className="team-builders">
                  {activeTeamSetupPane === 'player' && (
                    <div className="team-builder">
                      <label htmlFor="player-active-team">
                        Active Player Team
                      </label>
                      <select
                        id="player-active-team"
                        value={selectedPlayerTeam?.id ?? ''}
                        onChange={(event) =>
                          updateState({
                            selectedPlayerTeamId: event.target.value,
                          })
                        }
                      >
                        {playerTeams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>

                      <div className="input-row list-name-row">
                        <input
                          value={newPlayerTeamName}
                          placeholder="New player team name"
                          onChange={(event) =>
                            setNewPlayerTeamName(event.target.value)
                          }
                        />
                        <button
                          type="button"
                          onClick={() => {
                            addTeam('player', newPlayerTeamName);
                            setNewPlayerTeamName('');
                          }}
                        >
                          Add Team
                        </button>
                      </div>

                      <button
                        type="button"
                        className="danger-button"
                        onClick={() =>
                          selectedPlayerTeam &&
                          deleteTeam(selectedPlayerTeam.id)
                        }
                        disabled={
                          playerTeams.length <= 1 || !selectedPlayerTeam
                        }
                      >
                        Delete Team
                      </button>

                      <label htmlFor="player-team-name">Player Team Name</label>
                      <input
                        id="player-team-name"
                        value={selectedPlayerTeam?.name ?? ''}
                        onChange={(event) =>
                          selectedPlayerTeam &&
                          updateTeam(selectedPlayerTeam.id, {
                            name: event.target.value,
                          })
                        }
                      />

                      <label htmlFor="active-player-list">
                        Source Player List
                      </label>
                      <select
                        id="active-player-list"
                        value={selectedPlayerTeam?.sourceListId ?? ''}
                        onChange={(event) =>
                          selectedPlayerTeam &&
                          updateTeam(selectedPlayerTeam.id, {
                            sourceListId: event.target.value,
                            operativeIds: [],
                          })
                        }
                      >
                        {playerLists.map((list) => (
                          <option key={list.id} value={list.id}>
                            {list.name}
                          </option>
                        ))}
                      </select>

                      <p className="team-selection-meta">
                        Team selection: {selectedPlayerTeamOperatives.length} of{' '}
                        {selectedPlayerTeamSourceList?.operatives.length ?? 0}{' '}
                        operatives
                      </p>

                      <TeamOperativeTransfer
                        team={selectedPlayerTeam}
                        sourceOperatives={
                          selectedPlayerTeamSourceList?.operatives ?? []
                        }
                        selectedOperatives={selectedPlayerTeamOperatives}
                        transferHint={transferHint}
                        onMoveOperative={(operativeId, direction) =>
                          selectedPlayerTeam &&
                          moveTeamOperative(
                            selectedPlayerTeam,
                            operativeId,
                            direction
                          )
                        }
                      />
                    </div>
                  )}

                  {activeTeamSetupPane === 'npo' && (
                    <div className="team-builder">
                      <label htmlFor="npo-active-team">Active NPO Team</label>
                      <select
                        id="npo-active-team"
                        value={selectedNpoTeam?.id ?? ''}
                        onChange={(event) =>
                          updateState({ selectedNpoTeamId: event.target.value })
                        }
                      >
                        {npoTeams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>

                      <div className="input-row list-name-row">
                        <input
                          value={newNpoTeamName}
                          placeholder="New NPO team name"
                          onChange={(event) =>
                            setNewNpoTeamName(event.target.value)
                          }
                        />
                        <button
                          type="button"
                          onClick={() => {
                            addTeam('npo', newNpoTeamName);
                            setNewNpoTeamName('');
                          }}
                        >
                          Add Team
                        </button>
                      </div>

                      <button
                        type="button"
                        className="danger-button"
                        onClick={() =>
                          selectedNpoTeam && deleteTeam(selectedNpoTeam.id)
                        }
                        disabled={npoTeams.length <= 1 || !selectedNpoTeam}
                      >
                        Delete Team
                      </button>

                      <label htmlFor="npo-team-name">NPO Team Name</label>
                      <input
                        id="npo-team-name"
                        value={selectedNpoTeam?.name ?? ''}
                        onChange={(event) =>
                          selectedNpoTeam &&
                          updateTeam(selectedNpoTeam.id, {
                            name: event.target.value,
                          })
                        }
                      />

                      <label htmlFor="active-npo-list">Source NPO List</label>
                      <select
                        id="active-npo-list"
                        value={selectedNpoTeam?.sourceListId ?? ''}
                        onChange={(event) =>
                          selectedNpoTeam &&
                          updateTeam(selectedNpoTeam.id, {
                            sourceListId: event.target.value,
                            operativeIds: [],
                          })
                        }
                      >
                        {npoLists.map((list) => (
                          <option key={list.id} value={list.id}>
                            {list.name}
                          </option>
                        ))}
                      </select>

                      <label htmlFor="npo-selection-rule">
                        NPO Selection Rule
                      </label>
                      <select
                        id="npo-selection-rule"
                        value={selectedNpoTeam?.selectionRule ?? 'manual'}
                        onChange={(event) =>
                          selectedNpoTeam &&
                          updateTeam(selectedNpoTeam.id, {
                            selectionRule: event.target
                              .value as NpoTeamSelectionRule,
                          })
                        }
                      >
                        <option value="manual">Manual</option>
                        <option value="random">Random</option>
                        <option value="melee-heavy">Melee-heavy</option>
                        <option value="ranged-heavy">Ranged-heavy</option>
                        <option value="elite">Elite (high wounds first)</option>
                        <option value="horde">Horde (low wounds first)</option>
                      </select>

                      <label htmlFor="npo-wounds-limit">NPO Wounds Limit</label>
                      <input
                        id="npo-wounds-limit"
                        type="number"
                        min={0}
                        value={selectedNpoTeam?.autoWoundsLimit ?? 0}
                        onChange={(event) =>
                          selectedNpoTeam &&
                          updateTeam(selectedNpoTeam.id, {
                            autoWoundsLimit: Math.max(
                              0,
                              Number(event.target.value) || 0
                            ),
                          })
                        }
                      />

                      <button
                        type="button"
                        onClick={() =>
                          selectedNpoTeam &&
                          applyNpoTeamSelectionRule(selectedNpoTeam.id)
                        }
                        disabled={!selectedNpoTeam}
                      >
                        Apply NPO Selection Rule
                      </button>

                      <p className="team-selection-meta">
                        Team selection: {selectedNpoTeamOperatives.length} of{' '}
                        {selectedNpoTeamSourceList?.operatives.length ?? 0}{' '}
                        operatives
                      </p>

                      {selectedNpoTeam?.selectionRule === 'manual' ? (
                        <TeamOperativeTransfer
                          team={selectedNpoTeam}
                          sourceOperatives={
                            selectedNpoTeamSourceList?.operatives ?? []
                          }
                          selectedOperatives={selectedNpoTeamOperatives}
                          transferHint={transferHint}
                          onMoveOperative={(operativeId, direction) =>
                            selectedNpoTeam &&
                            moveTeamOperative(
                              selectedNpoTeam,
                              operativeId,
                              direction
                            )
                          }
                        />
                      ) : (
                        <ul className="team-selection-list">
                          {selectedNpoTeamOperatives.map((operative) => (
                            <li key={operative.id}>{operative.name}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {isDeckSetupOpen && (
            <div
              className="setup-modal-backdrop"
              role="dialog"
              aria-modal
              aria-label="Activation Deck Setup"
            >
              <section className="solo-card setup-modal">
                <div className="setup-modal-header">
                  <h3>Activation Deck Setup</h3>
                  <button
                    type="button"
                    onClick={() => setIsDeckSetupOpen(false)}
                  >
                    Done
                  </button>
                </div>
                <p className="deck-description">
                  Default behavior is one card per NPO operative (two for NPO
                  nemesis operatives). You can edit card links and instance
                  counts when needed.
                </p>

                {state.activationDeck.length === 0 ? (
                  <p className="deck-empty-note">
                    No cards configured. A default deck is created when you
                    reset the deck in Activation.
                  </p>
                ) : (
                  <ul className="deck-card-list">
                    {state.activationDeck.map((card) => {
                      const exhausted = isCardExhausted(card, runnerOperatives);
                      const linkedOperativeNames = card.operativeIds
                        .map((operativeId) =>
                          npoRunnerOperativeNames.get(operativeId)
                        )
                        .filter((name): name is string => Boolean(name));
                      const isEditing = editingDeckCardId === card.id;
                      return (
                        <li
                          key={card.id}
                          className={`deck-card-item${exhausted ? ' deck-card-exhausted' : ''}`}
                        >
                          <div className="deck-card-header">
                            <div className="deck-card-title-wrap">
                              <span className="deck-card-linked-count">
                                {linkedOperativeNames.length} linked
                              </span>
                              <span className="deck-card-linked-count">
                                x{Math.max(1, Math.floor(card.count || 1))}
                              </span>
                            </div>
                            <div className="deck-card-controls">
                              <button
                                type="button"
                                aria-expanded={isEditing}
                                aria-controls={`deck-editor-${card.id}`}
                                onClick={() =>
                                  setEditingDeckCardId((prev) =>
                                    prev === card.id ? null : card.id
                                  )
                                }
                              >
                                {isEditing ? 'Done' : 'Edit'}
                              </button>
                              <button
                                type="button"
                                className="danger-button"
                                onClick={() => removeDeckCard(card.id)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                          <p className="deck-card-summary">
                            <span>Linked operatives:</span>{' '}
                            {linkedOperativeNames.length > 0
                              ? linkedOperativeNames.join(', ')
                              : 'No linked operatives yet'}
                          </p>

                          {isEditing && (
                            <div
                              className="deck-card-editor"
                              id={`deck-editor-${card.id}`}
                            >
                              <div className="deck-card-count-controls">
                                <span className="deck-card-links-label">
                                  Card instances:
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateDeckCard(card.id, {
                                      count: Math.max(
                                        1,
                                        Math.floor((card.count || 1) - 1)
                                      ),
                                    })
                                  }
                                  disabled={(card.count || 1) <= 1}
                                  aria-label="Decrease card instance count"
                                >
                                  -
                                </button>
                                <span className="deck-card-count-value">
                                  {Math.max(1, Math.floor(card.count || 1))}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateDeckCard(card.id, {
                                      count: Math.max(
                                        1,
                                        Math.floor((card.count || 1) + 1)
                                      ),
                                    })
                                  }
                                  aria-label="Increase card instance count"
                                >
                                  +
                                </button>
                              </div>
                              <div className="deck-card-links">
                                <span className="deck-card-links-label">
                                  Select linked operatives:
                                </span>
                                {npoRunnerOperatives.map((operative) => {
                                  const linked = card.operativeIds.includes(
                                    operative.sourceOperativeId
                                  );
                                  return (
                                    <label
                                      key={operative.id}
                                      className="deck-card-link-toggle"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={linked}
                                        onChange={() => {
                                          const next = linked
                                            ? card.operativeIds.filter(
                                                (id) =>
                                                  id !==
                                                  operative.sourceOperativeId
                                              )
                                            : [
                                                ...card.operativeIds,
                                                operative.sourceOperativeId,
                                              ];
                                          updateDeckCard(card.id, {
                                            operativeIds: next,
                                          });
                                        }}
                                      />
                                      {operative.name}
                                    </label>
                                  );
                                })}
                                {npoRunnerOperatives.length === 0 && (
                                  <span className="deck-no-operatives">
                                    No NPO operatives selected yet.
                                  </span>
                                )}
                              </div>
                              <p className="deck-editor-tip">
                                Tip: set instances above 1 to duplicate this
                                card in the deck.
                              </p>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}

                <div className="deck-actions">
                  <button type="button" onClick={addDeckCard}>
                    Add Card
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const generated =
                        buildDeckFromNpoOperatives(runnerOperatives);
                      setState((prev) => ({
                        ...prev,
                        activationDeck: generated,
                      }));
                      setEditingDeckCardId(null);
                    }}
                    disabled={npoRunnerOperatives.length === 0}
                  >
                    Reset to Default (standard per-operative cards)
                  </button>
                </div>
              </section>
            </div>
          )}

          <div className="activation-runner-layout game-runner-main">
            <div className="activation-runner-main">
              <section className="solo-card">
                <h3>Activation</h3>
                <div className="activation-controls">
                  <button type="button" onClick={resetActivationDeck}>
                    Reset Deck
                  </button>
                  <button
                    type="button"
                    onClick={drawActivation}
                    disabled={drawPile.length === 0}
                  >
                    Draw Activation
                  </button>
                </div>
                <p aria-live="polite" className="activation-status">
                  Activation {state.activationNumber} · Deck remaining:{' '}
                  {drawPile.length}
                </p>
                {currentDrawnCard && (
                  <div
                    className="current-activation"
                    role="status"
                    aria-live="polite"
                  >
                    <strong>Current NPO Activation:</strong>{' '}
                    {currentDrawnCardLinkedNames.length > 0
                      ? currentDrawnCardLinkedNames.join(', ')
                      : 'No active linked operatives'}
                    {drawPile.length > 0 && (
                      <span className="deck-remaining">
                        {drawPile.length} card
                        {drawPile.length !== 1 ? 's' : ''} remaining
                      </span>
                    )}
                    {drawPile.length === 0 && state.activationNumber > 0 && (
                      <span className="deck-exhausted-note">
                        Deck exhausted — use Reset Deck to reshuffle.
                      </span>
                    )}
                    {currentActivatedOperatives.length > 0 && (
                      <div className="activation-operator-list-wrap">
                        <span className="activation-operator-list-label">
                          Activating operatives:
                        </span>
                        <ul className="activation-operator-list">
                          {currentActivatedOperatives.map((operative) => (
                            <li key={operative.id}>{operative.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {currentDrawnCard.operativeIds.length > 0 &&
                      currentActivatedOperatives.length === 0 && (
                        <span className="deck-exhausted-note">
                          All linked operatives are incapacitated.
                        </span>
                      )}
                  </div>
                )}
              </section>

              <section className="solo-card">
                <h3>Operative Runner Cards</h3>
                {!currentDrawnCard ? (
                  <p>Draw an activation to show operative runner cards.</p>
                ) : currentActivatedOperatives.length === 0 ? (
                  <p>No active operatives on the drawn card.</p>
                ) : (
                  <div className="npo-cards">
                    {currentActivatedOperatives.map((operative) => (
                      <article
                        className={`npo-card npo-card-active${
                          operative.incapacitated
                            ? ' npo-card-incapacitated'
                            : ''
                        }`}
                        key={operative.id}
                      >
                        <div className="npo-card-header">
                          <div className="npo-card-header-main">
                            <h4>{operative.name}</h4>
                            <p className="runner-identity-line">
                              <span>Model:</span> {operative.name}
                            </p>
                            <p className="runner-identity-line">
                              <span>Profile:</span>{' '}
                              {getProfileDisplayName(operative.profileId)}
                            </p>
                          </div>
                          <span className="npo-card-team-chip">
                            {selectedNpoTeam?.name ?? 'NPO Team'}
                          </span>
                        </div>
                        {renderProfileSummary(operative.profileId)}
                        <div className="npo-card-damage-controls">
                          <p className="npo-card-damage">
                            Damage Taken:{' '}
                            <strong className="npo-card-damage-value">
                              {operative.damageTaken}
                            </strong>
                          </p>
                          <div className="npo-card-actions-row">
                            <button
                              type="button"
                              onClick={() =>
                                updateRunnerOperative(operative.id, {
                                  damageTaken: Math.max(
                                    0,
                                    operative.damageTaken - 1
                                  ),
                                })
                              }
                            >
                              -1
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateRunnerOperative(operative.id, {
                                  damageTaken: operative.damageTaken + 1,
                                })
                              }
                            >
                              +1
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <aside className="solo-card npo-roster-panel">
              <h3>NPO Operative Status</h3>
              {npoRunnerOperatives.length === 0 ? (
                <p>No NPO operatives selected yet.</p>
              ) : (
                <ul className="npo-roster-list">
                  {npoRunnerOperatives.map((operative) => {
                    const isOnCurrentCard =
                      currentDrawnCard?.operativeIds.includes(
                        operative.sourceOperativeId
                      ) ?? false;

                    return (
                      <li
                        key={operative.id}
                        className={`npo-roster-item${
                          operative.incapacitated
                            ? ' npo-roster-item-incapacitated'
                            : ''
                        }${isOnCurrentCard ? ' npo-roster-item-active' : ''}`}
                      >
                        <div className="npo-roster-name-row">
                          <span>{operative.name}</span>
                          {isOnCurrentCard && (
                            <span className="npo-roster-active-chip">
                              Current Card
                            </span>
                          )}
                        </div>
                        <p className="npo-roster-profile-line">
                          <span>Profile:</span>{' '}
                          {getProfileDisplayName(operative.profileId)}
                        </p>
                        <button
                          type="button"
                          className={`incap-toggle${
                            operative.incapacitated ? ' is-on' : ''
                          }`}
                          onClick={() =>
                            updateRunnerOperative(operative.id, {
                              incapacitated: !operative.incapacitated,
                            })
                          }
                          aria-pressed={operative.incapacitated}
                        >
                          {operative.incapacitated
                            ? 'Incapacitated ☠'
                            : 'Active 🪖'}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </aside>
          </div>
        </div>
      )}

      {activeTab === 'list-builder' && (
        <section className="solo-card">
          <h3>List Builder</h3>
          <p>
            Build and store player/NPO model lists with optional profile
            overrides. Player entries default to Datacard, while NPO, custom
            model, and nemesis entries use explicit profiles.
          </p>

          <div className="solo-tabs list-builder-subtabs" role="tablist">
            <button
              type="button"
              className={activeListBuilderSide === 'player' ? 'active' : ''}
              onClick={() => setActiveListBuilderSide('player')}
              role="tab"
              aria-selected={activeListBuilderSide === 'player'}
            >
              Player Lists
            </button>
            <button
              type="button"
              className={activeListBuilderSide === 'npo' ? 'active' : ''}
              onClick={() => setActiveListBuilderSide('npo')}
              role="tab"
              aria-selected={activeListBuilderSide === 'npo'}
            >
              NPO Lists
            </button>
          </div>

          <div className="team-builders">
            {activeListBuilderSide === 'player' &&
              playerLists.length > 0 &&
              selectedPlayerList && (
                <SoloListEditor
                  side="player"
                  lists={playerLists}
                  selectedListId={selectedPlayerList.id}
                  availableTeams={playerCatalogTeams}
                  catalogOperatives={operativeCatalog.operatives}
                  nemesisOperatives={state.nemesisOperatives}
                  profiles={state.profiles}
                  profileLookup={profileLookup}
                  defaultTeamId={selectedPlayerTeamForList}
                  onSelectList={(listId) =>
                    updateState({ selectedPlayerListId: listId })
                  }
                  onCreateList={(name) => addList('player', name)}
                  onDeleteList={deleteList}
                  onRenameList={renameList}
                  onAddOperative={addOperativeToList}
                  onAddNemesisOperative={addNemesisToList}
                  onRemoveOperative={removeOperativeFromList}
                />
              )}

            {activeListBuilderSide === 'npo' &&
              npoLists.length > 0 &&
              selectedNpoList && (
                <SoloListEditor
                  side="npo"
                  lists={npoLists}
                  selectedListId={selectedNpoList.id}
                  availableTeams={npoCatalogTeams}
                  catalogOperatives={operativeCatalog.operatives}
                  nemesisOperatives={state.nemesisOperatives}
                  profiles={state.profiles}
                  profileLookup={profileLookup}
                  defaultTeamId={selectedNpoTeamForList}
                  onSelectList={(listId) =>
                    updateState({ selectedNpoListId: listId })
                  }
                  onCreateList={(name) => addList('npo', name)}
                  onDeleteList={deleteList}
                  onRenameList={renameList}
                  onAddOperative={addOperativeToList}
                  onAddNemesisOperative={addNemesisToList}
                  onRemoveOperative={removeOperativeFromList}
                />
              )}
          </div>

          <div className="backup-controls">
            <button type="button" onClick={exportLists}>
              Download Lists Backup
            </button>
            <button
              type="button"
              onClick={() => listsImportRef.current?.click()}
            >
              Import Lists Backup
            </button>
            <input
              ref={listsImportRef}
              type="file"
              accept="application/json,.json"
              onChange={handleListsImport}
              className="visually-hidden"
            />
          </div>
        </section>
      )}

      {activeTab === 'npo-profile-manager' && (
        <section className="solo-card">
          <h3>NPO Profile Manager</h3>
          <p>
            Create and edit NPO operative profiles used by lists. Profiles
            include core stats, ranged/melee weapon profiles, and behavior
            rules.
          </p>

          <div className="profile-toolbar">
            <label htmlFor="profile-select">Editing Profile</label>
            <select
              id="profile-select"
              value={activeProfile?.id ?? ''}
              onChange={(event) => setEditingProfileId(event.target.value)}
            >
              {state.profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
            <button type="button" onClick={createProfile}>
              New Profile
            </button>
            <button
              type="button"
              className="danger-button"
              onClick={() => activeProfile && deleteProfile(activeProfile.id)}
              disabled={state.profiles.length <= 1 || !activeProfile}
            >
              Delete Profile
            </button>
          </div>

          {activeProfile && (
            <div className="profile-editor-grid">
              <label>
                Name
                <input
                  value={activeProfile.name}
                  onChange={(event) =>
                    updateProfile(activeProfile.id, {
                      name: event.target.value,
                    })
                  }
                />
              </label>
              <label>
                {activeProfile.usesControlStat ? 'Control' : 'APL'}
                <input
                  type="number"
                  min={1}
                  value={activeProfile.apl}
                  onChange={(event) =>
                    updateProfile(activeProfile.id, {
                      apl: Math.max(1, Number(event.target.value) || 1),
                    })
                  }
                />
              </label>
              <label>
                Move
                <input
                  value={activeProfile.move}
                  onChange={(event) =>
                    updateProfile(activeProfile.id, {
                      move: event.target.value,
                    })
                  }
                />
              </label>
              <label>
                Save
                <input
                  value={activeProfile.save}
                  onChange={(event) =>
                    updateProfile(activeProfile.id, {
                      save: event.target.value,
                    })
                  }
                />
              </label>
              <label>
                Wounds
                <input
                  type="number"
                  min={1}
                  value={activeProfile.wounds}
                  onChange={(event) =>
                    updateProfile(activeProfile.id, {
                      wounds: Math.max(1, Number(event.target.value) || 1),
                    })
                  }
                />
              </label>
              <label className="full-width">
                Behavior Rules
                <textarea
                  value={activeProfile.behaviorRules}
                  onChange={(event) =>
                    updateProfile(activeProfile.id, {
                      behaviorRules: event.target.value,
                    })
                  }
                  rows={4}
                />
              </label>

              <div className="full-width profile-weapon-layout">
                <ProfileWeaponEditor
                  title="Ranged"
                  weapons={activeProfile.rangedWeapons}
                  onChange={(next) =>
                    updateProfile(activeProfile.id, { rangedWeapons: next })
                  }
                />
                <ProfileWeaponEditor
                  title="Melee"
                  weapons={activeProfile.meleeWeapons}
                  onChange={(next) =>
                    updateProfile(activeProfile.id, { meleeWeapons: next })
                  }
                />
              </div>
            </div>
          )}

          <div className="backup-controls">
            <button type="button" onClick={exportProfiles}>
              Download Profiles Backup
            </button>
            <button
              type="button"
              onClick={() => profilesImportRef.current?.click()}
            >
              Import Profiles Backup
            </button>
            <input
              ref={profilesImportRef}
              type="file"
              accept="application/json,.json"
              onChange={handleProfilesImport}
              className="visually-hidden"
            />
          </div>
        </section>
      )}

      {activeTab === 'nemesis-profile-manager' && (
        <section className="solo-card">
          <h3>Nemesis Profile Manager</h3>
          <p>
            Create and manage Nemesis operatives with size-driven core stats and
            weapon selections.
          </p>

          <section className="team-builder">
            <h4>Nemesis Manager</h4>
            <p>
              Create Nemesis operatives with size-driven core stats. Nemesis can
              then be added to either Player or NPO lists.
            </p>

            <label htmlFor="nemesis-name">Nemesis Name</label>
            <input
              id="nemesis-name"
              value={newNemesisName}
              onChange={(event) => setNewNemesisName(event.target.value)}
              placeholder="Armoured Sentinel"
              aria-label="Nemesis name"
            />

            <label htmlFor="nemesis-size">Nemesis Size</label>
            <select
              id="nemesis-size"
              value={newNemesisSize}
              onChange={(event) =>
                setNewNemesisSize(event.target.value as NemesisSize)
              }
              aria-label="Nemesis size"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="custom">Custom</option>
            </select>

            {selectedNemesisPreset && (
              <p className="team-selection-meta">
                Control {selectedNemesisPreset.control} · Move{' '}
                {selectedNemesisPreset.move} · Save {selectedNemesisPreset.save}{' '}
                · Wounds {selectedNemesisPreset.wounds} · Weapon selections{' '}
                {selectedNemesisPreset.maxWeapons}
              </p>
            )}

            {newNemesisSize === 'custom' && (
              <p className="team-selection-meta">
                Custom weapon selection limit: {CUSTOM_NEMESIS_WEAPON_LIMIT}
              </p>
            )}

            <div className="profile-stats-grid">
              <div className="profile-stat-chip is-apl">
                <span className="profile-stat-label">🎛️ Control</span>
                <strong>{nemesisPreviewStats.control}</strong>
              </div>
              <div className="profile-stat-chip is-move">
                <span className="profile-stat-label">🏃 Move</span>
                <strong>{nemesisPreviewStats.move || '-'}</strong>
              </div>
              <div className="profile-stat-chip is-save">
                <span className="profile-stat-label">🛡️ Save</span>
                <strong>{nemesisPreviewStats.save || '-'}</strong>
              </div>
              <div className="profile-stat-chip is-wounds">
                <span className="profile-stat-label">❤️ Wounds</span>
                <strong>{Math.max(1, nemesisPreviewStats.wounds || 1)}</strong>
              </div>
            </div>

            {newNemesisSize === 'custom' && (
              <div className="profile-editor-grid">
                <label>
                  Control
                  <input
                    type="number"
                    min={1}
                    value={customNemesisControl}
                    onChange={(event) =>
                      setCustomNemesisControl(
                        Math.max(1, Number(event.target.value) || 1)
                      )
                    }
                  />
                </label>
                <label>
                  Move
                  <input
                    value={customNemesisMove}
                    onChange={(event) =>
                      setCustomNemesisMove(event.target.value)
                    }
                  />
                </label>
                <label>
                  Save
                  <input
                    value={customNemesisSave}
                    onChange={(event) =>
                      setCustomNemesisSave(event.target.value)
                    }
                  />
                </label>
                <label>
                  Wounds
                  <input
                    type="number"
                    min={1}
                    value={customNemesisWounds}
                    onChange={(event) =>
                      setCustomNemesisWounds(
                        Math.max(1, Number(event.target.value) || 1)
                      )
                    }
                  />
                </label>
              </div>
            )}

            <div className="solo-tabs" aria-label="Nemesis weapon source">
              <button
                type="button"
                className={!showExtendedNemesisWeapons ? 'active' : ''}
                onClick={() => setShowExtendedNemesisWeapons(false)}
              >
                Default
              </button>
              <button
                type="button"
                className={showExtendedNemesisWeapons ? 'active' : ''}
                onClick={() => setShowExtendedNemesisWeapons(true)}
              >
                Extended
              </button>
            </div>
            <p className="team-selection-meta">
              Weapon source:{' '}
              {showExtendedNemesisWeapons ? 'Extended' : 'Default'}.{' '}
              {showExtendedNemesisWeapons
                ? 'Includes official and consolidated options.'
                : 'Official options only.'}
            </p>

            <p className="team-selection-meta">
              Selected weapons: {selectedNemesisWeaponCount} /{' '}
              {selectedNemesisWeaponLimit}
            </p>
            {isNemesisWeaponLimitExceeded && (
              <p className="deck-exhausted-note" role="status">
                Warning: selected weapons exceed the recommended limit for this
                nemesis size. Manual override is allowed.
              </p>
            )}

            <div className="profile-weapon-layout">
              <section className="profile-weapon-group">
                <div className="deck-panel-header">
                  <h5>Nemesis Ranged Weapons</h5>
                  <button
                    type="button"
                    onClick={() =>
                      setIsRangedNemesisEditorOpen((prevIsOpen) => !prevIsOpen)
                    }
                  >
                    {isRangedNemesisEditorOpen ? 'Done' : 'Edit Ranged'}
                  </button>
                </div>
                <p className="team-selection-meta">
                  Official: {officialRangedWeaponPool.length} · Consolidated:{' '}
                  {consolidatedRangedWeaponPool.length}
                </p>
                {!showExtendedNemesisWeapons &&
                  officialRangedWeaponPool.length === 0 && (
                    <p className="team-transfer-empty">
                      Official ranged table not loaded yet. Consolidated entries
                      are generated from current operative profiles.
                    </p>
                  )}
                {!isRangedNemesisEditorOpen ? (
                  selectedNemesisRangedWeapons.length === 0 ? (
                    <p className="deck-collapsed-note">
                      No ranged weapons selected.
                    </p>
                  ) : (
                    <div className="runner-weapon-list">
                      {selectedNemesisRangedWeapons.map((weapon) => {
                        const rules = parseSpecialRules(
                          weapon.profile.specialRules
                        );
                        return (
                          <article
                            className="runner-weapon-card"
                            key={`selected-ranged-${weapon.id}`}
                          >
                            <p className="runner-weapon-name">
                              {weapon.profile.name}{' '}
                              <small>({weapon.source})</small>
                            </p>
                            <div className="runner-weapon-metrics">
                              <div className="runner-weapon-metric-chip is-attacks">
                                <span className="runner-weapon-metric-label">
                                  🎲 Attacks
                                </span>
                                <strong>{weapon.profile.attacks}</strong>
                              </div>
                              <div className="runner-weapon-metric-chip is-hit">
                                <span className="runner-weapon-metric-label">
                                  🎯 Hit
                                </span>
                                <strong>{weapon.profile.skill}</strong>
                              </div>
                              <div className="runner-weapon-metric-chip is-damage">
                                <span className="runner-weapon-metric-label">
                                  💥 Damage
                                </span>
                                <strong>
                                  N {weapon.profile.damage} / C{' '}
                                  {weapon.profile.criticalDamage}
                                </strong>
                              </div>
                            </div>
                            {rules.length > 0 ? (
                              <div className="runner-weapon-rules">
                                {rules.map((rule) => (
                                  <span
                                    className="runner-weapon-rule-chip"
                                    key={rule}
                                  >
                                    {rule}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="runner-weapon-no-rules">
                                No special rules
                              </p>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div className="runner-weapon-list">
                    {[...nemesisRangedWeaponOptions]
                      .sort((a, b) => {
                        const aSelected =
                          selectedNemesisRangedWeaponIds.includes(a.id) ? 1 : 0;
                        const bSelected =
                          selectedNemesisRangedWeaponIds.includes(b.id) ? 1 : 0;
                        if (aSelected !== bSelected)
                          return bSelected - aSelected;
                        return a.profile.name.localeCompare(b.profile.name);
                      })
                      .map((option) => {
                        const selected =
                          selectedNemesisRangedWeaponIds.includes(option.id);
                        const rules = parseSpecialRules(
                          option.profile.specialRules
                        );
                        return (
                          <article
                            className="runner-weapon-card"
                            key={option.id}
                          >
                            <p className="runner-weapon-name">
                              {option.profile.name}{' '}
                              <small>({option.source})</small>
                            </p>
                            <div className="runner-weapon-metrics">
                              <div className="runner-weapon-metric-chip is-attacks">
                                <span className="runner-weapon-metric-label">
                                  🎲 Attacks
                                </span>
                                <strong>{option.profile.attacks}</strong>
                              </div>
                              <div className="runner-weapon-metric-chip is-hit">
                                <span className="runner-weapon-metric-label">
                                  🎯 Hit
                                </span>
                                <strong>{option.profile.skill}</strong>
                              </div>
                              <div className="runner-weapon-metric-chip is-damage">
                                <span className="runner-weapon-metric-label">
                                  💥 Damage
                                </span>
                                <strong>
                                  N {option.profile.damage} / C{' '}
                                  {option.profile.criticalDamage}
                                </strong>
                              </div>
                            </div>
                            {rules.length > 0 ? (
                              <div className="runner-weapon-rules">
                                {rules.map((rule) => (
                                  <span
                                    className="runner-weapon-rule-chip"
                                    key={rule}
                                  >
                                    {rule}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="runner-weapon-no-rules">
                                No special rules
                              </p>
                            )}
                            <button
                              type="button"
                              className={`incap-toggle${selected ? ' is-on' : ''}`}
                              onClick={() => {
                                setSelectedNemesisRangedWeaponIds((prev) =>
                                  selected
                                    ? prev.filter((id) => id !== option.id)
                                    : [...prev, option.id]
                                );
                              }}
                              aria-pressed={selected}
                              aria-label={`Toggle ranged weapon ${option.profile.name}`}
                            >
                              {selected ? 'Selected' : 'Select'}
                            </button>
                          </article>
                        );
                      })}
                  </div>
                )}
              </section>

              <section className="profile-weapon-group">
                <div className="deck-panel-header">
                  <h5>Nemesis Melee Weapons</h5>
                  <button
                    type="button"
                    onClick={() =>
                      setIsMeleeNemesisEditorOpen((prevIsOpen) => !prevIsOpen)
                    }
                  >
                    {isMeleeNemesisEditorOpen ? 'Done' : 'Edit Melee'}
                  </button>
                </div>
                <p className="team-selection-meta">
                  Official: {officialMeleeWeaponPool.length} · Consolidated:{' '}
                  {consolidatedMeleeWeaponPool.length}
                </p>
                {!showExtendedNemesisWeapons &&
                  officialMeleeWeaponPool.length === 0 && (
                    <p className="team-transfer-empty">
                      Official melee table not loaded yet. Consolidated entries
                      are generated from current operative profiles.
                    </p>
                  )}
                {!isMeleeNemesisEditorOpen ? (
                  selectedNemesisMeleeWeapons.length === 0 ? (
                    <p className="deck-collapsed-note">
                      No melee weapons selected.
                    </p>
                  ) : (
                    <div className="runner-weapon-list">
                      {selectedNemesisMeleeWeapons.map((weapon) => {
                        const rules = parseSpecialRules(
                          weapon.profile.specialRules
                        );
                        return (
                          <article
                            className="runner-weapon-card"
                            key={`selected-melee-${weapon.id}`}
                          >
                            <p className="runner-weapon-name">
                              {weapon.profile.name}{' '}
                              <small>({weapon.source})</small>
                            </p>
                            <div className="runner-weapon-metrics">
                              <div className="runner-weapon-metric-chip is-attacks">
                                <span className="runner-weapon-metric-label">
                                  🎲 Attacks
                                </span>
                                <strong>{weapon.profile.attacks}</strong>
                              </div>
                              <div className="runner-weapon-metric-chip is-hit">
                                <span className="runner-weapon-metric-label">
                                  🎯 Hit
                                </span>
                                <strong>{weapon.profile.skill}</strong>
                              </div>
                              <div className="runner-weapon-metric-chip is-damage">
                                <span className="runner-weapon-metric-label">
                                  💥 Damage
                                </span>
                                <strong>
                                  N {weapon.profile.damage} / C{' '}
                                  {weapon.profile.criticalDamage}
                                </strong>
                              </div>
                            </div>
                            {rules.length > 0 ? (
                              <div className="runner-weapon-rules">
                                {rules.map((rule) => (
                                  <span
                                    className="runner-weapon-rule-chip"
                                    key={rule}
                                  >
                                    {rule}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="runner-weapon-no-rules">
                                No special rules
                              </p>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div className="runner-weapon-list">
                    {[...nemesisMeleeWeaponOptions]
                      .sort((a, b) => {
                        const aSelected =
                          selectedNemesisMeleeWeaponIds.includes(a.id) ? 1 : 0;
                        const bSelected =
                          selectedNemesisMeleeWeaponIds.includes(b.id) ? 1 : 0;
                        if (aSelected !== bSelected)
                          return bSelected - aSelected;
                        return a.profile.name.localeCompare(b.profile.name);
                      })
                      .map((option) => {
                        const selected = selectedNemesisMeleeWeaponIds.includes(
                          option.id
                        );
                        const rules = parseSpecialRules(
                          option.profile.specialRules
                        );
                        return (
                          <article
                            className="runner-weapon-card"
                            key={option.id}
                          >
                            <p className="runner-weapon-name">
                              {option.profile.name}{' '}
                              <small>({option.source})</small>
                            </p>
                            <div className="runner-weapon-metrics">
                              <div className="runner-weapon-metric-chip is-attacks">
                                <span className="runner-weapon-metric-label">
                                  🎲 Attacks
                                </span>
                                <strong>{option.profile.attacks}</strong>
                              </div>
                              <div className="runner-weapon-metric-chip is-hit">
                                <span className="runner-weapon-metric-label">
                                  🎯 Hit
                                </span>
                                <strong>{option.profile.skill}</strong>
                              </div>
                              <div className="runner-weapon-metric-chip is-damage">
                                <span className="runner-weapon-metric-label">
                                  💥 Damage
                                </span>
                                <strong>
                                  N {option.profile.damage} / C{' '}
                                  {option.profile.criticalDamage}
                                </strong>
                              </div>
                            </div>
                            {rules.length > 0 ? (
                              <div className="runner-weapon-rules">
                                {rules.map((rule) => (
                                  <span
                                    className="runner-weapon-rule-chip"
                                    key={rule}
                                  >
                                    {rule}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="runner-weapon-no-rules">
                                No special rules
                              </p>
                            )}
                            <button
                              type="button"
                              className={`incap-toggle${selected ? ' is-on' : ''}`}
                              onClick={() => {
                                setSelectedNemesisMeleeWeaponIds((prev) =>
                                  selected
                                    ? prev.filter((id) => id !== option.id)
                                    : [...prev, option.id]
                                );
                              }}
                              aria-pressed={selected}
                              aria-label={`Toggle melee weapon ${option.profile.name}`}
                            >
                              {selected ? 'Selected' : 'Select'}
                            </button>
                          </article>
                        );
                      })}
                  </div>
                )}
              </section>
            </div>

            <div className="runner-weapon-section">
              <h5>Allegiance Traits</h5>
              <p className="team-selection-meta">
                Selected allegiance traits:{' '}
                {selectedNemesisAllegianceTraitIds.length} /{' '}
                {NEMESIS_TRAIT_LIMIT}
              </p>
              {isNemesisAllegianceTraitLimitExceeded && (
                <p className="deck-exhausted-note" role="status">
                  Warning: more than one allegiance trait selected. Manual
                  override is allowed.
                </p>
              )}
              <div className="runner-weapon-list">
                {NEMESIS_ALLEGIANCE_TRAITS.map((trait) => {
                  const selected = selectedNemesisAllegianceTraitIds.includes(
                    trait.id
                  );
                  return (
                    <article className="runner-weapon-card" key={trait.id}>
                      <p className="runner-weapon-name">{trait.name}</p>
                      <p className="runner-weapon-no-rules">
                        {trait.description}
                      </p>
                      <button
                        type="button"
                        className={`incap-toggle${selected ? ' is-on' : ''}`}
                        onClick={() => {
                          setSelectedNemesisAllegianceTraitIds((prev) =>
                            selected
                              ? prev.filter((id) => id !== trait.id)
                              : [...prev, trait.id]
                          );
                        }}
                        aria-pressed={selected}
                        aria-label={`Toggle allegiance trait ${trait.name}`}
                      >
                        {selected ? 'Selected' : 'Select'}
                      </button>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="runner-weapon-section">
              <h5>Nemesis Traits</h5>
              <p className="team-selection-meta">
                Selected nemesis traits: {selectedNemesisTraitIds.length} /{' '}
                {NEMESIS_TRAIT_LIMIT}
              </p>
              {isNemesisTraitLimitExceeded && (
                <p className="deck-exhausted-note" role="status">
                  Warning: more than one nemesis trait selected. Manual override
                  is allowed.
                </p>
              )}
              <div className="runner-weapon-list">
                {NEMESIS_TRAITS.map((trait) => {
                  const selected = selectedNemesisTraitIds.includes(trait.id);
                  return (
                    <article className="runner-weapon-card" key={trait.id}>
                      <p className="runner-weapon-name">{trait.name}</p>
                      <p className="runner-weapon-no-rules">
                        {trait.description}
                      </p>
                      <button
                        type="button"
                        className={`incap-toggle${selected ? ' is-on' : ''}`}
                        onClick={() => {
                          setSelectedNemesisTraitIds((prev) =>
                            selected
                              ? prev.filter((id) => id !== trait.id)
                              : [...prev, trait.id]
                          );
                        }}
                        aria-pressed={selected}
                        aria-label={`Toggle nemesis trait ${trait.name}`}
                      >
                        {selected ? 'Selected' : 'Select'}
                      </button>
                    </article>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={createNemesisOperative}
              disabled={!newNemesisName.trim()}
            >
              Create Nemesis Operative
            </button>

            {state.nemesisOperatives.length === 0 ? (
              <p className="team-transfer-empty">No nemesis operatives yet.</p>
            ) : (
              <ul>
                {state.nemesisOperatives.map((nemesis) => {
                  const profile = profileLookup.get(nemesis.profileId);
                  const weaponCount = [
                    ...(profile?.rangedWeapons ?? []),
                    ...(profile?.meleeWeapons ?? []),
                  ].reduce(
                    (total, weapon) => total + getWeaponSelectionCost(weapon),
                    0
                  );
                  const weaponLimit = getNemesisWeaponLimit(nemesis.size);
                  return (
                    <li key={nemesis.id}>
                      <span>
                        {nemesis.name} <small>({nemesis.size})</small>
                        <br />
                        <small>
                          Control: {profile?.apl ?? '-'} · Move:{' '}
                          {profile?.move ?? '-'} · Save: {profile?.save ?? '-'}{' '}
                          · Wounds: {profile?.wounds ?? '-'} · Weapons:{' '}
                          {weaponCount}/{weaponLimit}
                        </small>
                        {weaponCount > weaponLimit && (
                          <>
                            <br />
                            <small>
                              Warning: weapon selections exceed recommended
                              limit.
                            </small>
                          </>
                        )}
                      </span>
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => deleteNemesisOperative(nemesis.id)}
                      >
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <div className="backup-controls">
            <button type="button" onClick={exportProfiles}>
              Download Profiles Backup
            </button>
            <button
              type="button"
              onClick={() => profilesImportRef.current?.click()}
            >
              Import Profiles Backup
            </button>
            <input
              ref={profilesImportRef}
              type="file"
              accept="application/json,.json"
              onChange={handleProfilesImport}
              className="visually-hidden"
            />
          </div>
        </section>
      )}
    </div>
  );
}
