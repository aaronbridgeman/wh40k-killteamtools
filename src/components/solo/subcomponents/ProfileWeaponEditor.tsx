import type { SoloWeaponProfile } from '../SoloJointOpsView';

/**
 * ProfileWeaponEditor - Editor for a list of weapon profiles.
 * @param title Section title
 * @param weapons List of weapon profiles
 * @param onChange Callback for updating the weapon list
 */
export function ProfileWeaponEditor({
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
        onClick={() =>
          onChange([
            ...weapons,
            { ...weapons[0], id: `${title} Weapon ${weapons.length + 1}` },
          ])
        }
      >
        Add {title} Weapon
      </button>
    </section>
  );
}
