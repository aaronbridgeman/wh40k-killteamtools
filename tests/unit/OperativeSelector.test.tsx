/**
 * Unit tests for OperativeSelector component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OperativeSelector } from '@/components/team/OperativeSelector';
import { Operative, Weapon, SelectedOperative } from '@/types';

describe('OperativeSelector', () => {
  const mockOperatives: Operative[] = [
    {
      id: 'op-1',
      name: 'Tactical Marine',
      type: 'Trooper',
      stats: {
        movement: 6,
        actionPointLimit: 2,
        groupActivation: 1,
        defense: 3,
        save: 3,
        wounds: 18,
      },
      weapons: ['weapon-1'],
      abilities: [],
      keywords: [],
      cost: 1,
    },
    {
      id: 'op-2',
      name: 'Sergeant',
      type: 'Leader',
      stats: {
        movement: 6,
        actionPointLimit: 2,
        groupActivation: 1,
        defense: 3,
        save: 3,
        wounds: 18,
      },
      weapons: ['weapon-2'],
      abilities: [],
      keywords: [],
      cost: 1,
    },
  ];

  const mockWeapons: Weapon[] = [
    {
      id: 'weapon-1',
      name: 'Boltgun',
      type: 'ranged',
      profiles: [
        {
          attacks: 4,
          ballisticSkill: 3,
          damage: 3,
          criticalDamage: 4,
          specialRules: [],
        },
      ],
    },
    {
      id: 'weapon-2',
      name: 'Power Sword',
      type: 'melee',
      profiles: [
        {
          attacks: 4,
          weaponSkill: 3,
          damage: 4,
          criticalDamage: 5,
          specialRules: [],
        },
      ],
    },
  ];

  it('renders operative selector with available operatives', () => {
    const onAdd = vi.fn();
    const onRemove = vi.fn();

    render(
      <OperativeSelector
        operatives={mockOperatives}
        weapons={mockWeapons}
        selectedOperatives={[]}
        onAddOperative={onAdd}
        onRemoveOperative={onRemove}
      />
    );

    expect(screen.getByText('Select Operatives')).toBeInTheDocument();
    expect(screen.getByText('Tactical Marine')).toBeInTheDocument();
    expect(screen.getByText('Sergeant')).toBeInTheDocument();
  });

  it('displays empty message when no operatives selected', () => {
    const onAdd = vi.fn();
    const onRemove = vi.fn();

    render(
      <OperativeSelector
        operatives={mockOperatives}
        weapons={mockWeapons}
        selectedOperatives={[]}
        onAddOperative={onAdd}
        onRemoveOperative={onRemove}
      />
    );

    expect(screen.getByText('No operatives selected yet')).toBeInTheDocument();
  });

  it('opens weapon selection modal when add button clicked', () => {
    const onAdd = vi.fn();
    const onRemove = vi.fn();

    render(
      <OperativeSelector
        operatives={mockOperatives}
        weapons={mockWeapons}
        selectedOperatives={[]}
        onAddOperative={onAdd}
        onRemoveOperative={onRemove}
      />
    );

    const addButtons = screen.getAllByRole('button', { name: /Add/ });
    fireEvent.click(addButtons[0]);

    // Should open the weapon selection modal
    expect(screen.getByText(/Tactical Marine - Trooper/)).toBeInTheDocument();
    
    // onAdd should not be called yet (modal is open)
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('displays selected operatives', () => {
    const onAdd = vi.fn();
    const onRemove = vi.fn();

    const selectedOps: SelectedOperative[] = [
      {
        selectionId: 'sel-1',
        operative: mockOperatives[0],
        selectedWeaponIds: ['weapon-1'],
      },
    ];

    render(
      <OperativeSelector
        operatives={mockOperatives}
        weapons={mockWeapons}
        selectedOperatives={selectedOps}
        onAddOperative={onAdd}
        onRemoveOperative={onRemove}
      />
    );

    expect(screen.getByText('Boltgun')).toBeInTheDocument();
  });

  it('calls onRemoveOperative when remove button clicked', () => {
    const onAdd = vi.fn();
    const onRemove = vi.fn();

    const selectedOps: SelectedOperative[] = [
      {
        selectionId: 'sel-1',
        operative: mockOperatives[0],
        selectedWeaponIds: ['weapon-1'],
      },
    ];

    render(
      <OperativeSelector
        operatives={mockOperatives}
        weapons={mockWeapons}
        selectedOperatives={selectedOps}
        onAddOperative={onAdd}
        onRemoveOperative={onRemove}
      />
    );

    const removeButton = screen.getByRole('button', {
      name: /Remove Tactical Marine/,
    });
    fireEvent.click(removeButton);

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledWith('sel-1');
  });

  it('displays operative count', () => {
    const onAdd = vi.fn();
    const onRemove = vi.fn();

    const selectedOps: SelectedOperative[] = [
      {
        selectionId: 'sel-1',
        operative: mockOperatives[0],
        selectedWeaponIds: ['weapon-1'],
      },
    ];

    render(
      <OperativeSelector
        operatives={mockOperatives}
        weapons={mockWeapons}
        selectedOperatives={selectedOps}
        onAddOperative={onAdd}
        onRemoveOperative={onRemove}
        maxOperatives={6}
      />
    );

    expect(screen.getByText('1 / 6')).toBeInTheDocument();
  });

  it('disables add buttons when max operatives reached', () => {
    const onAdd = vi.fn();
    const onRemove = vi.fn();

    const selectedOps: SelectedOperative[] = [
      {
        selectionId: 'sel-1',
        operative: mockOperatives[0],
        selectedWeaponIds: ['weapon-1'],
      },
    ];

    render(
      <OperativeSelector
        operatives={mockOperatives}
        weapons={mockWeapons}
        selectedOperatives={selectedOps}
        onAddOperative={onAdd}
        onRemoveOperative={onRemove}
        maxOperatives={1}
      />
    );

    const addButtons = screen.getAllByRole('button', { name: /Add/ });
    expect(addButtons[0]).toBeDisabled();
  });
});
