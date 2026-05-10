import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SoloJointOpsView } from '@/components/solo/SoloJointOpsView';

describe('SoloJointOpsView', () => {
  it('renders Game Runner as the default tab', () => {
    render(<SoloJointOpsView />);

    expect(
      screen.getByRole('heading', { name: 'Game Runner' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'List Builder' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Profile Manager' })
    ).toBeInTheDocument();
  });

  it('tracks activation order through start and next activation actions', () => {
    render(<SoloJointOpsView />);

    fireEvent.change(screen.getByLabelText('Initiative'), {
      target: { value: 'npo' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Start Activations' }));

    expect(
      screen.getByText('Turning Point 1 · Activation 1 · Active: NPO Team')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next Activation' }));

    expect(
      screen.getByText(
        'Turning Point 1 · Activation 2 · Active: Player Kill Team'
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next Turning Point' }));

    expect(
      screen.getByText('Turning Point 2 · Activation 0 · Active: NPO Team')
    ).toBeInTheDocument();
  });

  it('creates and updates an NPO runner card from the list builder', () => {
    render(<SoloJointOpsView />);

    fireEvent.click(screen.getByRole('button', { name: 'List Builder' }));

    fireEvent.change(screen.getByLabelText('Add NPO Operative'), {
      target: { value: 'Drone' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add NPO Operative' }));

    fireEvent.click(screen.getByRole('button', { name: 'Game Runner' }));

    expect(
      screen.getByRole('heading', { name: 'Drone (NPO Team)' })
    ).toBeInTheDocument();
    expect(screen.getByText('Damage Taken: 0')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '+1' }));
    expect(screen.getByText('Damage Taken: 1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '-1' }));
    fireEvent.click(screen.getByRole('button', { name: '-1' }));
    expect(screen.getByText('Damage Taken: 0')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox', { name: 'Injured' }));
    expect(screen.getByRole('checkbox', { name: 'Injured' })).toBeChecked();

    fireEvent.click(screen.getByRole('button', { name: 'List Builder' }));
    expect(screen.getByText(/Drone/)).toBeInTheDocument();
    expect(screen.getAllByText(/NPO Trooper/).length).toBeGreaterThan(0);
  });
});
