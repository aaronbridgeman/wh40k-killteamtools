/**
 * Unit tests for CPTracker component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CPTracker } from '@/components/event/CPTracker';
import { GAME_DEFAULTS } from '@/constants';

describe('CPTracker', () => {
  it('displays the current command points', () => {
    render(<CPTracker commandPoints={3} onChange={vi.fn()} />);
    expect(screen.getByLabelText('3 command points')).toBeInTheDocument();
  });

  it('calls onChange with incremented value when + is clicked', () => {
    const onChange = vi.fn();
    render(<CPTracker commandPoints={3} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Increase command points'));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('calls onChange with decremented value when − is clicked', () => {
    const onChange = vi.fn();
    render(<CPTracker commandPoints={3} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Decrease command points'));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('disables the decrement button at minimum (0)', () => {
    render(<CPTracker commandPoints={GAME_DEFAULTS.MIN_COMMAND_POINTS} onChange={vi.fn()} />);
    expect(screen.getByLabelText('Decrease command points')).toBeDisabled();
  });

  it('disables the increment button at maximum (20)', () => {
    render(<CPTracker commandPoints={GAME_DEFAULTS.MAX_COMMAND_POINTS} onChange={vi.fn()} />);
    expect(screen.getByLabelText('Increase command points')).toBeDisabled();
  });

  it('does not call onChange when decrement is clicked at minimum', () => {
    const onChange = vi.fn();
    render(<CPTracker commandPoints={0} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Decrease command points'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not call onChange when increment is clicked at maximum', () => {
    const onChange = vi.fn();
    render(<CPTracker commandPoints={20} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Increase command points'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
