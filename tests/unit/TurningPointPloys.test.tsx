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

describe('TurningPointPloys', () => {
  let faction: Faction;

  beforeAll(async () => {
    faction = await loadFaction('plague-marines');
  });

  it('renders the Start Game button when the game has not started (turningPoint 0)', () => {
    const game = getInitialGameState(1); // turningPoint: 0
    render(
      <TurningPointPloys game={game} faction={faction} onChange={vi.fn()} />
    );

    expect(screen.getByRole('button', { name: /Start Game/i })).toBeInTheDocument();
  });

  it('calls onChange with turningPoint=1 when Start Game is clicked', () => {
    const onChange = vi.fn();
    const game = getInitialGameState(1);
    render(
      <TurningPointPloys game={game} faction={faction} onChange={onChange} />
    );

    fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ turningPoint: 1 })
    );
  });

  it('shows current turning point once game is started', () => {
    const game: GameEventState = { ...getInitialGameState(1), turningPoint: 2 };
    render(
      <TurningPointPloys game={game} faction={faction} onChange={vi.fn()} />
    );

    expect(screen.getByText('TP 2')).toBeInTheDocument();
  });

  it('shows all 4 strategic ploys', () => {
    const game: GameEventState = { ...getInitialGameState(1), turningPoint: 1 };
    render(
      <TurningPointPloys game={game} faction={faction} onChange={vi.fn()} />
    );

    expect(screen.getByText('Contagion')).toBeInTheDocument();
    expect(screen.getByText('Lumbering Death')).toBeInTheDocument();
    expect(screen.getByText('Cloud of Flies')).toBeInTheDocument();
    expect(screen.getByText('Nurglings')).toBeInTheDocument();
  });

  it('shows all 4 firefight ploys', () => {
    const game: GameEventState = { ...getInitialGameState(1), turningPoint: 1 };
    render(
      <TurningPointPloys game={game} faction={faction} onChange={vi.fn()} />
    );

    expect(screen.getByText('Virulent Poison')).toBeInTheDocument();
    expect(screen.getByText('Poisonous Demise')).toBeInTheDocument();
    expect(screen.getByText('Sickening Resilience')).toBeInTheDocument();
    expect(screen.getByText('Curse of Rot')).toBeInTheDocument();
  });

  it('selects a strategic ploy and shows active banner', () => {
    const onChange = vi.fn();
    // Give enough CP to afford the ploy (Contagion costs 1 CP)
    const game: GameEventState = { ...getInitialGameState(1), turningPoint: 1, commandPoints: 5 };
    render(
      <TurningPointPloys game={game} faction={faction} onChange={onChange} />
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
        1: { selectedStrategicPloyId: 'contagion', usedFirefightPloyIds: [] },
      },
    };
    render(
      <TurningPointPloys game={game} faction={faction} onChange={vi.fn()} />
    );

    expect(screen.getByText('⚔️ Active Strategic Ploy')).toBeInTheDocument();
  });

  it('marks a firefight ploy as used when clicked', () => {
    const onChange = vi.fn();
    // Give enough CP to afford the ploy (Virulent Poison costs 1 CP)
    const game: GameEventState = { ...getInitialGameState(1), turningPoint: 1, commandPoints: 5 };
    render(
      <TurningPointPloys game={game} faction={faction} onChange={onChange} />
    );

    // Use partial role+name match that is robust to label format changes
    fireEvent.click(
      screen.getByRole('button', { name: /Virulent Poison/i })
    );
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        commandPoints: 4, // 5 - 1 CP for the ploy
        turningPoints: expect.objectContaining({
          1: expect.objectContaining({
            usedFirefightPloyIds: expect.arrayContaining(['virulent-poison']),
          }),
        }),
      })
    );
  });

  it('shows "Used" badge on a used firefight ploy', () => {
    const game: GameEventState = {
      ...getInitialGameState(1),
      turningPoint: 1,
      turningPoints: {
        1: {
          selectedStrategicPloyId: null,
          usedFirefightPloyIds: ['virulent-poison'],
        },
      },
    };
    render(
      <TurningPointPloys game={game} faction={faction} onChange={vi.fn()} />
    );

    expect(screen.getByText('✓ Used')).toBeInTheDocument();
  });

  it('advances to next turning point when next button is clicked', () => {
    const onChange = vi.fn();
    const game: GameEventState = { ...getInitialGameState(1), turningPoint: 1 };
    render(
      <TurningPointPloys game={game} faction={faction} onChange={onChange} />
    );

    fireEvent.click(screen.getByLabelText('Advance to next turning point'));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ turningPoint: 2 })
    );
  });

  it('disables advance button at turning point 4 (max)', () => {
    const game: GameEventState = { ...getInitialGameState(1), turningPoint: 4 };
    render(
      <TurningPointPloys game={game} faction={faction} onChange={vi.fn()} />
    );

    expect(
      screen.getByLabelText('Advance to next turning point')
    ).toBeDisabled();
  });

  it('disables firefight ploy button when cannot afford and not yet used', () => {
    // commandPoints starts at 0 (STARTING_COMMAND_POINTS), all ploys cost 1
    const game: GameEventState = { ...getInitialGameState(1), turningPoint: 1 };
    render(
      <TurningPointPloys game={game} faction={faction} onChange={vi.fn()} />
    );

    // All firefight ploy buttons should be disabled when CP = 0
    const ployButtons = screen.getAllByRole('button', {
      name: /— Cannot afford/i,
    });
    ployButtons.forEach((btn) => expect(btn).toBeDisabled());
  });

  it('refunds CP when deselecting a strategic ploy', () => {
    const onChange = vi.fn();
    const game: GameEventState = {
      ...getInitialGameState(1),
      turningPoint: 1,
      commandPoints: 4, // Already spent 1 CP selecting Contagion
      turningPoints: {
        1: { selectedStrategicPloyId: 'contagion', usedFirefightPloyIds: [] },
      },
    };
    render(
      <TurningPointPloys game={game} faction={faction} onChange={onChange} />
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

  it('refunds CP when un-using a firefight ploy', () => {
    const onChange = vi.fn();
    const game: GameEventState = {
      ...getInitialGameState(1),
      turningPoint: 1,
      commandPoints: 3, // After spending 1 CP on the ploy
      turningPoints: {
        1: {
          selectedStrategicPloyId: null,
          usedFirefightPloyIds: ['virulent-poison'],
        },
      },
    };
    render(
      <TurningPointPloys game={game} faction={faction} onChange={onChange} />
    );

    // The Used badge button can be clicked to un-use
    fireEvent.click(screen.getByRole('button', { name: /Virulent Poison/i }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        commandPoints: 4, // 3 + 1 CP refunded
        turningPoints: expect.objectContaining({
          1: expect.objectContaining({ usedFirefightPloyIds: [] }),
        }),
      })
    );
  });

  it('disables strategic ploy button when cannot afford with no current selection', () => {
    const game: GameEventState = {
      ...getInitialGameState(1),
      turningPoint: 1,
      commandPoints: 0, // Cannot afford any ploy
    };
    render(
      <TurningPointPloys game={game} faction={faction} onChange={vi.fn()} />
    );

    // All strategic ploy buttons should be disabled (0 CP, nothing selected)
    const ployButtons = screen.getAllByRole('button', {
      name: /Select strategic ploy:/i,
    });
    ployButtons.forEach((btn) => expect(btn).toBeDisabled());
  });

  it('allows switching strategic ploys when one is already selected (net 0 cost)', () => {
    const onChange = vi.fn();
    const game: GameEventState = {
      ...getInitialGameState(1),
      turningPoint: 1,
      commandPoints: 2, // Has CP, Contagion already selected
      turningPoints: {
        1: { selectedStrategicPloyId: 'contagion', usedFirefightPloyIds: [] },
      },
    };
    render(
      <TurningPointPloys game={game} faction={faction} onChange={onChange} />
    );

    // Cloud of Flies button should be enabled (switching from Contagion, net 0 cost)
    const cloudsButton = screen.getByLabelText(
      /Select strategic ploy: Cloud of Flies/i
    );
    expect(cloudsButton).not.toBeDisabled();
    fireEvent.click(cloudsButton);
    // CP stays the same: refund Contagion (1) then deduct Cloud of Flies (1) = net 0
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        commandPoints: 2,
        turningPoints: expect.objectContaining({
          1: expect.objectContaining({ selectedStrategicPloyId: 'cloud-of-flies' }),
        }),
      })
    );
  });
});
