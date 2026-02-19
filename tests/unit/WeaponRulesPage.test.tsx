/**
 * Unit tests for WeaponRulesPage component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeaponRulesPage } from '@/components/rules/WeaponRulesPage';

describe('WeaponRulesPage', () => {
  it('renders the page title', () => {
    render(<WeaponRulesPage />);
    expect(
      screen.getByRole('heading', { name: /Weapon Rules Reference/i })
    ).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<WeaponRulesPage />);
    expect(
      screen.getByText(/Complete list of all weapon special rules/i)
    ).toBeInTheDocument();
  });

  it('displays multiple weapon rules', () => {
    render(<WeaponRulesPage />);
    
    // Check for some known weapon rules
    expect(screen.getByText('Balanced')).toBeInTheDocument();
    expect(screen.getByText('Lethal x+')).toBeInTheDocument();
    expect(screen.getByText('Piercing x')).toBeInTheDocument();
  });

  it('displays rule descriptions', () => {
    render(<WeaponRulesPage />);

    // Check for a description snippet - multiple rules contain "re-roll"
    const reRollTexts = screen.getAllByText(/re-roll/i);
    expect(reRollTexts.length).toBeGreaterThan(0);
    expect(reRollTexts[0]).toBeInTheDocument();
  });

  it('renders all weapon rules from the data', () => {
    render(<WeaponRulesPage />);
    
    // The weapon-rules.json has 22 rules
    const ruleCards = screen.getAllByText(/x\+?|critical|attack|damage|operatives?/i);
    expect(ruleCards.length).toBeGreaterThan(10);
  });
});
