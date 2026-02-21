import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OperativeCard } from '@/components/datacard/OperativeCard';
import { Operative, Weapon, UniqueAction } from '@/types';

describe('OperativeCard', () => {
  const mockOperative: Operative = {
    id: 'test-operative',
    name: 'Test Operative',
    type: 'Trooper',
    stats: {
      movement: 6,
      actionPointLimit: 2,
      groupActivation: 1,
      defense: 3,
      save: 3,
      wounds: 18,
    },
    weapons: ['test-boltgun', 'test-knife'],
    abilities: ['Test Ability 1', 'Test Ability 2'],
    unique_actions: ['test-action-1', 'test-action-2'],
    keywords: ['Test', 'Infantry'],
    cost: 1,
  };

  const mockWeapons: Weapon[] = [
    {
      id: 'test-boltgun',
      name: 'Test Boltgun',
      type: 'ranged',
      profiles: [
        {
          attacks: 4,
          ballisticSkill: 3,
          damage: 3,
          criticalDamage: 4,
          specialRules: [
            {
              name: 'Range',
              value: '6"',
              description: 'Only operatives within distance 6" of the active operative can be valid targets',
            },
          ],
        },
      ],
    },
    {
      id: 'test-knife',
      name: 'Test Knife',
      type: 'melee',
      profiles: [
        {
          attacks: 3,
          weaponSkill: 3,
          damage: 3,
          criticalDamage: 4,
          specialRules: [],
        },
      ],
    },
    {
      id: 'unused-weapon',
      name: 'Unused Weapon',
      type: 'ranged',
      profiles: [
        {
          attacks: 5,
          ballisticSkill: 4,
          damage: 5,
          criticalDamage: 6,
          specialRules: [],
        },
      ],
    },
  ];

  const mockUniqueActions: UniqueAction[] = [
    {
      id: 'test-action-1',
      name: 'Test Action 1',
      description: 'Description for test action 1',
      cost: '1AP',
    },
    {
      id: 'test-action-2',
      name: 'Test Action 2',
      description: 'Description for test action 2',
      cost: '2AP',
    },
  ];

  it('renders operative name and type', () => {
    render(<OperativeCard operative={mockOperative} weapons={mockWeapons} />);
    expect(screen.getByText('Test Operative')).toBeInTheDocument();
    expect(screen.getByText('Trooper')).toBeInTheDocument();
  });

  it('renders operative stats', () => {
    render(<OperativeCard operative={mockOperative} weapons={mockWeapons} />);
    expect(screen.getByText('🏃 M')).toBeInTheDocument();
    expect(screen.getByText('6"')).toBeInTheDocument();
    expect(screen.getByText('⚡ APL')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('does not render DF stat', () => {
    render(<OperativeCard operative={mockOperative} weapons={mockWeapons} />);
    expect(screen.queryByText('🛡️ DF')).not.toBeInTheDocument();
    expect(screen.queryByText('DF')).not.toBeInTheDocument();
  });

  it('renders SV stat with shield emoji', () => {
    const { container } = render(<OperativeCard operative={mockOperative} weapons={mockWeapons} />);
    expect(screen.getByText('🛡️ SV')).toBeInTheDocument();
    // Check for SV value within the stats section
    const statsSection = container.querySelector('[data-stat="SV"]');
    expect(statsSection).toBeInTheDocument();
    expect(statsSection?.textContent).toContain('3+');
  });

  it('does not render GA stat', () => {
    render(<OperativeCard operative={mockOperative} weapons={mockWeapons} />);
    expect(screen.queryByText('👥 GA')).not.toBeInTheDocument();
    expect(screen.queryByText('GA')).not.toBeInTheDocument();
  });

  it('renders operative keywords', () => {
    render(<OperativeCard operative={mockOperative} weapons={mockWeapons} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('Infantry')).toBeInTheDocument();
  });

  it('renders weapons section when operative has weapons', () => {
    render(<OperativeCard operative={mockOperative} weapons={mockWeapons} />);
    expect(screen.getByText('Weapons')).toBeInTheDocument();
  });

  it('renders only weapons assigned to the operative', () => {
    render(<OperativeCard operative={mockOperative} weapons={mockWeapons} />);
    expect(screen.getByText('Test Boltgun')).toBeInTheDocument();
    expect(screen.getByText('Test Knife')).toBeInTheDocument();
    expect(screen.queryByText('Unused Weapon')).not.toBeInTheDocument();
  });

  it('displays ranged weapon type indicator', () => {
    render(<OperativeCard operative={mockOperative} weapons={mockWeapons} />);
    expect(screen.getByText('🎯 Ranged')).toBeInTheDocument();
  });

  it('displays melee weapon type indicator', () => {
    render(<OperativeCard operative={mockOperative} weapons={mockWeapons} />);
    expect(screen.getByText('⚔️ Melee')).toBeInTheDocument();
  });

  it('displays weapon profile stats for ranged weapons', () => {
    render(<OperativeCard operative={mockOperative} weapons={mockWeapons} />);
    expect(screen.getByText('BS')).toBeInTheDocument();
    const skillValues = screen.getAllByText('3+');
    expect(skillValues.length).toBeGreaterThan(0);
  });

  it('displays weapon profile stats for melee weapons', () => {
    render(<OperativeCard operative={mockOperative} weapons={mockWeapons} />);
    expect(screen.getByText('WS')).toBeInTheDocument();
  });

  it('displays attack dice count', () => {
    render(<OperativeCard operative={mockOperative} weapons={mockWeapons} />);
    const attackLabels = screen.getAllByText('A');
    expect(attackLabels.length).toBeGreaterThan(0);
  });

  it('displays damage and critical damage', () => {
    render(<OperativeCard operative={mockOperative} weapons={mockWeapons} />);
    const damageLabels = screen.getAllByText('D');
    const critLabels = screen.getAllByText('Crit');
    expect(damageLabels.length).toBeGreaterThan(0);
    expect(critLabels.length).toBeGreaterThan(0);
  });

  it('displays special rules when weapon has them', () => {
    render(<OperativeCard operative={mockOperative} weapons={mockWeapons} />);
    expect(screen.getByText('Rules:')).toBeInTheDocument();
    expect(screen.getByText('Range 6"')).toBeInTheDocument();
  });

  it('does not display weapons section when operative has no weapons', () => {
    const operativeWithNoWeapons: Operative = {
      ...mockOperative,
      weapons: [],
    };
    render(
      <OperativeCard
        operative={operativeWithNoWeapons}
        weapons={mockWeapons}
      />,
    );
    expect(screen.queryByText('Weapons')).not.toBeInTheDocument();
  });

  it('renders all profiles for weapons with multiple firing modes', () => {
    const weaponWithMultipleProfiles: Weapon = {
      id: 'plasma-pistol',
      name: 'Plasma Pistol',
      type: 'ranged',
      profiles: [
        {
          name: 'Standard',
          attacks: 4,
          ballisticSkill: 3,
          damage: 4,
          criticalDamage: 5,
          specialRules: [],
        },
        {
          name: 'Supercharge',
          attacks: 4,
          ballisticSkill: 3,
          damage: 5,
          criticalDamage: 6,
          specialRules: [],
        },
      ],
    };

    const operative: Operative = {
      ...mockOperative,
      weapons: ['plasma-pistol'],
    };

    render(
      <OperativeCard operative={operative} weapons={[weaponWithMultipleProfiles]} />,
    );
    expect(screen.getByText('Plasma Pistol')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText('Supercharge')).toBeInTheDocument();
  });

  describe('equipped loadout', () => {
    it('shows only selected weapons when selectedWeaponIds is provided', () => {
      render(
        <OperativeCard
          operative={mockOperative}
          weapons={mockWeapons}
          selectedWeaponIds={['test-boltgun']}
        />,
      );
      expect(screen.getByText('Test Boltgun')).toBeInTheDocument();
      expect(screen.queryByText('Test Knife')).not.toBeInTheDocument();
      expect(screen.queryByText('Unused Weapon')).not.toBeInTheDocument();
    });

    it('shows "Equipped Loadout" header when selectedWeaponIds is provided', () => {
      render(
        <OperativeCard
          operative={mockOperative}
          weapons={mockWeapons}
          selectedWeaponIds={['test-boltgun']}
        />,
      );
      expect(screen.getByText('⚔️ Equipped Loadout')).toBeInTheDocument();
      expect(screen.queryByText('Weapons')).not.toBeInTheDocument();
    });

    it('shows "Weapons" header when selectedWeaponIds is not provided', () => {
      render(<OperativeCard operative={mockOperative} weapons={mockWeapons} />);
      expect(screen.getByText('Weapons')).toBeInTheDocument();
      expect(screen.queryByText('⚔️ Equipped Loadout')).not.toBeInTheDocument();
    });

    it('shows multiple selected weapons', () => {
      render(
        <OperativeCard
          operative={mockOperative}
          weapons={mockWeapons}
          selectedWeaponIds={['test-boltgun', 'test-knife']}
        />,
      );
      expect(screen.getByText('Test Boltgun')).toBeInTheDocument();
      expect(screen.getByText('Test Knife')).toBeInTheDocument();
      expect(screen.queryByText('Unused Weapon')).not.toBeInTheDocument();
    });

    it('shows no weapons when selectedWeaponIds is empty array', () => {
      render(
        <OperativeCard
          operative={mockOperative}
          weapons={mockWeapons}
          selectedWeaponIds={[]}
        />,
      );
      expect(screen.queryByText('Weapons')).not.toBeInTheDocument();
      expect(screen.queryByText('⚔️ Equipped Loadout')).not.toBeInTheDocument();
      expect(screen.queryByText('Test Boltgun')).not.toBeInTheDocument();
      expect(screen.queryByText('Test Knife')).not.toBeInTheDocument();
    });
  });

  describe('abilities', () => {
    it('renders abilities section when operative has abilities', () => {
      render(<OperativeCard operative={mockOperative} weapons={mockWeapons} />);
      expect(screen.getByText('✨ Abilities')).toBeInTheDocument();
      expect(screen.getByText('Test Ability 1')).toBeInTheDocument();
      expect(screen.getByText('Test Ability 2')).toBeInTheDocument();
    });

    it('does not render abilities section when operative has no abilities', () => {
      const operativeWithNoAbilities: Operative = {
        ...mockOperative,
        abilities: [],
      };
      render(
        <OperativeCard
          operative={operativeWithNoAbilities}
          weapons={mockWeapons}
        />,
      );
      expect(screen.queryByText('✨ Abilities')).not.toBeInTheDocument();
    });

    it('does not render abilities section when abilities is undefined', () => {
      const operativeWithNoAbilities: Operative = {
        ...mockOperative,
        abilities: undefined,
      };
      render(
        <OperativeCard
          operative={operativeWithNoAbilities}
          weapons={mockWeapons}
        />,
      );
      expect(screen.queryByText('✨ Abilities')).not.toBeInTheDocument();
    });
  });

  describe('unique actions', () => {
    it('renders unique actions section when operative has unique actions', () => {
      render(
        <OperativeCard
          operative={mockOperative}
          weapons={mockWeapons}
          uniqueActions={mockUniqueActions}
        />,
      );
      expect(screen.getByText('⚡ Unique Actions')).toBeInTheDocument();
      expect(screen.getByText('Test Action 1')).toBeInTheDocument();
      expect(screen.getByText('Test Action 2')).toBeInTheDocument();
      expect(screen.getByText('Description for test action 1')).toBeInTheDocument();
      expect(screen.getByText('Description for test action 2')).toBeInTheDocument();
      expect(screen.getByText('1AP')).toBeInTheDocument();
      expect(screen.getByText('2AP')).toBeInTheDocument();
    });

    it('does not render unique actions section when operative has no unique actions', () => {
      const operativeWithNoActions: Operative = {
        ...mockOperative,
        unique_actions: [],
      };
      render(
        <OperativeCard
          operative={operativeWithNoActions}
          weapons={mockWeapons}
        />,
      );
      expect(screen.queryByText('⚡ Unique Actions')).not.toBeInTheDocument();
    });

    it('does not render unique actions section when unique_actions is undefined', () => {
      const operativeWithNoActions: Operative = {
        ...mockOperative,
        unique_actions: undefined,
      };
      render(
        <OperativeCard
          operative={operativeWithNoActions}
          weapons={mockWeapons}
        />,
      );
      expect(screen.queryByText('⚡ Unique Actions')).not.toBeInTheDocument();
    });
  });
});
