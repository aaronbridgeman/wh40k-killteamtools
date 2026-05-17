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

    const npoModelSelect = screen.getByLabelText(
      'NPO model selection'
    ) as HTMLSelectElement;
    const operativeName =
      npoModelSelect.options[
        npoModelSelect.selectedIndex
      ]?.textContent?.trim() || '';

    expect(operativeName).not.toBe('');

    fireEvent.click(screen.getByRole('button', { name: 'Add NPO Model' }));

    fireEvent.click(screen.getByRole('button', { name: 'Game Runner' }));

    const npoTeamNameInput = screen.getByLabelText('NPO Team Name');
    const npoTeamBuilder = npoTeamNameInput.closest('.team-builder');
    expect(npoTeamBuilder).not.toBeNull();

    const npoSelectionCheckbox = within(
      npoTeamBuilder as HTMLElement
    ).getByRole('checkbox', {
      name: operativeName,
    });
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

  it('uses Datacard by default and allows profile override for player models', () => {
    render(<SoloJointOpsView />);

    fireEvent.click(screen.getByRole('button', { name: 'List Builder' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Player Lists' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add Player Model' }));

    expect(screen.getByText(/Profile: Datacard/i)).toBeInTheDocument();

    const playerProfileOverride = screen.getByLabelText(
      'Player profile override'
    ) as HTMLSelectElement;
    const overrideProfileId = playerProfileOverride.options[1]?.value ?? '';
    expect(overrideProfileId).not.toBe('');
    fireEvent.change(playerProfileOverride, {
      target: { value: overrideProfileId },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add Player Model' }));

    expect(screen.getByText(/Profile: NPO Trooper/i)).toBeInTheDocument();
  });

  it('requires explicit profile for custom models', () => {
    render(<SoloJointOpsView />);

    fireEvent.click(screen.getByRole('button', { name: 'List Builder' }));
    fireEvent.click(screen.getByRole('tab', { name: 'NPO Lists' }));
    fireEvent.change(screen.getByLabelText('NPO model selection'), {
      target: { value: '__custom-model__' },
    });

    const addButton = screen.getByRole('button', { name: 'Add NPO Model' });
    expect(addButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText('NPO custom model description'), {
      target: { value: 'Custom Beast' },
    });
    const npoProfileOverride = screen.getByLabelText(
      'NPO profile override'
    ) as HTMLSelectElement;
    const customProfileId = npoProfileOverride.options[0]?.value ?? '';
    expect(customProfileId).not.toBe('');
    fireEvent.change(npoProfileOverride, {
      target: { value: customProfileId },
    });
    fireEvent.click(addButton);

    expect(screen.getByText(/Custom Beast/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Profile: NPO Trooper \(required\)/i)
    ).toBeInTheDocument();
  });
});
