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
        selectedEquipmentIds={['plague-rounds']}
        blightGrenadeUsesRemaining={2}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByLabelText('Select Plague Rounds'));
    expect(onChange).toHaveBeenCalledWith([], 2);
  });

  it('shows grenade usage tracker when Blight Grenades are selected', () => {
    render(
      <EventEquipmentTracker
        faction={mockFaction}
        selectedEquipmentIds={[QUICK_PLAY_DEFAULTS.BLIGHT_GRENADES_ID]}
        blightGrenadeUsesRemaining={2}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText('💥 Blight Grenade Uses')).toBeInTheDocument();
    expect(
      screen.getByLabelText(
        `2 of ${QUICK_PLAY_DEFAULTS.MAX_BLIGHT_GRENADE_USES} grenade uses remaining`
      )
    ).toBeInTheDocument();
  });

  it('does not show grenade tracker when Blight Grenades are not selected', () => {
    render(
      <EventEquipmentTracker
        faction={mockFaction}
        selectedEquipmentIds={[]}
        blightGrenadeUsesRemaining={2}
        onChange={vi.fn()}
      />
    );

    expect(screen.queryByText('💥 Blight Grenade Uses')).not.toBeInTheDocument();
  });

  it('decrements grenade uses when Use Grenade is clicked', () => {
    const onChange = vi.fn();
    render(
      <EventEquipmentTracker
        faction={mockFaction}
        selectedEquipmentIds={[QUICK_PLAY_DEFAULTS.BLIGHT_GRENADES_ID]}
        blightGrenadeUsesRemaining={2}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByLabelText('Use one Blight Grenade (counts against battle limit)'));
    expect(onChange).toHaveBeenCalledWith(
      [QUICK_PLAY_DEFAULTS.BLIGHT_GRENADES_ID],
      1
    );
  });

  it('disables Use Grenade button when uses are expended', () => {
    render(
      <EventEquipmentTracker
        faction={mockFaction}
        selectedEquipmentIds={[QUICK_PLAY_DEFAULTS.BLIGHT_GRENADES_ID]}
        blightGrenadeUsesRemaining={0}
        onChange={vi.fn()}
      />
    );

    expect(
      screen.getByLabelText('Use one Blight Grenade (counts against battle limit)')
    ).toBeDisabled();
  });

  it('resets grenade uses when Blight Grenades are deselected', () => {
    const onChange = vi.fn();
    render(
      <EventEquipmentTracker
        faction={mockFaction}
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

  it('shows note about Bombardier grenade bonus', () => {
    render(
      <EventEquipmentTracker
        faction={mockFaction}
        selectedEquipmentIds={[QUICK_PLAY_DEFAULTS.BLIGHT_GRENADES_ID]}
        blightGrenadeUsesRemaining={2}
        onChange={vi.fn()}
      />
    );

    expect(
      screen.getByText(/Bombardier's grenades do not count towards this limit/i)
    ).toBeInTheDocument();
  });
});
