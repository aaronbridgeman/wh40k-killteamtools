/**
 * Unit tests for EventEquipmentTracker component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventEquipmentTracker } from '@/components/event/EventEquipmentTracker';
import { Faction, Equipment } from '@/types';
import { QUICK_PLAY_DEFAULTS } from '@/constants';

/** Minimal mock equipment items matching the plague marines structure */
const mockGrenades: Equipment = {
  id: QUICK_PLAY_DEFAULTS.BLIGHT_GRENADES_ID,
  name: 'Blight Grenades',
  category: 'faction',
  description: 'A ranged weapon. Max twice per battle.',
  usageLimit: 'Max twice per battle',
};

const mockPlagueRounds: Equipment = {
  id: 'plague-rounds',
  name: 'Plague Rounds',
  category: 'faction',
  description: 'Boltguns gain Poison and Severe.',
};

/** Minimal faction mock with just the fields EventEquipmentTracker needs */
const mockFaction: Faction = {
  id: 'plague-marines',
  name: 'Plague Marines',
  description: 'Test',
  rules: [],
  operatives: [],
  weapons: [],
  abilities: [],
  equipment: [mockGrenades, mockPlagueRounds],
  restrictions: { maxOperatives: 6 },
  metadata: { version: '1', source: 'Test', lastUpdated: '2024-01-01' },
};

describe('EventEquipmentTracker', () => {
  it('renders all faction equipment items', () => {
    render(
      <EventEquipmentTracker
        faction={mockFaction}
        universalEquipment={[]}
        selectedEquipmentIds={[]}
        blightGrenadeUsesRemaining={2}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText('Blight Grenades')).toBeInTheDocument();
    expect(screen.getByText('Plague Rounds')).toBeInTheDocument();
  });

  it('shows checkboxes as unchecked when nothing selected', () => {
    render(
      <EventEquipmentTracker
        faction={mockFaction}
        universalEquipment={[]}
        selectedEquipmentIds={[]}
        blightGrenadeUsesRemaining={2}
        onChange={vi.fn()}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((cb) => expect(cb).not.toBeChecked());
  });

  it('shows checkboxes as checked for selected items', () => {
    render(
      <EventEquipmentTracker
        faction={mockFaction}
        universalEquipment={[]}
        selectedEquipmentIds={['plague-rounds']}
        blightGrenadeUsesRemaining={2}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Select Plague Rounds')).toBeChecked();
    expect(screen.getByLabelText('Select Blight Grenades')).not.toBeChecked();
  });

  it('calls onChange with the item added when a checkbox is toggled on', () => {
    const onChange = vi.fn();
    render(
      <EventEquipmentTracker
        faction={mockFaction}
        universalEquipment={[]}
        selectedEquipmentIds={[]}
        blightGrenadeUsesRemaining={2}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByLabelText('Select Plague Rounds'));
    expect(onChange).toHaveBeenCalledWith(['plague-rounds'], 2);
  });

  it('calls onChange with the item removed when a checked checkbox is toggled off', () => {
    const onChange = vi.fn();
    render(
      <EventEquipmentTracker
        faction={mockFaction}
        universalEquipment={[]}
        selectedEquipmentIds={['plague-rounds']}
        blightGrenadeUsesRemaining={2}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByLabelText('Select Plague Rounds'));
    expect(onChange).toHaveBeenCalledWith([], 2);
  });

  it('does not show grenade tracker when Blight Grenades are not selected', () => {
    render(
      <EventEquipmentTracker
        faction={mockFaction}
        universalEquipment={[]}
        selectedEquipmentIds={[]}
        blightGrenadeUsesRemaining={2}
        onChange={vi.fn()}
      />
    );

    expect(screen.queryByText('💥 Blight Grenade Uses')).not.toBeInTheDocument();
  });

  it('resets grenade uses when Blight Grenades are deselected', () => {
    const onChange = vi.fn();
    render(
      <EventEquipmentTracker
        faction={mockFaction}
        universalEquipment={[]}
        selectedEquipmentIds={[QUICK_PLAY_DEFAULTS.BLIGHT_GRENADES_ID]}
        blightGrenadeUsesRemaining={1}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByLabelText('Select Blight Grenades'));
    // Deselecting should reset uses to max
    expect(onChange).toHaveBeenCalledWith(
      [],
      QUICK_PLAY_DEFAULTS.MAX_BLIGHT_GRENADE_USES
    );
  });

  it('shows note about Bombardier grenade bonus on operative card when Blight Grenades selected', () => {
    render(
      <EventEquipmentTracker
        faction={mockFaction}
        universalEquipment={[]}
        selectedEquipmentIds={[QUICK_PLAY_DEFAULTS.BLIGHT_GRENADES_ID]}
        blightGrenadeUsesRemaining={2}
        onChange={vi.fn()}
      />
    );

    // The setup page shows a hint about the Bombardier's card being updated
    expect(
      screen.getByText(/Bombardier's operative card now shows Blight Grenades/i)
    ).toBeInTheDocument();
  });

  it('renders universal equipment items in a separate section', () => {
    const mockUniversal: Equipment = {
      id: 'ammo-cache',
      name: 'Ammo Cache',
      category: 'universal',
      description: 'Resupply ammo once per TP.',
    };
    render(
      <EventEquipmentTracker
        faction={mockFaction}
        universalEquipment={[mockUniversal]}
        selectedEquipmentIds={[]}
        blightGrenadeUsesRemaining={2}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText('Ammo Cache')).toBeInTheDocument();
    expect(screen.getByText(/Generic Equipment/i)).toBeInTheDocument();
    expect(screen.getByText(/Faction Equipment/i)).toBeInTheDocument();
  });

  it('does not select a 5th item when the 4-item limit is reached', () => {
    const onChange = vi.fn();
    // Build 4 mock universal items and pre-select all 4
    const extra1: Equipment = { id: 'extra-1', name: 'Extra 1', category: 'universal', description: '' };
    const extra2: Equipment = { id: 'extra-2', name: 'Extra 2', category: 'universal', description: '' };
    const extra3: Equipment = { id: 'extra-3', name: 'Extra 3', category: 'universal', description: '' };
    const extra4: Equipment = { id: 'extra-4', name: 'Extra 4', category: 'universal', description: '' };
    const universalEquipment = [extra1, extra2, extra3, extra4];

    render(
      <EventEquipmentTracker
        faction={mockFaction}
        universalEquipment={universalEquipment}
        selectedEquipmentIds={['extra-1', 'extra-2', 'extra-3', 'extra-4']}
        blightGrenadeUsesRemaining={2}
        onChange={onChange}
      />
    );

    // When at max, we're in collapsed view — expand it first to see unselected items
    fireEvent.click(screen.getByLabelText('Change equipment selection'));

    // Clicking an already-unselected item (Plague Rounds — faction) should not call onChange
    fireEvent.click(screen.getByLabelText('Select Plague Rounds'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows the 4-item limit badge when all slots are filled (collapsed view)', () => {
    render(
      <EventEquipmentTracker
        faction={mockFaction}
        universalEquipment={[]}
        selectedEquipmentIds={[
          QUICK_PLAY_DEFAULTS.BLIGHT_GRENADES_ID,
          'plague-rounds',
          'universal-1',
          'universal-2',
        ]}
        blightGrenadeUsesRemaining={2}
        onChange={vi.fn()}
      />
    );

    // Collapsed view shows a badge, not the full warning
    expect(
      screen.getByText(/4 items selected/i)
    ).toBeInTheDocument();
  });

  it('shows the 4-item limit warning when expanded and all slots are filled', () => {
    render(
      <EventEquipmentTracker
        faction={mockFaction}
        universalEquipment={[]}
        selectedEquipmentIds={[
          QUICK_PLAY_DEFAULTS.BLIGHT_GRENADES_ID,
          'plague-rounds',
          'universal-1',
          'universal-2',
        ]}
        blightGrenadeUsesRemaining={2}
        onChange={vi.fn()}
      />
    );

    // Expand the collapsed view
    fireEvent.click(screen.getByLabelText('Change equipment selection'));

    expect(
      screen.getByText(/Maximum 4 equipment items selected/i)
    ).toBeInTheDocument();
  });

  it('does not show the limit warning when fewer than 4 items are selected', () => {
    render(
      <EventEquipmentTracker
        faction={mockFaction}
        universalEquipment={[]}
        selectedEquipmentIds={['plague-rounds']}
        blightGrenadeUsesRemaining={2}
        onChange={vi.fn()}
      />
    );

    expect(
      screen.queryByText(/Maximum 4 equipment items selected/i)
    ).not.toBeInTheDocument();
  });
});
