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

    // Verify we have the expected weapon rules by checking for specific rule names
    expect(screen.getByText('Balanced')).toBeInTheDocument();
    expect(screen.getByText('Lethal x+')).toBeInTheDocument();
    expect(screen.getByText('Piercing x')).toBeInTheDocument();
    expect(screen.getByText('Brutal')).toBeInTheDocument();
    expect(screen.getByText('Relentless')).toBeInTheDocument();

    // Check for multiple rule headings (level 3 headings are used for each rule)
    const ruleHeadings = screen.getAllByRole('heading', { level: 3 });
    expect(ruleHeadings.length).toBe(22); // 22 weapon rules in the data
  });
});
