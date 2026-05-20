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
      screen.getByRole('button', { name: 'NPO Profile Manager' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Deployment' })
    ).not.toBeInTheDocument();
  });

  it('tracks activation draws with reset deck and draw activation actions', () => {
    render(<SoloJointOpsView />);

    fireEvent.click(screen.getByRole('button', { name: 'List Builder' }));

    const npoModelSelect = screen.getByLabelText(
      'NPO model selection'
    ) as HTMLSelectElement;
    const operativeName =
      npoModelSelect.options[
        npoModelSelect.selectedIndex
      ]?.textContent?.trim() || '';
    fireEvent.click(screen.getByRole('button', { name: 'Add NPO Model' }));

    fireEvent.click(screen.getByRole('button', { name: 'Game Runner' }));
    fireEvent.click(
      screen.getByRole('button', { name: /Setup Team|Manage Team Setup/i })
    );
    fireEvent.click(screen.getByRole('tab', { name: 'NPO Team Setup' }));

    const npoTeamNameInput = screen.getByLabelText('NPO Team Name');
    const npoTeamBuilder = npoTeamNameInput.closest('.team-builder');
    expect(npoTeamBuilder).not.toBeNull();

    const addOperativeButton = within(npoTeamBuilder as HTMLElement).getByRole(
      'button',
      {
        name: new RegExp(`${operativeName}\\s*Add`, 'i'),
      }
    );
    fireEvent.click(addOperativeButton);

    fireEvent.click(screen.getByRole('button', { name: 'Reset Deck' }));

    expect(
      screen.getByText('Activation 0 · Deck remaining: 1')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Draw Activation' }));

    expect(
      screen.getByText('Activation 1 · Deck remaining: 0')
    ).toBeInTheDocument();
    expect(screen.getByText('Current NPO Activation:')).toBeInTheDocument();
    const activationPanel = screen
      .getByText('Current NPO Activation:')
      .closest('.current-activation');
    expect(activationPanel).not.toBeNull();
    expect(
      within(activationPanel as HTMLElement).queryByRole('combobox')
    ).not.toBeInTheDocument();
    const activationOperativeList = (
      activationPanel as HTMLElement
    ).querySelector('.activation-operator-list');
    expect(activationOperativeList).not.toBeNull();
    expect(
      within(activationOperativeList as HTMLElement).getByText(operativeName)
    ).toBeInTheDocument();
  });

  it('supports duplicate card instances via count controls', () => {
    render(<SoloJointOpsView />);

    fireEvent.click(screen.getByRole('button', { name: 'List Builder' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add NPO Model' }));

    fireEvent.click(screen.getByRole('button', { name: 'Game Runner' }));
    fireEvent.click(
      screen.getByRole('button', { name: /Setup Team|Manage Team Setup/i })
    );
    fireEvent.click(screen.getByRole('tab', { name: 'NPO Team Setup' }));

    const npoTeamNameInput = screen.getByLabelText('NPO Team Name');
    const npoTeamBuilder = npoTeamNameInput.closest('.team-builder');
    expect(npoTeamBuilder).not.toBeNull();

    const addButtons = within(npoTeamBuilder as HTMLElement).getAllByRole(
      'button',
      {
        name: /\s*Add$/i,
      }
    );
    fireEvent.click(addButtons[0]);

    fireEvent.click(screen.getByRole('button', { name: 'Reset Deck' }));
    const deckManageButton = screen.getByRole('button', {
      name: /Manage Activation Deck.*card/i,
    });
    const initialCountMatch = deckManageButton.textContent?.match(/(\d+)/);
    const initialCount = Number(initialCountMatch?.[1] ?? '0');
    expect(initialCount).toBeGreaterThan(0);

    fireEvent.click(deckManageButton);
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

    fireEvent.click(
      screen.getByRole('button', { name: /Increase .* instance count/i })
    );

    const updatedDeckManageButton = screen.getByRole('button', {
      name: /Manage Activation Deck.*card/i,
    });
    const updatedCountMatch =
      updatedDeckManageButton.textContent?.match(/(\d+)/);
    const updatedCount = Number(updatedCountMatch?.[1] ?? '0');
    expect(updatedCount).toBe(initialCount + 1);
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
    fireEvent.click(
      screen.getByRole('button', { name: /Setup Team|Manage Team Setup/i })
    );
    fireEvent.click(screen.getByRole('tab', { name: 'NPO Team Setup' }));

    const npoTeamNameInput = screen.getByLabelText('NPO Team Name');
    const npoTeamBuilder = npoTeamNameInput.closest('.team-builder');
    expect(npoTeamBuilder).not.toBeNull();

    const addOperativeButton = within(npoTeamBuilder as HTMLElement).getByRole(
      'button',
      {
        name: new RegExp(`${operativeName}\\s*Add`, 'i'),
      }
    );
    fireEvent.click(addOperativeButton);

    fireEvent.click(screen.getByRole('button', { name: 'Reset Deck' }));
    fireEvent.click(screen.getByRole('button', { name: 'Draw Activation' }));

    const matchingRunnerHeadings = screen.getAllByRole('heading', {
      name: operativeName,
    });
    expect(matchingRunnerHeadings.length).toBeGreaterThan(0);

    const operativeCard = matchingRunnerHeadings[0].closest('article');
    expect(operativeCard).not.toBeNull();

    const damageRow = (operativeCard as HTMLElement).querySelector(
      '.npo-card-damage'
    );
    expect(damageRow).not.toBeNull();

    expect(damageRow as HTMLElement).toHaveTextContent('Damage Taken:');
    expect(damageRow as HTMLElement).toHaveTextContent('0');

    fireEvent.click(
      within(operativeCard as HTMLElement).getByRole('button', { name: '+1' })
    );
    expect(damageRow as HTMLElement).toHaveTextContent('1');

    fireEvent.click(
      within(operativeCard as HTMLElement).getByRole('button', { name: '-1' })
    );
    fireEvent.click(
      within(operativeCard as HTMLElement).getByRole('button', { name: '-1' })
    );
    expect(damageRow as HTMLElement).toHaveTextContent('0');

    const npoStatusPanel = screen.getByRole('heading', {
      name: 'NPO Operative Status',
    });
    const statusPanelContainer = npoStatusPanel.closest('.npo-roster-panel');
    expect(statusPanelContainer).not.toBeNull();

    const statusOperativeRows =
      statusPanelContainer?.querySelectorAll('.npo-roster-item') ?? [];
    expect(statusOperativeRows.length).toBeGreaterThan(0);

    const statusOperativeRow = statusOperativeRows[0] ?? null;
    expect(statusOperativeRow).not.toBeNull();

    const incapacitatedToggle = within(
      statusOperativeRow as HTMLElement
    ).getByRole('button', {
      name: 'Active 🪖',
    });
    fireEvent.click(incapacitatedToggle);
    expect(
      within(statusOperativeRow as HTMLElement).getByRole('button', {
        name: 'Incapacitated ☠',
      })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'List Builder' }));
    const npoListBuilder = screen.getByLabelText('NPO list builder');
    expect(npoListBuilder).toHaveTextContent(operativeName);
  });

  it('shows preview before add and opens datacard popup from list profile link', () => {
    render(<SoloJointOpsView />);

    fireEvent.click(screen.getByRole('button', { name: 'List Builder' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Player Lists' }));

    expect(
      screen.getByRole('heading', { name: 'Selected Datacard Preview' })
    ).toBeInTheDocument();
    expect(screen.getByText(/Default datacard:/i)).toBeInTheDocument();

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
    expect(screen.getByText(/Profile override: NPO Trooper/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Add Player Model' }));

    expect(screen.getByText(/Profile: NPO Trooper/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Profile: NPO Trooper/i }));
    expect(
      screen.getByRole('heading', { name: /Datacard$/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Using profile override: NPO Trooper/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(
      screen.queryByText(/Using profile override: NPO Trooper/i)
    ).not.toBeInTheDocument();
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
    const selectedProfileName =
      npoProfileOverride.options[0]?.textContent?.trim() ?? '';
    const customProfileId = npoProfileOverride.options[0]?.value ?? '';
    expect(selectedProfileName).not.toBe('');
    expect(customProfileId).not.toBe('');
    fireEvent.change(npoProfileOverride, {
      target: { value: customProfileId },
    });
    fireEvent.click(addButton);

    expect(screen.getByText(/Custom Beast/i)).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', {
        name: new RegExp(
          `Profile: ${selectedProfileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
          'i'
        ),
      }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getByText(/\(required\)/i)
    ).toBeInTheDocument();
  });

  it('includes built-in NPO catalog profiles in NPO profile override selection', () => {
    render(<SoloJointOpsView />);

    fireEvent.click(screen.getByRole('button', { name: 'List Builder' }));
    fireEvent.click(screen.getByRole('tab', { name: 'NPO Lists' }));

    const npoProfileOverride = screen.getByLabelText(
      'NPO profile override'
    ) as HTMLSelectElement;
    const profileOptions = Array.from(npoProfileOverride.options).map(
      (option) => option.textContent?.trim() ?? ''
    );

    expect(profileOptions).toContain('Brawler Trooper');
    expect(profileOptions).toContain('Marksman Trooper');
  });

  it('creates nemesis operatives and gives NPO nemesis two default activation cards', () => {
    render(<SoloJointOpsView />);

    fireEvent.click(
      screen.getByRole('button', { name: 'NPO Profile Manager' })
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Nemesis Profile Manager' })
    );

    fireEvent.change(screen.getByLabelText('Nemesis name'), {
      target: { value: 'Armoured Sentinel' },
    });
    fireEvent.change(screen.getByLabelText('Nemesis size'), {
      target: { value: 'medium' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Create Nemesis Operative' })
    );

    fireEvent.click(screen.getByRole('button', { name: 'List Builder' }));

    fireEvent.click(screen.getByRole('tab', { name: 'Player Lists' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Add Nemesis Operative' })
    );
    expect(screen.getByLabelText('Player list builder')).toHaveTextContent(
      'Armoured Sentinel'
    );

    fireEvent.click(screen.getByRole('tab', { name: 'NPO Lists' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Add Nemesis Operative' })
    );
    expect(screen.getByLabelText('NPO list builder')).toHaveTextContent(
      'Armoured Sentinel'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Game Runner' }));
    fireEvent.click(
      screen.getByRole('button', { name: /Setup Team|Manage Team Setup/i })
    );
    fireEvent.click(screen.getByRole('tab', { name: 'NPO Team Setup' }));

    const npoTeamNameInput = screen.getByLabelText('NPO Team Name');
    const npoTeamBuilder = npoTeamNameInput.closest('.team-builder');
    expect(npoTeamBuilder).not.toBeNull();

    fireEvent.click(
      within(npoTeamBuilder as HTMLElement).getByRole('button', {
        name: /Armoured Sentinel\s*Add/i,
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Reset Deck' }));
    expect(
      screen.getByText('Activation 0 · Deck remaining: 2')
    ).toBeInTheDocument();
  });

  it('allows nemesis weapon limit override and shows a warning', () => {
    render(<SoloJointOpsView />);

    fireEvent.click(
      screen.getByRole('button', { name: 'NPO Profile Manager' })
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Nemesis Profile Manager' })
    );

    fireEvent.change(screen.getByLabelText('Nemesis name'), {
      target: { value: 'Overloaded Nemesis' },
    });
    fireEvent.change(screen.getByLabelText('Nemesis size'), {
      target: { value: 'small' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Edit Ranged' }));
    fireEvent.click(screen.getByRole('button', { name: 'Edit Melee' }));

    const weaponToggles = screen.getAllByRole('button').filter((element) => {
      const label = element.getAttribute('aria-label') ?? '';
      return (
        label.includes('Toggle ranged weapon') ||
        label.includes('Toggle melee weapon')
      );
    });
    expect(weaponToggles.length).toBeGreaterThan(0);

    let toggled = 0;
    weaponToggles.forEach((toggle) => {
      if (toggled >= 3) return;
      const button = toggle as HTMLButtonElement;
      if (button.getAttribute('aria-pressed') !== 'true') {
        fireEvent.click(toggle);
        toggled += 1;
      }
    });

    expect(
      screen.getByText(/selected weapons exceed the recommended limit/i)
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Create Nemesis Operative' })
    );

    expect(screen.getAllByText(/Overloaded Nemesis/i).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Warning: weapon selections exceed recommended limit/i)
        .length
    ).toBeGreaterThan(0);
  });

  it('counts Selection X weapon rules toward selection limit', () => {
    render(<SoloJointOpsView />);

    fireEvent.click(
      screen.getByRole('button', { name: 'NPO Profile Manager' })
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Nemesis Profile Manager' })
    );

    fireEvent.change(screen.getByLabelText('Nemesis name'), {
      target: { value: 'Weighted Nemesis' },
    });
    fireEvent.change(screen.getByLabelText('Nemesis size'), {
      target: { value: 'small' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Edit Ranged' }));
    fireEvent.click(screen.getByRole('button', { name: 'Edit Melee' }));

    const rangedToggles = screen.getAllByRole('button').filter((element) => {
      const label = element.getAttribute('aria-label') ?? '';
      return label.includes('Toggle ranged weapon');
    });

    rangedToggles.forEach((toggle) => {
      const button = toggle as HTMLButtonElement;
      if (button.getAttribute('aria-pressed') === 'true') {
        fireEvent.click(toggle);
      }
    });

    const meleeToggles = screen.getAllByRole('button').filter((element) => {
      const label = element.getAttribute('aria-label') ?? '';
      return label.includes('Toggle melee weapon');
    });

    meleeToggles.forEach((toggle) => {
      const button = toggle as HTMLButtonElement;
      if (button.getAttribute('aria-pressed') === 'true') {
        fireEvent.click(toggle);
      }
    });

    fireEvent.click(
      screen.getByRole('button', { name: /Toggle ranged weapon Cyclic ion raker/i })
    );
    expect(
      screen.queryByText(/selected weapons exceed the recommended limit/i)
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /Toggle ranged weapon Autocannon/i })
    );
    expect(
      screen.getByText(/selected weapons exceed the recommended limit/i)
    ).toBeInTheDocument();
  });

  it('allows trait override warnings and shows selected traits on datacard summary', () => {
    window.localStorage.clear();
    render(<SoloJointOpsView />);

    fireEvent.click(
      screen.getByRole('button', { name: 'NPO Profile Manager' })
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Nemesis Profile Manager' })
    );

    fireEvent.change(screen.getByLabelText('Nemesis name'), {
      target: { value: 'Trait Nemesis' },
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: /Toggle allegiance trait Let the Galaxy Burn/i,
      })
    );
    fireEvent.click(
      screen.getByRole('button', {
        name: /Toggle allegiance trait Defenders of the Imperium/i,
      })
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Toggle nemesis trait Focused Targeting/i,
      })
    );
    fireEvent.click(
      screen.getByRole('button', {
        name: /Toggle nemesis trait Shielded/i,
      })
    );

    expect(
      screen.getByText(/more than one allegiance trait selected/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/more than one nemesis trait selected/i)
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Create Nemesis Operative' })
    );

    fireEvent.click(screen.getByRole('button', { name: 'List Builder' }));
    fireEvent.click(screen.getByRole('tab', { name: 'NPO Lists' }));

    const npoNemesisSelect = screen.getByLabelText(
      'NPO Nemesis'
    ) as HTMLSelectElement;
    const traitNemesisOption = within(npoNemesisSelect).getByRole('option', {
      name: 'Trait Nemesis',
    }) as HTMLOptionElement;
    fireEvent.change(npoNemesisSelect, {
      target: { value: traitNemesisOption.value },
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Add Nemesis Operative' })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Game Runner' }));
    fireEvent.click(
      screen.getByRole('button', { name: /Setup Team|Manage Team Setup/i })
    );
    fireEvent.click(screen.getByRole('tab', { name: 'NPO Team Setup' }));

    const npoTeamNameInput = screen.getByLabelText('NPO Team Name');
    const npoTeamBuilder = npoTeamNameInput.closest('.team-builder');
    expect(npoTeamBuilder).not.toBeNull();

    fireEvent.click(
      within(npoTeamBuilder as HTMLElement).getByRole('button', {
        name: /Trait Nemesis\s*Add/i,
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Reset Deck' }));
    fireEvent.click(screen.getByRole('button', { name: 'Draw Activation' }));

    expect(screen.getByText('Let the Galaxy Burn')).toBeInTheDocument();
    expect(screen.getByText('Defenders of the Imperium')).toBeInTheDocument();
    expect(screen.getByText('Focused Targeting')).toBeInTheDocument();
    expect(screen.getByText('Shielded')).toBeInTheDocument();
  });
});
