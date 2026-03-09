/**
 * Unit tests for MissionSelect component and missions data.
 *
 * Covers:
 *  - CRIT_OPS data shape and completeness
 *  - TAC_OPS data shape, archetype grouping, and rich detail fields
 *  - MissionSelect dropdown rendering (flat and grouped)
 *  - Rich detail display (mission actions, VP, additional rules, reveal condition)
 *  - Custom input behaviour
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MissionSelect } from '@/components/event/MissionSelect';
import { CRIT_OPS, TAC_OPS, MissionEntry } from '@/data/missions/missions';

// ── CRIT_OPS data tests ────────────────────────────────────────────────────

describe('CRIT_OPS data', () => {
  it('contains exactly 9 named ops plus the Custom sentinel', () => {
    const named = CRIT_OPS.filter((o) => o.id !== 'custom');
    expect(named).toHaveLength(9);
    const custom = CRIT_OPS.find((o) => o.id === 'custom');
    expect(custom).toBeDefined();
  });

  it('includes all 9 authoritative crit ops by id', () => {
    const ids = CRIT_OPS.map((o) => o.id);
    expect(ids).toContain('secure');
    expect(ids).toContain('loot');
    expect(ids).toContain('transmission');
    expect(ids).toContain('orb');
    expect(ids).toContain('stake-claim');
    expect(ids).toContain('energy-cells');
    expect(ids).toContain('download');
    expect(ids).toContain('data');
    expect(ids).toContain('reboot');
  });

  it('every named entry has a non-empty name and description', () => {
    CRIT_OPS.filter((o) => o.id !== 'custom').forEach((op) => {
      expect(op.name).toBeTruthy();
      expect(op.description).toBeTruthy();
    });
  });

  it('every named entry has at least victory_points or additional_rules', () => {
    CRIT_OPS.filter((o) => o.id !== 'custom').forEach((op) => {
      const hasVP = Array.isArray(op.victory_points) && op.victory_points.length > 0;
      const hasRules = Boolean(op.additional_rules);
      expect(hasVP || hasRules).toBe(true);
    });
  });

  it('ops with mission_actions have valid ap_cost, description, and name', () => {
    CRIT_OPS.filter((o) => o.mission_actions).forEach((op) => {
      op.mission_actions!.forEach((action) => {
        expect(action.name).toBeTruthy();
        expect(typeof action.ap_cost).toBe('number');
        expect(action.ap_cost).toBeGreaterThan(0);
        expect(action.description).toBeTruthy();
      });
    });
  });

  it('Secure has one mission action costing 1AP', () => {
    const secure = CRIT_OPS.find((o) => o.id === 'secure');
    expect(secure?.mission_actions).toHaveLength(1);
    expect(secure?.mission_actions![0].ap_cost).toBe(1);
    expect(secure?.mission_actions![0].name).toBe('Secure');
  });

  it('Data has two mission actions: Compile Data and Send Data', () => {
    const data = CRIT_OPS.find((o) => o.id === 'data');
    expect(data?.mission_actions).toHaveLength(2);
    const names = data?.mission_actions!.map((a) => a.name);
    expect(names).toContain('Compile Data');
    expect(names).toContain('Send Data');
  });

  it('Reboot has a mission action costing 2AP', () => {
    const reboot = CRIT_OPS.find((o) => o.id === 'reboot');
    expect(reboot?.mission_actions![0].ap_cost).toBe(2);
  });

  it('Energy Cells has additional_rules as an array', () => {
    const ec = CRIT_OPS.find((o) => o.id === 'energy-cells');
    expect(Array.isArray(ec?.additional_rules)).toBe(true);
    expect((ec?.additional_rules as string[]).length).toBeGreaterThan(0);
  });

  it('Orb has additional_rules as a string', () => {
    const orb = CRIT_OPS.find((o) => o.id === 'orb');
    expect(typeof orb?.additional_rules).toBe('string');
  });

  it('Stake Claim has no mission_actions but has additional_rules and victory_points', () => {
    const sc = CRIT_OPS.find((o) => o.id === 'stake-claim');
    expect(sc?.mission_actions).toBeUndefined();
    expect(sc?.additional_rules).toBeTruthy();
    expect(sc?.victory_points?.length).toBeGreaterThan(0);
  });
});

// ── MissionSelect component tests ─────────────────────────────────────────

describe('MissionSelect', () => {
  it('renders the label and dropdown', () => {
    render(
      <MissionSelect
        label="Crit Op"
        options={CRIT_OPS}
        value=""
        onChange={vi.fn()}
      />
    );
    expect(screen.getByLabelText('Crit Op')).toBeInTheDocument();
  });

  it('lists all named crit ops in the dropdown', () => {
    render(
      <MissionSelect
        label="Crit Op"
        options={CRIT_OPS}
        value=""
        onChange={vi.fn()}
      />
    );
    const named = CRIT_OPS.filter((o) => o.id !== 'custom');
    named.forEach((op) => {
      expect(screen.getByRole('option', { name: op.name })).toBeInTheDocument();
    });
  });

  it('lists all named tac ops in the dropdown', () => {
    render(
      <MissionSelect
        label="Tac Op"
        options={TAC_OPS}
        value=""
        onChange={vi.fn()}
      />
    );
    const named = TAC_OPS.filter((o) => o.id !== 'custom');
    named.forEach((op) => {
      expect(screen.getByRole('option', { name: op.name })).toBeInTheDocument();
    });
  });

  it('shows rich detail panel when a crit op with actions is selected', () => {
    render(
      <MissionSelect
        label="Crit Op"
        options={CRIT_OPS}
        value="Secure"
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText('⚡ Mission Actions')).toBeInTheDocument();
    expect(screen.getByText('🏆 Victory Points')).toBeInTheDocument();
    // The Secure action name appears in both the dropdown option and the detail panel
    expect(screen.getAllByText('Secure').length).toBeGreaterThanOrEqual(2);
    // AP cost badge — "1AP" or "1 AP" depending on whitespace normalization
    const apBadge = screen.getByText(/1\s*AP/);
    expect(apBadge).toBeInTheDocument();
  });

  it('shows additional rules section when the selected op has additional_rules', () => {
    render(
      <MissionSelect
        label="Crit Op"
        options={CRIT_OPS}
        value="Orb"
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText('📜 Special Rules')).toBeInTheDocument();
  });

  it('shows action restrictions text when present', () => {
    render(
      <MissionSelect
        label="Crit Op"
        options={CRIT_OPS}
        value="Secure"
        onChange={vi.fn()}
      />
    );
    expect(
      screen.getByText(
        /An operative cannot perform this action during the first turning point/
      )
    ).toBeInTheDocument();
  });

  it('shows Data op with two actions', () => {
    render(
      <MissionSelect
        label="Crit Op"
        options={CRIT_OPS}
        value="Data"
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText('Compile Data')).toBeInTheDocument();
    expect(screen.getByText('Send Data')).toBeInTheDocument();
  });

  it('shows rich detail for a Tac Op with mission actions (Scout Enemy Movement)', () => {
    render(
      <MissionSelect
        label="Tac Op"
        options={TAC_OPS}
        value="Scout Enemy Movement"
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText('⚡ Mission Actions')).toBeInTheDocument();
    expect(screen.getByText('🏆 Victory Points')).toBeInTheDocument();
    expect(screen.getByText('Scout')).toBeInTheDocument();
  });

  it('shows reveal condition for a Tac Op', () => {
    render(
      <MissionSelect
        label="Tac Op"
        options={TAC_OPS}
        value="Flank"
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText('👁 Reveal')).toBeInTheDocument();
    expect(screen.getByText('Strategic Gambit')).toBeInTheDocument();
  });

  it('shows special rules for Flank tac op', () => {
    render(
      <MissionSelect
        label="Tac Op"
        options={TAC_OPS}
        value="Flank"
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText('📜 Special Rules')).toBeInTheDocument();
  });

  it('shows custom input when value does not match any predefined option', () => {
    render(
      <MissionSelect
        label="Crit Op"
        options={CRIT_OPS}
        value="My Custom Op"
        onChange={vi.fn()}
      />
    );
    const input = screen.getByRole('textbox', { name: 'Custom Crit Op name' });
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('My Custom Op');
  });

  it('calls onChange with empty string when Custom / Other… is selected', () => {
    const onChange = vi.fn();
    render(
      <MissionSelect
        label="Crit Op"
        options={CRIT_OPS}
        value="Secure"
        onChange={onChange}
      />
    );
    fireEvent.change(screen.getByLabelText('Crit Op'), {
      target: { value: '__custom__' },
    });
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('calls onChange with the mission name when a predefined op is selected', () => {
    const onChange = vi.fn();
    render(
      <MissionSelect
        label="Crit Op"
        options={CRIT_OPS}
        value=""
        onChange={onChange}
      />
    );
    fireEvent.change(screen.getByLabelText('Crit Op'), {
      target: { value: 'Loot' },
    });
    expect(onChange).toHaveBeenCalledWith('Loot');
  });

  it('does not show rich detail when no value is selected', () => {
    render(
      <MissionSelect
        label="Crit Op"
        options={CRIT_OPS}
        value=""
        onChange={vi.fn()}
      />
    );
    expect(screen.queryByText('⚡ Mission Actions')).not.toBeInTheDocument();
    expect(screen.queryByText('🏆 Victory Points')).not.toBeInTheDocument();
  });
});

// ── MissionEntry type shape ────────────────────────────────────────────────

describe('MissionEntry type compatibility', () => {
  it('TAC_OPS entries are valid MissionEntry objects', () => {
    TAC_OPS.forEach((op: MissionEntry) => {
      expect(op.id).toBeTruthy();
      expect(op.name).toBeTruthy();
      expect(typeof op.description).toBe('string');
    });
  });
});

// ── TAC_OPS data tests ────────────────────────────────────────────────────

describe('TAC_OPS data', () => {
  it('contains exactly 12 named ops plus the Custom sentinel', () => {
    const named = TAC_OPS.filter((o) => o.id !== 'custom');
    expect(named).toHaveLength(12);
    const custom = TAC_OPS.find((o) => o.id === 'custom');
    expect(custom).toBeDefined();
  });

  it('includes all 4 archetypes: Recon, Infiltration, Security, Seek & Destroy', () => {
    const named = TAC_OPS.filter((o) => o.id !== 'custom');
    const archetypes = [...new Set(named.map((o) => o.archetype))];
    expect(archetypes).toContain('Recon');
    expect(archetypes).toContain('Infiltration');
    expect(archetypes).toContain('Security');
    expect(archetypes).toContain('Seek & Destroy');
    expect(archetypes).toHaveLength(4);
  });

  it('each archetype has exactly 3 tac ops', () => {
    const named = TAC_OPS.filter((o) => o.id !== 'custom');
    const counts: Record<string, number> = {};
    named.forEach((o) => {
      const arch = o.archetype ?? '';
      counts[arch] = (counts[arch] ?? 0) + 1;
    });
    Object.values(counts).forEach((count) => expect(count).toBe(3));
  });

  it('every named entry has a non-empty name, description, and archetype', () => {
    TAC_OPS.filter((o) => o.id !== 'custom').forEach((op) => {
      expect(op.name).toBeTruthy();
      expect(op.description).toBeTruthy();
      expect(op.archetype).toBeTruthy();
    });
  });

  it('every named entry has a reveal_condition', () => {
    TAC_OPS.filter((o) => o.id !== 'custom').forEach((op) => {
      expect(op.reveal_condition).toBeTruthy();
    });
  });

  it('every named entry has victory_points', () => {
    TAC_OPS.filter((o) => o.id !== 'custom').forEach((op) => {
      expect(Array.isArray(op.victory_points)).toBe(true);
      expect(op.victory_points!.length).toBeGreaterThan(0);
    });
  });

  it('includes all 12 tac ops by id', () => {
    const ids = TAC_OPS.map((o) => o.id);
    expect(ids).toContain('flank');
    expect(ids).toContain('scout-enemy-movement');
    expect(ids).toContain('retrieval');
    expect(ids).toContain('track-enemy');
    expect(ids).toContain('steal-intelligence');
    expect(ids).toContain('plant-devices');
    expect(ids).toContain('plant-banner');
    expect(ids).toContain('martyrs');
    expect(ids).toContain('envoy');
    expect(ids).toContain('sweep-and-clear');
    expect(ids).toContain('route');
    expect(ids).toContain('dominate');
  });

  it('ops with mission_actions have valid ap_cost, description, and name', () => {
    TAC_OPS.filter((o) => o.mission_actions).forEach((op) => {
      op.mission_actions!.forEach((action) => {
        expect(action.name).toBeTruthy();
        expect(typeof action.ap_cost).toBe('number');
        expect(action.ap_cost).toBeGreaterThan(0);
        expect(action.description).toBeTruthy();
      });
    });
  });

  it('Flank has additional_rules as an array and no mission_actions', () => {
    const flank = TAC_OPS.find((o) => o.id === 'flank');
    expect(Array.isArray(flank?.additional_rules)).toBe(true);
    expect(flank?.mission_actions).toBeUndefined();
  });

  it('Scout Enemy Movement has one mission action costing 1AP', () => {
    const sem = TAC_OPS.find((o) => o.id === 'scout-enemy-movement');
    expect(sem?.mission_actions).toHaveLength(1);
    expect(sem?.mission_actions![0].ap_cost).toBe(1);
    expect(sem?.mission_actions![0].name).toBe('Scout');
  });

  it('Sweep & Clear has both additional_rules and a mission action', () => {
    const sc = TAC_OPS.find((o) => o.id === 'sweep-and-clear');
    expect(Array.isArray(sc?.additional_rules)).toBe(true);
    expect(sc?.mission_actions).toHaveLength(1);
    expect(sc?.mission_actions![0].name).toBe('Clear');
  });

  it('Route has no mission_actions and no additional_rules', () => {
    const route = TAC_OPS.find((o) => o.id === 'route');
    expect(route?.mission_actions).toBeUndefined();
    expect(route?.additional_rules).toBeUndefined();
  });
});
