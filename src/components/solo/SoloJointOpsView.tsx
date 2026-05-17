import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import operativeCatalogData from '@/data/solo/operativeCatalog.json';
import './SoloJointOpsView.css';

type ActivationSide = 'player' | 'npo';
type SoloTab = 'game-runner' | 'list-builder' | 'profile-manager';
type NpoTeamSelectionRule =
  | 'manual'
  | 'random'
  | 'melee-heavy'
  | 'ranged-heavy'
  | 'elite'
  | 'horde';

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

interface RunnerOperative {
  id: string;
  side: ActivationSide;
  sourceOperativeId: string;
  name: string;
  profileId: string;
  damageTaken: number;
  injured: boolean;
}

interface SoloBackupFile {
  schemaVersion: 1;
  profiles?: SoloProfile[];
  lists?: SoloList[];
  teams?: SoloTeam[];
}

interface AddListOperativeInput {
  name: string;
  profileId: string;
  modelId?: string;
  teamId?: string;
  teamName?: string;
  customDescription?: string;
  requiresExplicitProfile?: boolean;
}

interface ProfileSelectOption {
  id: string;
  name: string;
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
const ALL_TEAMS_ID = '__all-teams__';
const CUSTOM_MODEL_ID = '__custom-model__';

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
    lists: [starterLists.player, starterLists.npo],
    teams: [starterTeams.player, starterTeams.npo],
    selectedPlayerListId: starterLists.player.id,
    selectedNpoListId: starterLists.npo.id,
    selectedPlayerTeamId: starterTeams.player.id,
    selectedNpoTeamId: starterTeams.npo.id,
    playerDeployed: false,
    npoDeployed: false,
    initiative: 'player' as ActivationSide,
    turningPoint: 1,
    activationNumber: 0,
    activeSide: 'player' as ActivationSide,
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
    isString(profile.behaviorRules)
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
      typeof operative.requiresExplicitProfile === 'boolean')
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
        playerDeployed: Boolean(maybe.playerDeployed),
        npoDeployed: Boolean(maybe.npoDeployed),
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

function SoloListEditor({
  side,
  lists,
  selectedListId,
  availableTeams,
  catalogOperatives,
  profiles,
  profileLookup,
  defaultTeamId,
  onSelectList,
  onCreateList,
  onDeleteList,
  onRenameList,
  onAddOperative,
  onRemoveOperative,
}: {
  side: ActivationSide;
  lists: SoloList[];
  selectedListId: string;
  availableTeams: CatalogTeam[];
  catalogOperatives: CatalogOperative[];
  profiles: SoloProfile[];
  profileLookup: Map<string, SoloProfile>;
  defaultTeamId: string;
  onSelectList: (listId: string) => void;
  onCreateList: (name: string) => void;
  onDeleteList: (listId: string) => void;
  onRenameList: (listId: string, name: string) => void;
  onAddOperative: (listId: string, operative: AddListOperativeInput) => void;
  onRemoveOperative: (listId: string, operativeId: string) => void;
}) {
  const [newListName, setNewListName] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState(defaultTeamId);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [selectedProfileOverrideId, setSelectedProfileOverrideId] =
    useState('');
  const [customModelDescription, setCustomModelDescription] = useState('');

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
  const [importMessage, setImportMessage] = useState<string | null>(null);

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

  const activeTeamLabel = useMemo(() => {
    if (state.activeSide === 'player') {
      return selectedPlayerTeam?.name ?? 'Player Team';
    }
    return selectedNpoTeam?.name ?? 'NPO Team';
  }, [selectedNpoTeam, selectedPlayerTeam, state.activeSide]);

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
          damageTaken: persisted?.damageTaken ?? 0,
          injured: persisted?.injured ?? false,
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
                },
              ],
            }
          : list
      ),
    }));
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

  const startActivationSequence = () => {
    setState((prev) => ({
      ...prev,
      activationNumber: 1,
      activeSide: prev.initiative,
    }));
  };

  const nextActivation = () => {
    setState((prev) => ({
      ...prev,
      activationNumber: prev.activationNumber + 1,
      activeSide: prev.activeSide === 'player' ? 'npo' : 'player',
    }));
  };

  const nextTurningPoint = () => {
    setState((prev) => ({
      ...prev,
      turningPoint: prev.turningPoint + 1,
      activationNumber: 0,
      activeSide: prev.initiative,
    }));
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

      if (importedProfiles.length === 0) {
        setImportMessage('No valid profiles were found in this backup file.');
        return;
      }

      setState((prev) => ({
        ...prev,
        profiles: importedProfiles,
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
  const selectedPlayerTeamSourceList = getTeamSourceList(selectedPlayerTeam);
  const selectedNpoTeamSourceList = getTeamSourceList(selectedNpoTeam);

  /**
   * Renders summary content for Datacard entries, resolved profiles,
   * or a fallback when the referenced profile cannot be found.
   */
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
    return (
      <div className="profile-summary">
        <p>
          APL {profile.apl} · Move {profile.move} · Save {profile.save} · Wounds{' '}
          {profile.wounds}
        </p>
        <p>
          Ranged:{' '}
          {profile.rangedWeapons.map((weapon) => weapon.name).join(', ') ||
            'None'}
        </p>
        <p>
          Melee:{' '}
          {profile.meleeWeapons.map((weapon) => weapon.name).join(', ') ||
            'None'}
        </p>
        {profile.behaviorRules && <p>Behavior: {profile.behaviorRules}</p>}
      </div>
    );
  };

  const handleTeamNameSubmit = (event: FormEvent) => {
    event.preventDefault();
  };

  return (
    <div className="solo-joint-ops-view">
      <header>
        <h2>Solo / Joint Ops</h2>
        <p>
          Game runner, list builder, and profile manager for solo or joint
          operations.
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
          className={activeTab === 'profile-manager' ? 'active' : ''}
          onClick={() => setActiveTab('profile-manager')}
        >
          Profile Manager
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
        <>
          <section className="solo-card">
            <h3>Game Runner</h3>
            <form className="team-builders" onSubmit={handleTeamNameSubmit}>
              <div className="team-builder">
                <label htmlFor="player-active-team">Active Player Team</label>
                <select
                  id="player-active-team"
                  value={selectedPlayerTeam?.id ?? ''}
                  onChange={(event) =>
                    updateState({ selectedPlayerTeamId: event.target.value })
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
                    selectedPlayerTeam && deleteTeam(selectedPlayerTeam.id)
                  }
                  disabled={playerTeams.length <= 1 || !selectedPlayerTeam}
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

                <label htmlFor="active-player-list">Source Player List</label>
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

                <ul className="team-selection-list">
                  {(selectedPlayerTeamSourceList?.operatives ?? []).map(
                    (operative) => (
                      <li key={operative.id}>
                        <label>
                          <input
                            type="checkbox"
                            checked={
                              selectedPlayerTeam?.operativeIds.includes(
                                operative.id
                              ) ?? false
                            }
                            onChange={() =>
                              selectedPlayerTeam &&
                              toggleTeamOperative(
                                selectedPlayerTeam.id,
                                operative.id
                              )
                            }
                          />
                          {operative.name}
                        </label>
                      </li>
                    )
                  )}
                </ul>
              </div>

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
                    onChange={(event) => setNewNpoTeamName(event.target.value)}
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
                    updateTeam(selectedNpoTeam.id, { name: event.target.value })
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

                <label htmlFor="npo-selection-rule">NPO Selection Rule</label>
                <select
                  id="npo-selection-rule"
                  value={selectedNpoTeam?.selectionRule ?? 'manual'}
                  onChange={(event) =>
                    selectedNpoTeam &&
                    updateTeam(selectedNpoTeam.id, {
                      selectionRule: event.target.value as NpoTeamSelectionRule,
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
                  {selectedNpoTeamSourceList?.operatives.length ?? 0} operatives
                </p>

                {selectedNpoTeam?.selectionRule === 'manual' ? (
                  <ul className="team-selection-list">
                    {(selectedNpoTeamSourceList?.operatives ?? []).map(
                      (operative) => (
                        <li key={operative.id}>
                          <label>
                            <input
                              type="checkbox"
                              checked={
                                selectedNpoTeam?.operativeIds.includes(
                                  operative.id
                                ) ?? false
                              }
                              onChange={() =>
                                selectedNpoTeam &&
                                toggleTeamOperative(
                                  selectedNpoTeam.id,
                                  operative.id
                                )
                              }
                            />
                            {operative.name}
                          </label>
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <ul className="team-selection-list">
                    {selectedNpoTeamOperatives.map((operative) => (
                      <li key={operative.id}>{operative.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            </form>
          </section>

          <section className="solo-card">
            <h3>Deployment</h3>
            <div className="deployment-grid">
              <label>
                <input
                  type="checkbox"
                  checked={state.playerDeployed}
                  onChange={(event) =>
                    updateState({ playerDeployed: event.target.checked })
                  }
                />
                {selectedPlayerTeam?.name ?? 'Player Team'} Deployed
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={state.npoDeployed}
                  onChange={(event) =>
                    updateState({ npoDeployed: event.target.checked })
                  }
                />
                {selectedNpoTeam?.name ?? 'NPO Team'} Deployed
              </label>
            </div>
          </section>

          <section className="solo-card">
            <h3>Activation</h3>
            <div className="activation-controls">
              <label htmlFor="initiative-side">Initiative</label>
              <select
                id="initiative-side"
                value={state.initiative}
                onChange={(event) =>
                  updateState({
                    initiative: event.target.value as ActivationSide,
                  })
                }
              >
                <option value="player">
                  {selectedPlayerTeam?.name ?? 'Player Team'}
                </option>
                <option value="npo">
                  {selectedNpoTeam?.name ?? 'NPO Team'}
                </option>
              </select>
              <button type="button" onClick={startActivationSequence}>
                Start Activations
              </button>
              <button
                type="button"
                onClick={nextActivation}
                disabled={state.activationNumber === 0}
              >
                Next Activation
              </button>
              <button type="button" onClick={nextTurningPoint}>
                Next Turning Point
              </button>
            </div>
            <p aria-live="polite" className="activation-status">
              Turning Point {state.turningPoint} · Activation{' '}
              {state.activationNumber} · Active: {activeTeamLabel}
            </p>
          </section>

          <section className="solo-card">
            <h3>Operative Runner Cards</h3>
            {runnerOperatives.length === 0 ? (
              <p>Add operatives in List Builder to run the game here.</p>
            ) : (
              <div className="npo-cards">
                {runnerOperatives.map((operative) => (
                  <article className="npo-card" key={operative.id}>
                    <h4>
                      {operative.name}{' '}
                      <small>
                        (
                        {operative.side === 'player'
                          ? (selectedPlayerTeam?.name ?? 'Player Team')
                          : (selectedNpoTeam?.name ?? 'NPO Team')}
                        )
                      </small>
                    </h4>
                    {renderProfileSummary(operative.profileId)}
                    <p>Damage Taken: {operative.damageTaken}</p>
                    <div className="input-row">
                      <button
                        type="button"
                        onClick={() =>
                          updateRunnerOperative(operative.id, {
                            damageTaken: Math.max(0, operative.damageTaken - 1),
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
                    <label>
                      <input
                        type="checkbox"
                        checked={operative.injured}
                        onChange={(event) =>
                          updateRunnerOperative(operative.id, {
                            injured: event.target.checked,
                          })
                        }
                      />
                      Injured
                    </label>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {activeTab === 'list-builder' && (
        <section className="solo-card">
          <h3>List Builder</h3>
          <p>
            Build and store player/NPO model lists with optional profile
            overrides. Player entries default to Datacard, while NPO and custom
            model entries use explicit profiles.
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

      {activeTab === 'profile-manager' && (
        <section className="solo-card">
          <h3>Profile Manager</h3>
          <p>
            Create and edit operative profiles used by lists. Profiles include
            core stats, ranged/melee weapon profiles, and behavior rules.
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
                APL
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
    </div>
  );
}
