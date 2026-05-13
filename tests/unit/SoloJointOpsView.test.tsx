import { fireEvent, render, screen, within } from '@testing-library/react';
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
      screen.getByText('Turning Point 1 · Activation 2 · Active: Player Team')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next Turning Point' }));

    expect(
      screen.getByText('Turning Point 2 · Activation 0 · Active: NPO Team')
    ).toBeInTheDocument();
  });

  it('creates and updates an NPO runner card from the list builder', () => {
    render(<SoloJointOpsView />);

    fireEvent.click(screen.getByRole('button', { name: 'List Builder' }));

    const npoOperativeSelect = screen.getByLabelText(
      'NPO operative selection'
    ) as HTMLSelectElement;
    const operativeName =
      npoOperativeSelect.options[npoOperativeSelect.selectedIndex]?.textContent?.trim() ||
      '';

    expect(operativeName).not.toBe('');

    fireEvent.click(screen.getByRole('button', { name: 'Add NPO Operative' }));

    fireEvent.click(screen.getByRole('button', { name: 'Game Runner' }));

    const npoTeamNameInput = screen.getByLabelText('NPO Team Name');
    const npoTeamBuilder = npoTeamNameInput.closest('.team-builder');
    expect(npoTeamBuilder).not.toBeNull();

    const npoSelectionCheckbox = within(npoTeamBuilder as HTMLElement).getByRole(
      'checkbox',
      {
        name: operativeName,
      }
    );
    fireEvent.click(npoSelectionCheckbox);

    expect(
      screen.getByRole('heading', { name: `${operativeName} (NPO Team)` })
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
    const npoListBuilder = screen.getByLabelText('NPO list builder');
    expect(npoListBuilder).toHaveTextContent(operativeName);
  });
});
