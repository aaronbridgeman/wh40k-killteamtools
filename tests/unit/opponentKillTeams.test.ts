/**
 * Unit tests for opponent kill teams and matchup tips data loading
 */

import { describe, it, expect } from 'vitest';
import {
  loadOpponentKillTeams,
  loadPlagueMarinesMatchupTips,
} from '@/services/dataLoader';
import { OpponentKillTeam } from '@/types/opponent';

describe('loadOpponentKillTeams', () => {
  it('should load a non-empty list of kill teams', async () => {
    const teams = await loadOpponentKillTeams();
    expect(Array.isArray(teams)).toBe(true);
    expect(teams.length).toBeGreaterThan(0);
  });

  it('should include all required fields on each entry', async () => {
    const teams = await loadOpponentKillTeams();
    teams.forEach((team: OpponentKillTeam) => {
      expect(team.id).toBeTruthy();
      expect(team.name).toBeTruthy();
      expect(team.faction).toBeTruthy();
      expect(typeof team.model_count).toBe('number');
      expect(team.model_count).toBeGreaterThan(0);
      expect(team.archetype).toBeTruthy();
      expect(['S', 'A', 'B', 'C']).toContain(team.tier);
      expect(team.tips_category).toBeTruthy();
      expect(Array.isArray(team.specific_tips)).toBe(true);
    });
  });

  it('should contain Fellgor Ravagers as an S-tier horde team', async () => {
    const teams = await loadOpponentKillTeams();
    const fellgor = teams.find((t) => t.id === 'fellgor-ravagers');
    expect(fellgor).toBeDefined();
    expect(fellgor?.tier).toBe('S');
    expect(fellgor?.tips_category).toBe('horde_teams');
    expect(fellgor?.model_count).toBe(12);
  });

  it('should contain Canoptek Circle as an S-tier elite shooting team', async () => {
    const teams = await loadOpponentKillTeams();
    const canoptek = teams.find((t) => t.id === 'canoptek-circle');
    expect(canoptek).toBeDefined();
    expect(canoptek?.tier).toBe('S');
    expect(canoptek?.tips_category).toBe('elite_shooting_teams');
    expect(canoptek?.model_count).toBe(6);
  });

  it('should have valid tips_category values', async () => {
    const validCategories = [
      'elite_marines_and_chaos',
      'horde_teams',
      'shooty_teams_with_good_range',
      'melee_heavy_teams',
      'elite_shooting_teams',
      'sneaky_and_infiltration_teams',
    ];
    const teams = await loadOpponentKillTeams();
    teams.forEach((team) => {
      expect(validCategories).toContain(team.tips_category);
    });
  });
});

describe('loadPlagueMarinesMatchupTips', () => {
  it('should load matchup tips data', async () => {
    const data = await loadPlagueMarinesMatchupTips();
    expect(data).toBeDefined();
  });

  it('should have team_wide_tips array', async () => {
    const data = await loadPlagueMarinesMatchupTips();
    expect(Array.isArray(data.team_wide_tips)).toBe(true);
    expect(data.team_wide_tips.length).toBeGreaterThan(0);
  });

  it('should have all required matchup_tips categories', async () => {
    const data = await loadPlagueMarinesMatchupTips();
    const categories = [
      'elite_marines_and_chaos',
      'horde_teams',
      'shooty_teams_with_good_range',
      'melee_heavy_teams',
      'elite_shooting_teams',
      'sneaky_and_infiltration_teams',
    ];
    categories.forEach((cat) => {
      expect(data.matchup_tips[cat as keyof typeof data.matchup_tips]).toBeDefined();
      expect(
        Array.isArray(
          data.matchup_tips[cat as keyof typeof data.matchup_tips]
        )
      ).toBe(true);
    });
  });

  it('should have tip and detail fields on every strategy tip', async () => {
    const data = await loadPlagueMarinesMatchupTips();
    data.team_wide_tips.forEach((t) => {
      expect(t.tip).toBeTruthy();
      expect(t.detail).toBeTruthy();
    });
    Object.values(data.matchup_tips).forEach((tipArray) => {
      tipArray.forEach((t) => {
        expect(t.tip).toBeTruthy();
        expect(t.detail).toBeTruthy();
      });
    });
  });

  it('should have operative_role_tips', async () => {
    const data = await loadPlagueMarinesMatchupTips();
    expect(data.operative_role_tips).toBeDefined();
    expect(data.operative_role_tips['champion']).toBeDefined();
  });
});
