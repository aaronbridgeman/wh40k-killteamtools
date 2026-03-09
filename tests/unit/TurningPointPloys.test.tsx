/**
 * Unit tests for TurningPointPloys component
 *
 * Uses the real Plague Marines faction data so ploy IDs and types match production.
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TurningPointPloys } from '@/components/event/TurningPointPloys';
import { loadFaction } from '@/services/dataLoader';
import { getInitialGameState } from '@/services/eventStorage';
import { Faction } from '@/types';
import { GameEventState } from '@/types/event';
import { QUICK_PLAY_DEFAULTS } from '@/constants';

/** Default props for TurningPointPloys — no operatives removed or incapacitated */
const defaultRosterProps = {
  removedOperativeId: null as string | null,
  incapacitatedOperativeIds: [] as string[],
};

describe('TurningPointPloys', () => {
  let faction: Faction;

  beforeAll(async () => {
    faction = await loadFaction('plague-marines');
  });

  it('renders the Start Game button when the game has not started (turningPoint 0)', () => {
    const game = getInitialGameState(1); // turningPoint: 0
    render(
      <TurningPointPloys game={game} faction={faction} onChange={vi.fn()} {...defaultRosterProps} />
    );

    expect(screen.getByRole('button', { name: /Start Game/i })).toBeInTheDocument();
  });

  it('calls onChange with turningPoint=1 when Start Game is clicked', () => {
    const onChange = vi.fn();
    const game = getInitialGameState(1);
    render(
      <TurningPointPloys game={game} faction={faction} onChange={onChange} {...defaultRosterProps} />
    );

    fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ turningPoint: 1 })
    );
  });

  it('shows current turning point once game is started', () => {
    const game: GameEventState = { ...getInitialGameState(1), turningPoint: 2 };
    render(
      <TurningPointPloys game={game} faction={faction} onChange={vi.fn()} {...defaultRosterProps} />
    );

    expect(screen.getByText('TP 2')).toBeInTheDocument();
  });

  it('shows all 4 strategic ploys', () => {
    const game: GameEventState = { ...getInitialGameState(1), turningPoint: 1 };
    render(
      <TurningPointPloys game={game} faction={faction} onChange={vi.fn()} {...defaultRosterProps} />
    );

    expect(screen.getByText('Contagion')).toBeInTheDocument();
    expect(screen.getByText('Lumbering Death')).toBeInTheDocument();
    expect(screen.getByText('Cloud of Flies')).toBeInTheDocument();
    expect(screen.getByText('Nurglings')).toBeInTheDocument();
  });

  it('shows all faction firefight ploys plus Command Reroll', () => {
    const game: GameEventState = { ...getInitialGameState(1), turningPoint: 1 };
    render(
      <TurningPointPloys game={game} faction={faction} onChange={vi.fn()} {...defaultRosterProps} />
    );

    expect(screen.getByText('Virulent Poison')).toBeInTheDocument();
    expect(screen.getByText('Poisonous Demise')).toBeInTheDocument();
    expect(screen.getByText('Sickening Resilience')).toBeInTheDocument();
    expect(screen.getByText('Curse of Rot')).toBeInTheDocument();
    // Generic ploy always present
    expect(screen.getByText('Command Reroll')).toBeInTheDocument();
  });

  it('selects a strategic ploy and shows active banner', () => {
    const onChange = vi.fn();
    // Give enough CP to afford the ploy (Contagion costs 1 CP with Icon Bearer inactive)
    const game: GameEventState = { ...getInitialGameState(1), turningPoint: 1, commandPoints: 5 };
    render(
      <TurningPointPloys
        game={game}
        faction={faction}
        onChange={onChange}
        removedOperativeId={QUICK_PLAY_DEFAULTS.ICON_BEARER_ID}
        incapacitatedOperativeIds={[]}
      />
    );

    fireEvent.click(screen.getByLabelText(/Select strategic ploy: Contagion/i));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        commandPoints: 4, // 5 - 1 CP for Contagion
        turningPoints: expect.objectContaining({
          1: expect.objectContaining({ selectedStrategicPloyId: 'contagion' }),
        }),
      })
    );
  });

  it('shows active strategic ploy banner when ploy is selected', () => {
    const game: GameEventState = {
      ...getInitialGameState(1),
      turningPoint: 1,
      turningPoints: {
        1: { selectedStrategicPloyId: 'contagion', firefightPloyCounts: {} },
      },
    };
    render(
      <TurningPointPloys game={game} faction={faction} onChange={vi.fn()} {...defaultRosterProps} />
    );

    expect(screen.getByText('⚔️ Active Strategic Ploy')).toBeInTheDocument();
  });

  it('uses a firefight ploy and deducts CP', () => {
    const onChange = vi.fn();
    const game: GameEventState = { ...getInitialGameState(1), turningPoint: 1, commandPoints: 5 };
    render(
      <TurningPointPloys game={game} faction={faction} onChange={onChange} {...defaultRosterProps} />
    );

    // Click "Use" button for Virulent Poison
    fireEvent.click(
      screen.getByLabelText(/Virulent Poison — Use ploy/i)
    );
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        commandPoints: 4, // 5 - 1 CP for the ploy
        turningPoints: expect.objectContaining({
          1: expect.objectContaining({
            firefightPloyCounts: expect.objectContaining({ 'virulent-poison': 1 }),
          }),
        }),
      })
    );
  });

  it('allows using a firefight ploy multiple times', () => {
    const onChange = vi.fn();
    const game: GameEventState = {
      ...getInitialGameState(1),
      turningPoint: 1,
      commandPoints: 5,
      turningPoints: {
        1: { selectedStrategicPloyId: null, firefightPloyCounts: { 'virulent-poison': 1 } },
      },
    };
    render(
      <TurningPointPloys game={game} faction={faction} onChange={onChange} {...defaultRosterProps} />
    );

    // Use Virulent Poison a second time
    fireEvent.click(
      screen.getByLabelText(/Virulent Poison — Use ploy/i)
    );
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        commandPoints: 4,
        turningPoints: expect.objectContaining({
          1: expect.objectContaining({
            firefightPloyCounts: expect.objectContaining({ 'virulent-poison': 2 }),
          }),
        }),
      })
    );
  });

  it('shows use count and Undo button when a firefight ploy has been used', () => {
    const game: GameEventState = {
      ...getInitialGameState(1),
      turningPoint: 1,
      turningPoints: {
        1: {
          selectedStrategicPloyId: null,
          firefightPloyCounts: { 'virulent-poison': 1 },
        },
      },
    };
    render(
      <TurningPointPloys game={game} faction={faction} onChange={vi.fn()} {...defaultRosterProps} />
    );

    expect(screen.getByText('✓ ×1')).toBeInTheDocument();
    expect(screen.getByLabelText(/Undo last use of Virulent Poison/i)).toBeInTheDocument();
  });

  it('undoes a firefight ploy use and refunds CP', () => {
    const onChange = vi.fn();
    const game: GameEventState = {
      ...getInitialGameState(1),
      turningPoint: 1,
      commandPoints: 3,
      turningPoints: {
        1: {
          selectedStrategicPloyId: null,
          firefightPloyCounts: { 'virulent-poison': 1 },
        },
      },
    };
    render(
      <TurningPointPloys game={game} faction={faction} onChange={onChange} {...defaultRosterProps} />
    );

    fireEvent.click(screen.getByLabelText(/Undo last use of Virulent Poison/i));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        commandPoints: 4, // 3 + 1 CP refunded
        turningPoints: expect.objectContaining({
          1: expect.objectContaining({
            firefightPloyCounts: expect.objectContaining({ 'virulent-poison': 0 }),
          }),
        }),
      })
    );
  });

  it('advances to next turning point when next button is clicked', () => {
    const onChange = vi.fn();
    const game: GameEventState = { ...getInitialGameState(1), turningPoint: 1 };
    render(
      <TurningPointPloys game={game} faction={faction} onChange={onChange} {...defaultRosterProps} />
    );

    fireEvent.click(screen.getByLabelText('Advance to next turning point'));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ turningPoint: 2 })
    );
  });

  it('disables advance button at turning point 4 (max)', () => {
    const game: GameEventState = { ...getInitialGameState(1), turningPoint: 4 };
    render(
      <TurningPointPloys game={game} faction={faction} onChange={vi.fn()} {...defaultRosterProps} />
    );

    expect(
      screen.getByLabelText('Advance to next turning point')
    ).toBeDisabled();
  });

  it('disables Use button for firefight ploys when cannot afford them', () => {
    // commandPoints = 0, all ploys cost 1
    const game: GameEventState = { ...getInitialGameState(1), turningPoint: 1 };
    render(
      <TurningPointPloys game={game} faction={faction} onChange={vi.fn()} {...defaultRosterProps} />
    );

    // All Use buttons should be disabled when CP = 0
    const useButtons = screen.getAllByRole('button', {
      name: /— Cannot afford/i,
    });
    useButtons.forEach((btn) => expect(btn).toBeDisabled());
  });

  it('refunds CP when deselecting a strategic ploy', () => {
    const onChange = vi.fn();
    // Icon Bearer removed so Contagion costs 1 CP
    const game: GameEventState = {
      ...getInitialGameState(1),
      turningPoint: 1,
      commandPoints: 4, // Already spent 1 CP selecting Contagion
      turningPoints: {
        1: { selectedStrategicPloyId: 'contagion', firefightPloyCounts: {} },
      },
    };
    render(
      <TurningPointPloys
        game={game}
        faction={faction}
        onChange={onChange}
        removedOperativeId={QUICK_PLAY_DEFAULTS.ICON_BEARER_ID}
        incapacitatedOperativeIds={[]}
      />
    );

    fireEvent.click(screen.getByLabelText(/Deselect strategic ploy: Contagion/i));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        commandPoints: 5, // 4 + 1 CP refunded
        turningPoints: expect.objectContaining({
          1: expect.objectContaining({ selectedStrategicPloyId: null }),
        }),
      })
    );
  });

  it('disables strategic ploy button when cannot afford with no current selection', () => {
    // Icon Bearer removed so all ploys cost 1 CP
    const game: GameEventState = {
      ...getInitialGameState(1),
      turningPoint: 1,
      commandPoints: 0, // Cannot afford any ploy
    };
    render(
      <TurningPointPloys
        game={game}
        faction={faction}
        onChange={vi.fn()}
        removedOperativeId={QUICK_PLAY_DEFAULTS.ICON_BEARER_ID}
        incapacitatedOperativeIds={[]}
      />
    );

    // All strategic ploy buttons should be disabled (0 CP, nothing selected, all cost 1 CP)
    const ployButtons = screen.getAllByRole('button', {
      name: /Select strategic ploy:/i,
    });
    ployButtons.forEach((btn) => expect(btn).toBeDisabled());
  });

  it('allows switching strategic ploys when one is already selected (net 0 cost)', () => {
    const onChange = vi.fn();
    // Use Lumbering Death (not Contagion) as the pre-selected ploy to avoid Icon Bearer cost override
    const game: GameEventState = {
      ...getInitialGameState(1),
      turningPoint: 1,
      commandPoints: 2, // Has CP, Lumbering Death already selected
      turningPoints: {
        1: { selectedStrategicPloyId: 'lumbering-death', firefightPloyCounts: {} },
      },
    };
    render(
      <TurningPointPloys game={game} faction={faction} onChange={onChange} {...defaultRosterProps} />
    );

    // Cloud of Flies button should be enabled (switching from Lumbering Death, net 0 cost)
    const cloudsButton = screen.getByLabelText(
      /Select strategic ploy: Cloud of Flies/i
    );
    expect(cloudsButton).not.toBeDisabled();
    fireEvent.click(cloudsButton);
    // CP stays the same: refund Lumbering Death (1) then deduct Cloud of Flies (1) = net 0
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        commandPoints: 2,
        turningPoints: expect.objectContaining({
          1: expect.objectContaining({ selectedStrategicPloyId: 'cloud-of-flies' }),
        }),
      })
    );
  });

  // ------------------------------------------------------------------
  // Contagion dynamic cost
  // ------------------------------------------------------------------

  it('shows Contagion as 0CP when Icon Bearer is active', () => {
    const game: GameEventState = { ...getInitialGameState(1), turningPoint: 1, commandPoints: 0 };
    render(
      <TurningPointPloys
        game={game}
        faction={faction}
        onChange={vi.fn()}
        removedOperativeId={null}
        incapacitatedOperativeIds={[]}
      />
    );

    // Icon Bearer active → Contagion 0CP, button should NOT be disabled
    const contagionButton = screen.getByLabelText(/Select strategic ploy: Contagion/i);
    expect(contagionButton).not.toBeDisabled();
    // Status indicator should show "active"
    expect(screen.getByText(/Icon Bearer active/i)).toBeInTheDocument();
  });

  it('shows Contagion as 1CP when Icon Bearer is removed', () => {
    const game: GameEventState = { ...getInitialGameState(1), turningPoint: 1, commandPoints: 0 };
    render(
      <TurningPointPloys
        game={game}
        faction={faction}
        onChange={vi.fn()}
        removedOperativeId={QUICK_PLAY_DEFAULTS.ICON_BEARER_ID}
        incapacitatedOperativeIds={[]}
      />
    );

    // Icon Bearer removed → Contagion costs 1CP, button disabled (0 CP)
    const contagionButton = screen.getByLabelText(/Select strategic ploy: Contagion/i);
    expect(contagionButton).toBeDisabled();
    expect(screen.getByText(/Icon Bearer inactive/i)).toBeInTheDocument();
  });

  it('shows Contagion as 1CP when Icon Bearer is incapacitated', () => {
    const game: GameEventState = { ...getInitialGameState(1), turningPoint: 1, commandPoints: 0 };
    render(
      <TurningPointPloys
        game={game}
        faction={faction}
        onChange={vi.fn()}
        removedOperativeId={null}
        incapacitatedOperativeIds={[QUICK_PLAY_DEFAULTS.ICON_BEARER_ID]}
      />
    );

    const contagionButton = screen.getByLabelText(/Select strategic ploy: Contagion/i);
    expect(contagionButton).toBeDisabled();
    expect(screen.getByText(/Icon Bearer inactive/i)).toBeInTheDocument();
  });

  it('selects Contagion for 0 CP when Icon Bearer is active', () => {
    const onChange = vi.fn();
    const game: GameEventState = { ...getInitialGameState(1), turningPoint: 1, commandPoints: 2 };
    render(
      <TurningPointPloys
        game={game}
        faction={faction}
        onChange={onChange}
        removedOperativeId={null}
        incapacitatedOperativeIds={[]}
      />
    );

    fireEvent.click(screen.getByLabelText(/Select strategic ploy: Contagion/i));
    // No CP should be deducted (Contagion is free)
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        commandPoints: 2,
      })
    );
  });
});

