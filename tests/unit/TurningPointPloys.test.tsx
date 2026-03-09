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
    const game: GameEventState = { ...getInitialGameState(1), turningPoint: 1 };
    render(
      <TurningPointPloys game={game} faction={faction} onChange={onChange} />
    );

    fireEvent.click(screen.getByLabelText(/Select strategic ploy: Contagion/i));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
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
    const game: GameEventState = { ...getInitialGameState(1), turningPoint: 1 };
    render(
      <TurningPointPloys game={game} faction={faction} onChange={onChange} />
    );

    // Use partial role+name match that is robust to label format changes
    fireEvent.click(
      screen.getByRole('button', { name: /Virulent Poison/i })
    );
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
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

  it('disables retreat button at turning point 1 (min)', () => {
    const game: GameEventState = { ...getInitialGameState(1), turningPoint: 1 };
    render(
      <TurningPointPloys game={game} faction={faction} onChange={vi.fn()} />
    );

    expect(
      screen.getByLabelText('Go back to previous turning point')
    ).toBeDisabled();
  });
});
