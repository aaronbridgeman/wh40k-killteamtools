# Adding a New Faction to Kill Team Dataslate

This guide explains how to add a new faction to the Kill Team Dataslate application. Follow these steps to ensure your faction data is properly integrated and displayed.

## Overview

Each faction in the app consists of:
- A unique identifier
- Metadata (name, description, version, source)
- Operatives (team members with stats and equipment)
- Weapons (ranged and melee with profiles)
- Abilities (actions, passives, unique actions)
- Faction rules (strategic, tactical, passive)
- Team restrictions (min/max operatives, fire team rules)

## Step-by-Step Guide

### 1. Create Faction Directory Structure

Create a new directory under `src/data/factions/` with your faction's ID:

```
src/data/factions/
└── your-faction-id/
    └── faction.json
```

**Naming convention**: Use lowercase with hyphens (e.g., `angels-of-death`, `plague-marines`, `tau-fire-warriors`)

### 2. Create faction.json

Copy the template below and fill in your faction's data:

```json
{
  "id": "your-faction-id",
  "name": "Your Faction Name",
  "description": "A brief description of your faction",
  "rules": [
    {
      "id": "faction-rule-id",
      "name": "Rule Name",
      "description": "What the rule does",
      "type": "passive"
    }
  ],
  "operatives": [
    {
      "id": "operative-id",
      "name": "Operative Name",
      "type": "Trooper",
      "stats": {
        "movement": 6,
        "actionPointLimit": 2,
        "groupActivation": 1,
        "defense": 3,
        "save": 3,
        "wounds": 18
      },
      "weapons": ["weapon-id-1", "weapon-id-2"],
      "abilities": ["ability-id-1"],
      "keywords": ["Keyword1", "Keyword2"],
      "cost": 1
    }
  ],
  "weapons": [
    {
      "id": "weapon-id",
      "name": "Weapon Name",
      "type": "ranged",
      "profiles": [
        {
          "attacks": 4,
          "ballisticSkill": 3,
          "damage": 3,
          "criticalDamage": 4,
          "specialRules": [
            {
              "name": "Range",
              "value": "6\"",
              "description": "Only operatives within distance 6\" of the active operative can be valid targets"
            }
          ]
        }
      ]
    }
  ],
  "abilities": [
    {
      "id": "ability-id",
      "name": "Ability Name",
      "type": "action",
      "cost": "1AP",
      "description": "What the ability does"
    }
  ],
  "restrictions": {
    "maxOperatives": 6,
    "minOperatives": 6,
    "fireTeamRules": [
      "Must include 1 Leader operative",
      "Can include specialists as per fire team composition"
    ],
    "other": []
  },
  "metadata": {
    "version": "1.0.0",
    "source": "Kill Team Core Book",
    "lastUpdated": "2024-01-01"
  }
}
```

### 3. Data Field Specifications

#### Faction Level

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (lowercase-with-hyphens) |
| `name` | string | Yes | Display name |
| `description` | string | Yes | Brief faction description |
| `rules` | array | Yes | Faction-specific rules |
| `operatives` | array | Yes | Available operatives |
| `weapons` | array | Yes | All weapons available to faction |
| `abilities` | array | Yes | All abilities available to faction |
| `restrictions` | object | Yes | Team composition rules |
| `metadata` | object | Yes | Version and source information |

#### Operative Stats

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `movement` | number | Yes | Movement in inches |
| `actionPointLimit` | number | Yes | APL (usually 2 or 3) |
| `groupActivation` | number | Yes | GA value (usually 1) |
| `defense` | number | Yes | Defense dice |
| `save` | number | Yes | Save target number (3+ = 3) |
| `wounds` | number | Yes | Wound characteristic |

#### Operative Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `name` | string | Yes | Operative name |
| `type` | string | Yes | Role (Trooper, Leader, Fighter, Heavy Gunner, etc.) |
| `stats` | object | Yes | Stats object (see above) |
| `weapons` | array | Yes | Array of weapon IDs this operative can use |
| `abilities` | array | Yes | Array of ability IDs this operative has |
| `keywords` | array | Yes | Array of keyword strings |
| `cost` | number | Yes | Fire team cost or points cost |
| `image` | string | No | Path to operative image (relative to public/images/operatives/) |
| `description` | string | No | Additional flavor text |

#### Weapon Types and Profiles

**Weapon Types**: `"ranged"` or `"melee"`

**Ranged Weapon Profile**:
```json
{
  "name": "Profile Name (optional)",
  "attacks": 4,
  "ballisticSkill": 3,
  "damage": 3,
  "criticalDamage": 4,
  "specialRules": []
}
```

**Melee Weapon Profile**:
```json
{
  "name": "Profile Name (optional)",
  "attacks": 4,
  "weaponSkill": 3,
  "damage": 4,
  "criticalDamage": 5,
  "specialRules": []
}
```

**Note**: Use `ballisticSkill` for ranged, `weaponSkill` for melee.

#### Special Rules Format

```json
{
  "name": "Rule Name",
  "value": "6\"",
  "description": "Full description of what the rule does"
}
```

Common special rules:
- Range: `{"name": "Range", "value": "6\"", "description": "..."}`
- Piercing: `{"name": "Piercing", "value": "1", "description": "..."}`
- Lethal: `{"name": "Lethal", "value": "5+", "description": "..."}`
- Heavy, Ceaseless, Balanced, Hot (value optional)

#### Ability Types

| Type | Description |
|------|-------------|
| `"action"` | Costs AP to use |
| `"passive"` | Always active |
| `"unique"` | One-time or limited use |

**Cost format**: `"1AP"`, `"2AP"`, `null` for passive abilities

#### Faction Rule Types

| Type | Description |
|------|-------------|
| `"strategic"` | Strategic ploys |
| `"tactical"` | Tactical ploys |
| `"passive"` | Always-active rules |

### 4. Register Faction in dataLoader

Edit `src/services/dataLoader.ts` to add your faction ID to the `FACTION_IDS` array:

```typescript
export const FACTION_IDS = [
  'angels-of-death',
  'plague-marines',
  'your-faction-id',  // Add your faction here
] as const;
```

### 5. Add Operative Images (Optional)

If you want to include operative images:

1. Create directory: `public/images/operatives/your-faction-id/`
2. Add images named after operative IDs (e.g., `operative-id.png`, `operative-id.jpg`)
3. Reference in faction.json: `"image": "/images/operatives/your-faction-id/operative-id.png"`

**Image guidelines**:
- Format: PNG or JPEG
- Recommended size: 400x600px or similar portrait ratio
- Keep file sizes reasonable (<500KB per image)

### 6. Validation Checklist

Before committing your faction data, verify:

- [ ] Faction ID is unique and follows naming convention
- [ ] All operative IDs are unique within the faction
- [ ] All weapon IDs are unique within the faction
- [ ] All ability IDs are unique within the faction
- [ ] Each operative references valid weapon and ability IDs
- [ ] Stats are valid numbers (no negative values)
- [ ] Weapon types are either "ranged" or "melee"
- [ ] Ranged weapons use `ballisticSkill`, melee use `weaponSkill`
- [ ] Ability types are "action", "passive", or "unique"
- [ ] Faction rule types are "strategic", "tactical", or "passive"
- [ ] JSON is valid (use a validator or linter)
- [ ] Team restrictions are logical (min ≤ max)

### 7. Testing Your Faction

1. **Build the app**: `npm run build`
2. **Run dev server**: `npm run dev`
3. **Test in browser**:
   - Select your faction from dropdown
   - Verify all operatives display correctly
   - Check all weapons and abilities appear
   - Test team building in "Selected Team" view
   - Verify team restrictions work correctly

4. **Run tests**: `npm run test`
5. **Run validation**: `npm run validate`

### 8. Common Issues and Solutions

#### "Cannot find module" error
- Ensure your faction.json is in the correct directory
- Check that you added the faction ID to dataLoader.ts

#### Operative not displaying
- Verify operative has valid weapon and ability references
- Check that all referenced IDs exist in the weapons/abilities arrays

#### Weapons not showing
- Ensure weapon type is exactly "ranged" or "melee"
- For ranged: use `ballisticSkill`
- For melee: use `weaponSkill`

#### Stats displaying incorrectly
- All stats must be numbers, not strings
- Save values: 3+ should be entered as `3`, not `"3+"`

#### Team restrictions not working
- Ensure maxOperatives and minOperatives are numbers
- fireTeamRules should be array of strings

## Example: Complete Minimal Faction

Here's a complete, minimal faction for reference:

```json
{
  "id": "example-faction",
  "name": "Example Faction",
  "description": "An example faction for testing",
  "rules": [
    {
      "id": "example-rule",
      "name": "Example Rule",
      "description": "This faction gets +1 to cool",
      "type": "passive"
    }
  ],
  "operatives": [
    {
      "id": "example-trooper",
      "name": "Example Trooper",
      "type": "Trooper",
      "stats": {
        "movement": 6,
        "actionPointLimit": 2,
        "groupActivation": 1,
        "defense": 3,
        "save": 4,
        "wounds": 8
      },
      "weapons": ["example-rifle", "example-knife"],
      "abilities": [],
      "keywords": ["Infantry", "Trooper"],
      "cost": 1
    }
  ],
  "weapons": [
    {
      "id": "example-rifle",
      "name": "Example Rifle",
      "type": "ranged",
      "profiles": [
        {
          "attacks": 4,
          "ballisticSkill": 4,
          "damage": 2,
          "criticalDamage": 3,
          "specialRules": []
        }
      ]
    },
    {
      "id": "example-knife",
      "name": "Example Knife",
      "type": "melee",
      "profiles": [
        {
          "attacks": 3,
          "weaponSkill": 4,
          "damage": 2,
          "criticalDamage": 3,
          "specialRules": []
        }
      ]
    }
  ],
  "abilities": [],
  "restrictions": {
    "maxOperatives": 10,
    "minOperatives": 6,
    "fireTeamRules": ["Must include at least 1 Leader"],
    "other": []
  },
  "metadata": {
    "version": "1.0.0",
    "source": "Example Rulebook",
    "lastUpdated": "2024-01-01"
  }
}
```

## Tips for Copilot/AI Agents

When using GitHub Copilot or AI agents to add factions:

1. **Start with existing factions**: Copy `angels-of-death` or `plague-marines` as a template
2. **Validate JSON**: Always use a JSON validator before committing
3. **Check IDs**: Ensure all IDs are unique and referenced correctly
4. **Test immediately**: Build and test after creating the faction
5. **Follow conventions**: Keep naming consistent with existing factions
6. **Use TypeScript types**: The app has type definitions in `src/types/` - refer to these for correct structure

## Getting Help

If you encounter issues:
1. Check the console in browser dev tools for errors
2. Review existing faction files for examples
3. Ensure all JSON is valid
4. Verify TypeScript types match your data structure
5. Run `npm run validate` to catch common issues

## Legal Note

When adding factions:
- Use only game mechanics (stats, rules text)
- Do NOT copy official artwork or images
- Do NOT copy copyrighted flavor text
- Keep descriptions brief and generic
- This is for personal, non-commercial use only
