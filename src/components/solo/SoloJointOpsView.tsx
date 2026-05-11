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
  teamId?: string;
  teamName?: string;
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

const buildInitialState = () => {
  const starterProfile = defaultProfile();
  const starterLists = createDefaultLists();
  return {
    profiles: [starterProfile],
    lists: [starterLists.player, starterLists.npo],
    selectedPlayerListId: starterLists.player.id,
    selectedNpoListId: starterLists.npo.id,
    playerTeamName: 'Player Kill Team',
    npoTeamName: 'NPO Team',
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
    (operative.teamId === undefined || isString(operative.teamId)) &&
    (operative.teamName === undefined || isString(operative.teamName))
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

      return {
        profiles,
        lists,
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
        playerTeamName: isString(maybe.playerTeamName)
          ? maybe.playerTeamName
          : fallback.playerTeamName,
        npoTeamName: isString(maybe.npoTeamName)
          ? maybe.npoTeamName
          : fallback.npoTeamName,
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
  profileLookup,
  defaultTeamId,
  onSelectList,
  onCreateList,
  onDeleteList,
  onRenameList,
  onAddCatalogOperative,
  onRemoveOperative,
}: {
  side: ActivationSide;
  lists: SoloList[];
  selectedListId: string;
  availableTeams: CatalogTeam[];
  catalogOperatives: CatalogOperative[];
  profileLookup: Map<string, SoloProfile>;
  defaultTeamId: string;
  onSelectList: (listId: string) => void;
  onCreateList: (name: string) => void;
  onDeleteList: (listId: string) => void;
  onRenameList: (listId: string, name: string) => void;
  onAddCatalogOperative: (listId: string, operative: CatalogOperative) => void;
  onRemoveOperative: (listId: string, operativeId: string) => void;
}) {
  const [newListName, setNewListName] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState(defaultTeamId);
  const [selectedCatalogOperativeId, setSelectedCatalogOperativeId] =
    useState('');

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
    if (
      filteredCatalogOperatives.length > 0 &&
      !filteredCatalogOperatives.some(
        (operative) => operative.id === selectedCatalogOperativeId
      )
    ) {
      setSelectedCatalogOperativeId(filteredCatalogOperatives[0].id);
      return;
    }

    if (filteredCatalogOperatives.length === 0) {
      setSelectedCatalogOperativeId('');
    }
  }, [filteredCatalogOperatives, selectedCatalogOperativeId]);

  const selectedCatalogOperative =
    filteredCatalogOperatives.find(
      (operative) => operative.id === selectedCatalogOperativeId
    ) ?? null;

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
          value={selectedCatalogOperativeId}
          onChange={(event) =>
            setSelectedCatalogOperativeId(event.target.value)
          }
          aria-label={`${sideLabel} operative selection`}
        >
          {groupedCatalogOperatives.length === 0 && (
            <option value="">No operatives available</option>
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
        </select>

        <button
          type="button"
          onClick={() => {
            if (!selectedCatalogOperative) return;
            if (!selectedList.id) return;
            onAddCatalogOperative(selectedList.id, selectedCatalogOperative);
          }}
          disabled={!selectedCatalogOperative || !selectedList.id}
        >
          Add {sideLabel} Operative
        </button>
      </div>

      <ul>
        {selectedList.operatives.map((operative) => (
          <li key={operative.id}>
            <span>
              {operative.name}{' '}
              <small>({operative.teamName ?? 'Unknown Team'})</small>
            </span>
            <button
              type="button"
              onClick={() => onRemoveOperative(selectedList.id, operative.id)}
            >
              Remove
            </button>
          </li>
        ))}
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

  const selectedPlayerList =
    playerLists.find((list) => list.id === state.selectedPlayerListId) ??
    playerLists[0] ??
    null;
  const selectedNpoList =
    npoLists.find((list) => list.id === state.selectedNpoListId) ??
    npoLists[0] ??
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

  const activeTeamLabel = useMemo(
    () =>
      state.activeSide === 'player' ? state.playerTeamName : state.npoTeamName,
    [state.activeSide, state.playerTeamName, state.npoTeamName]
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
    const activeOperatives = [
      ...(selectedPlayerList?.operatives.map((operative) => ({
        ...operative,
        side: 'player' as const,
      })) ?? []),
      ...(selectedNpoList?.operatives.map((operative) => ({
        ...operative,
        side: 'npo' as const,
      })) ?? []),
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
  }, [selectedPlayerList, selectedNpoList]);

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

  const addCatalogOperativeToList = (
    listId: string,
    operative: CatalogOperative
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
                  profileId: operative.profile.id,
                  teamId: operative.teamId,
                  teamName: operative.teamName,
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
                  profileId:
                    list.side === 'player'
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

      setState((prev) => ({
        ...prev,
        lists: importedLists,
        selectedPlayerListId: firstPlayer.id,
        selectedNpoListId: firstNpo.id,
      }));
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
                <label htmlFor="player-team-name">Player Team Name</label>
                <input
                  id="player-team-name"
                  value={state.playerTeamName}
                  onChange={(event) =>
                    updateState({ playerTeamName: event.target.value })
                  }
                />
                <label htmlFor="active-player-list">Active Player List</label>
                <select
                  id="active-player-list"
                  value={selectedPlayerList?.id ?? ''}
                  onChange={(event) =>
                    updateState({ selectedPlayerListId: event.target.value })
                  }
                >
                  {playerLists.map((list) => (
                    <option key={list.id} value={list.id}>
                      {list.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="team-builder">
                <label htmlFor="npo-team-name">NPO Team Name</label>
                <input
                  id="npo-team-name"
                  value={state.npoTeamName}
                  onChange={(event) =>
                    updateState({ npoTeamName: event.target.value })
                  }
                />
                <label htmlFor="active-npo-list">Active NPO List</label>
                <select
                  id="active-npo-list"
                  value={selectedNpoList?.id ?? ''}
                  onChange={(event) =>
                    updateState({ selectedNpoListId: event.target.value })
                  }
                >
                  {npoLists.map((list) => (
                    <option key={list.id} value={list.id}>
                      {list.name}
                    </option>
                  ))}
                </select>
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
                {state.playerTeamName} Deployed
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={state.npoDeployed}
                  onChange={(event) =>
                    updateState({ npoDeployed: event.target.checked })
                  }
                />
                {state.npoTeamName} Deployed
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
                <option value="player">{state.playerTeamName}</option>
                <option value="npo">{state.npoTeamName}</option>
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
                          ? state.playerTeamName
                          : state.npoTeamName}
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
            Build and store player/NPO operative lists with profile assignments.
            Player lists default to Datacard profile selection.
          </p>

          <div className="team-builders">
            {playerLists.length > 0 && selectedPlayerList && (
              <SoloListEditor
                side="player"
                lists={playerLists}
                selectedListId={selectedPlayerList.id}
                availableTeams={playerCatalogTeams}
                catalogOperatives={operativeCatalog.operatives}
                profileLookup={profileLookup}
                defaultTeamId={selectedPlayerTeamForList}
                onSelectList={(listId) =>
                  updateState({ selectedPlayerListId: listId })
                }
                onCreateList={(name) => addList('player', name)}
                onDeleteList={deleteList}
                onRenameList={renameList}
                onAddCatalogOperative={addCatalogOperativeToList}
                onRemoveOperative={removeOperativeFromList}
              />
            )}

            {npoLists.length > 0 && selectedNpoList && (
              <SoloListEditor
                side="npo"
                lists={npoLists}
                selectedListId={selectedNpoList.id}
                availableTeams={npoCatalogTeams}
                catalogOperatives={operativeCatalog.operatives}
                profileLookup={profileLookup}
                defaultTeamId={selectedNpoTeamForList}
                onSelectList={(listId) =>
                  updateState({ selectedNpoListId: listId })
                }
                onCreateList={(name) => addList('npo', name)}
                onDeleteList={deleteList}
                onRenameList={renameList}
                onAddCatalogOperative={addCatalogOperativeToList}
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
