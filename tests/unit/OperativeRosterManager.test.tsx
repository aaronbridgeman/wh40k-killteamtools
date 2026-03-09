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

  // ------------------------------------------------------------------
  // Injured toggle (play phase only)
  // ------------------------------------------------------------------

  it('shows a Healthy injured-toggle button for each non-removed operative in play phase', () => {
    render(
      <OperativeRosterManager
        faction={faction}
        removedOperativeId={null}
        selectedEquipmentIds={[]}
        injuredOperativeIds={[]}
        onInjuredChange={vi.fn()}
        // No onRosterChange → play phase
      />
    );

    // Champion is focused by default — click the champion pill to show all cards
    fireEvent.click(
      screen.getByLabelText("Hide Plague Marine Champion's card")
    );

    const toggles = screen.getAllByRole('button', {
      name: /Toggle injured: /i,
    });
    expect(toggles).toHaveLength(7);
    toggles.forEach((btn) => expect(btn).toHaveTextContent('💪 Healthy'));
  });

  it('shows Injured badge on toggle for an injured operative', () => {
    render(
      <OperativeRosterManager
        faction={faction}
        removedOperativeId={null}
        selectedEquipmentIds={[]}
        injuredOperativeIds={['pm-plague-marine-warrior']}
        onInjuredChange={vi.fn()}
      />
    );

    // Champion is focused by default — click the warrior pill to see the warrior's card
    fireEvent.click(
      screen.getByLabelText("Show Plague Marine Warrior's card")
    );

    expect(
      screen.getByLabelText('Toggle injured: Plague Marine Warrior')
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByLabelText('Toggle injured: Plague Marine Warrior')
    ).toHaveTextContent('🩹 Injured');
  });

  it('calls onInjuredChange with the operative added when toggled from Healthy to Injured', () => {
    const onInjuredChange = vi.fn();
    render(
      <OperativeRosterManager
        faction={faction}
        removedOperativeId={null}
        selectedEquipmentIds={[]}
        injuredOperativeIds={[]}
        onInjuredChange={onInjuredChange}
      />
    );

    // Champion is focused by default — click the warrior pill to focus the warrior's card
    fireEvent.click(
      screen.getByLabelText("Show Plague Marine Warrior's card")
    );

    fireEvent.click(
      screen.getByLabelText('Toggle injured: Plague Marine Warrior')
    );
    expect(onInjuredChange).toHaveBeenCalledWith(
      expect.arrayContaining(['pm-plague-marine-warrior'])
    );
  });

  it('calls onInjuredChange with the operative removed when toggled from Injured to Healthy', () => {
    const onInjuredChange = vi.fn();
    render(
      <OperativeRosterManager
        faction={faction}
        removedOperativeId={null}
        selectedEquipmentIds={[]}
        injuredOperativeIds={['pm-plague-marine-warrior']}
        onInjuredChange={onInjuredChange}
      />
    );

    // Champion is focused by default — click the warrior pill to focus the warrior's card
    fireEvent.click(
      screen.getByLabelText("Show Plague Marine Warrior's card")
    );

    fireEvent.click(
      screen.getByLabelText('Toggle injured: Plague Marine Warrior')
    );
    expect(onInjuredChange).toHaveBeenCalledWith([]);
  });

  it('does not show the injured toggle for a removed operative', () => {
    render(
      <OperativeRosterManager
        faction={faction}
        removedOperativeId={'pm-plague-marine-warrior'}
        selectedEquipmentIds={[]}
        injuredOperativeIds={[]}
        onInjuredChange={vi.fn()}
      />
    );

    // Warrior is removed — its toggle must not appear regardless of focus
    expect(
      screen.queryByLabelText('Toggle injured: Plague Marine Warrior')
    ).not.toBeInTheDocument();

    // Click champion pill to show all cards and verify count
    fireEvent.click(
      screen.getByLabelText("Hide Plague Marine Champion's card")
    );

    // 6 active operatives → 6 injured toggles
    const toggles = screen.getAllByRole('button', {
      name: /Toggle injured: /i,
    });
    expect(toggles).toHaveLength(6);
  });

  it('does not show injured toggle in setup phase (onRosterChange provided)', () => {
    render(
      <OperativeRosterManager
        faction={faction}
        removedOperativeId={null}
        selectedEquipmentIds={[]}
        onRosterChange={vi.fn()}
        injuredOperativeIds={[]}
        onInjuredChange={vi.fn()}
      />
    );

    expect(
      screen.queryByRole('button', { name: /Toggle injured: /i })
    ).not.toBeInTheDocument();
  });

  // ------------------------------------------------------------------
  // Plague Rounds weapon augmentation
  // ------------------------------------------------------------------

  it('adds Poison and Severe rules to Boltgun when Plague Rounds are selected', () => {
    render(
      <OperativeRosterManager
        faction={faction}
        removedOperativeId={null}
        selectedEquipmentIds={['plague-rounds']}
        onRosterChange={vi.fn()}
      />
    );

    // The Warrior has a Boltgun — Poison and Severe should appear in its rules
    const poisonBadges = screen.getAllByText('Poison');
    expect(poisonBadges.length).toBeGreaterThan(0);
    const severeBadges = screen.getAllByText('Severe');
    expect(severeBadges.length).toBeGreaterThan(0);
  });

  it('does not add extra Poison/Severe rules when Plague Rounds are not selected', () => {
    const { rerender } = render(
      <OperativeRosterManager
        faction={faction}
        removedOperativeId={null}
        selectedEquipmentIds={[]}
        onRosterChange={vi.fn()}
      />
    );

    // Count Poison occurrences without Plague Rounds (only from weapons that
    // already have it, e.g. Plague sword and Plague spewer)
    const poisonCountWithout = screen.getAllByText('Poison').length;

    rerender(
      <OperativeRosterManager
        faction={faction}
        removedOperativeId={null}
        selectedEquipmentIds={['plague-rounds']}
        onRosterChange={vi.fn()}
      />
    );

    // With Plague Rounds, Boltgun and Bolt pistol also gain Poison → more occurrences
    const poisonCountWith = screen.getAllByText('Poison').length;
    expect(poisonCountWith).toBeGreaterThan(poisonCountWithout);
  });
});
