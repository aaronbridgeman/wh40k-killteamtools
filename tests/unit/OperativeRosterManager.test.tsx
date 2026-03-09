/**
 * Unit tests for OperativeRosterManager component
 *
 * Uses the real Plague Marines faction data (via loadFaction) so that operative
 * IDs, types, and the full 7-operative roster are accurately reflected.
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OperativeRosterManager } from '@/components/event/OperativeRosterManager';
import { loadFaction } from '@/services/dataLoader';
import { Faction } from '@/types';
import { QUICK_PLAY_DEFAULTS } from '@/constants';

describe('OperativeRosterManager', () => {
  let faction: Faction;

  beforeAll(async () => {
    faction = await loadFaction('plague-marines');
  });

  it('renders all 7 plague marine operatives', () => {
    render(
      <OperativeRosterManager
        faction={faction}
        removedOperativeId={null}
        selectedEquipmentIds={[]}
        onRosterChange={vi.fn()}
      />
    );

    // All 7 operatives should be visible
    expect(screen.getByText('Plague Marine Champion')).toBeInTheDocument();
    expect(screen.getByText('Plague Marine Bombardier')).toBeInTheDocument();
    expect(screen.getByText('Plague Marine Fighter')).toBeInTheDocument();
    expect(screen.getByText('Plague Marine Heavy Gunner')).toBeInTheDocument();
    expect(screen.getByText('Plague Marine Icon Bearer')).toBeInTheDocument();
    expect(screen.getByText('Malignant Plaguecaster')).toBeInTheDocument();
    expect(screen.getByText('Plague Marine Warrior')).toBeInTheDocument();
  });

  it('shows the leader cannot-remove badge for the Champion', () => {
    render(
      <OperativeRosterManager
        faction={faction}
        removedOperativeId={null}
        selectedEquipmentIds={[]}
        onRosterChange={vi.fn()}
      />
    );

    expect(screen.getByText(/Leader — cannot be removed/i)).toBeInTheDocument();
  });

  it('shows "Remove from Game" buttons for non-leader operatives', () => {
    render(
      <OperativeRosterManager
        faction={faction}
        removedOperativeId={null}
        selectedEquipmentIds={[]}
        onRosterChange={vi.fn()}
      />
    );

    // 6 non-leader operatives should have remove buttons
    const removeButtons = screen.getAllByRole('button', {
      name: /Remove .+ from this game/i,
    });
    expect(removeButtons).toHaveLength(6);
  });

  it('calls onRosterChange with operative ID when Remove is clicked', () => {
    const onRosterChange = vi.fn();
    render(
      <OperativeRosterManager
        faction={faction}
        removedOperativeId={null}
        selectedEquipmentIds={[]}
        onRosterChange={onRosterChange}
      />
    );

    fireEvent.click(
      screen.getByLabelText('Remove Plague Marine Warrior from this game')
    );
    expect(onRosterChange).toHaveBeenCalledWith('pm-plague-marine-warrior');
  });

  it('shows Restore button and REMOVED label when an operative is removed', () => {
    render(
      <OperativeRosterManager
        faction={faction}
        removedOperativeId={'pm-plague-marine-warrior'}
        selectedEquipmentIds={[]}
        onRosterChange={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Restore Plague Marine Warrior to the roster')).toBeInTheDocument();
    expect(screen.getByText('REMOVED')).toBeInTheDocument();
  });

  it('calls onRosterChange with null when Restore is clicked', () => {
    const onRosterChange = vi.fn();
    render(
      <OperativeRosterManager
        faction={faction}
        removedOperativeId={'pm-plague-marine-warrior'}
        selectedEquipmentIds={[]}
        onRosterChange={onRosterChange}
      />
    );

    fireEvent.click(
      screen.getByLabelText('Restore Plague Marine Warrior to the roster')
    );
    expect(onRosterChange).toHaveBeenCalledWith(null);
  });

  it('disables Remove buttons for other non-leaders when one is already removed', () => {
    render(
      <OperativeRosterManager
        faction={faction}
        removedOperativeId={'pm-plague-marine-warrior'}
        selectedEquipmentIds={[]}
        onRosterChange={vi.fn()}
      />
    );

    // Other non-leaders should have their remove buttons disabled
    const disabledRemoveButtons = screen
      .getAllByRole('button', { name: /Remove .+ from this game/i })
      .filter((btn) => (btn as HTMLButtonElement).disabled);
    expect(disabledRemoveButtons.length).toBeGreaterThan(0);
  });

  it('shows active count as 7 when nothing is removed', () => {
    render(
      <OperativeRosterManager
        faction={faction}
        removedOperativeId={null}
        selectedEquipmentIds={[]}
        onRosterChange={vi.fn()}
      />
    );

    expect(screen.getByText(/Active operatives:/)).toHaveTextContent('7');
  });

  it('shows active count as 6 when one operative is removed', () => {
    render(
      <OperativeRosterManager
        faction={faction}
        removedOperativeId={'pm-plague-marine-warrior'}
        selectedEquipmentIds={[]}
        onRosterChange={vi.fn()}
      />
    );

    expect(screen.getByText(/Active operatives:/)).toHaveTextContent('6');
  });

  it('shows Bombardier grenade weapon note when Blight Grenades are selected', () => {
    render(
      <OperativeRosterManager
        faction={faction}
        removedOperativeId={null}
        selectedEquipmentIds={[QUICK_PLAY_DEFAULTS.BLIGHT_GRENADES_ID]}
        onRosterChange={vi.fn()}
      />
    );

    // The grenadier weapon name should appear on the Bombardier's card
    expect(
      screen.getByText('Blight Grenades (Grenadier)')
    ).toBeInTheDocument();
  });

  // ------------------------------------------------------------------
  // Incapacitated toggle
  // ------------------------------------------------------------------

  it('shows an Active incapacitated-toggle button for each non-removed operative', () => {
    render(
      <OperativeRosterManager
        faction={faction}
        removedOperativeId={null}
        selectedEquipmentIds={[]}
        onRosterChange={vi.fn()}
        incapacitatedOperativeIds={[]}
        onIncapacitatedChange={vi.fn()}
      />
    );

    // 7 operatives, none removed → 7 incapacitated toggles
    const toggles = screen.getAllByRole('button', {
      name: /Toggle incapacitated: /i,
    });
    expect(toggles).toHaveLength(7);
    toggles.forEach((btn) => expect(btn).toHaveTextContent('✅ Active'));
  });

  it('shows Incapacitated badge on toggle for an incapacitated operative', () => {
    render(
      <OperativeRosterManager
        faction={faction}
        removedOperativeId={null}
        selectedEquipmentIds={[]}
        onRosterChange={vi.fn()}
        incapacitatedOperativeIds={['pm-plague-marine-warrior']}
        onIncapacitatedChange={vi.fn()}
      />
    );

    expect(
      screen.getByLabelText('Toggle incapacitated: Plague Marine Warrior')
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByLabelText('Toggle incapacitated: Plague Marine Warrior')
    ).toHaveTextContent('💀 Incapacitated');
  });

  it('calls onIncapacitatedChange with the operative added when toggled from Active to Incapacitated', () => {
    const onIncapacitatedChange = vi.fn();
    render(
      <OperativeRosterManager
        faction={faction}
        removedOperativeId={null}
        selectedEquipmentIds={[]}
        onRosterChange={vi.fn()}
        incapacitatedOperativeIds={[]}
        onIncapacitatedChange={onIncapacitatedChange}
      />
    );

    fireEvent.click(
      screen.getByLabelText('Toggle incapacitated: Plague Marine Warrior')
    );
    expect(onIncapacitatedChange).toHaveBeenCalledWith(
      expect.arrayContaining(['pm-plague-marine-warrior'])
    );
  });

  it('calls onIncapacitatedChange with the operative removed when toggled from Incapacitated to Active', () => {
    const onIncapacitatedChange = vi.fn();
    render(
      <OperativeRosterManager
        faction={faction}
        removedOperativeId={null}
        selectedEquipmentIds={[]}
        onRosterChange={vi.fn()}
        incapacitatedOperativeIds={['pm-plague-marine-warrior']}
        onIncapacitatedChange={onIncapacitatedChange}
      />
    );

    fireEvent.click(
      screen.getByLabelText('Toggle incapacitated: Plague Marine Warrior')
    );
    expect(onIncapacitatedChange).toHaveBeenCalledWith([]);
  });

  it('does not show the incapacitated toggle for a removed operative', () => {
    render(
      <OperativeRosterManager
        faction={faction}
        removedOperativeId={'pm-plague-marine-warrior'}
        selectedEquipmentIds={[]}
        onRosterChange={vi.fn()}
        incapacitatedOperativeIds={[]}
        onIncapacitatedChange={vi.fn()}
      />
    );

    // 6 active operatives → 6 incapacitated toggles (removed one has no toggle)
    const toggles = screen.getAllByRole('button', {
      name: /Toggle incapacitated: /i,
    });
    expect(toggles).toHaveLength(6);
    expect(
      screen.queryByLabelText('Toggle incapacitated: Plague Marine Warrior')
    ).not.toBeInTheDocument();
  });
});
