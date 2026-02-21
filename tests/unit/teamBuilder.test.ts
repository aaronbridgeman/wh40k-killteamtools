/**
 * Unit tests for teamBuilder service
 */

import { describe, it, expect } from 'vitest';
import {
  validateTeamComposition,
  calculateTeamCost,
  canAddOperative,
} from '@/services/teamBuilder';
import { Faction, Operative, OperativeStats } from '@/types';

const mockStats: OperativeStats = {
  movement: 6,
  actionPointLimit: 2,
  groupActivation: 1,
  defense: 3,
  save: 3,
  wounds: 10,
};

const mockOperative1: Operative = {
  id: 'op1',
  name: 'Operative 1',
  type: 'Trooper',
  stats: mockStats,
  weapons: [],
  abilities: [],
  keywords: ['WARRIOR'],
  cost: 1,
};

const mockOperative2: Operative = {
  id: 'op2',
  name: 'Operative 2',
  type: 'Leader',
  stats: mockStats,
  weapons: [],
  abilities: [],
  keywords: ['LEADER'],
  cost: 2,
};

const mockOperative3: Operative = {
  id: 'op3',
  name: 'Operative 3',
  type: 'Trooper',
  stats: mockStats,
  weapons: [],
  abilities: [],
  keywords: ['GUNNER'],
  cost: 1,
};

const mockFaction: Faction = {
  id: 'test-faction',
  name: 'Test Faction',
  description: 'Test',
  rules: [],
  operatives: [mockOperative1, mockOperative2, mockOperative3],
  weapons: [],
  abilities: [],
  restrictions: {
    maxOperatives: 6,
    minOperatives: 4,
    composition: {
      selection_limits: {
        leader_count: 1,
        exception: 'WARRIOR',
      },
    },
  },
  metadata: {
    version: '1.0.0',
    source: 'Test',
    lastUpdated: '2024-01-01',
  },
};

describe('teamBuilder', () => {
  describe('validateTeamComposition', () => {
    it('should validate a team within limits', () => {
      // Team with 1 leader and multiple warriors (allowed)
      const team = [mockOperative2, mockOperative1, mockOperative1, mockOperative1];
      const result = validateTeamComposition(mockFaction, team);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject team with too many operatives', () => {
      const team = [mockOperative2, ...Array(6).fill(mockOperative1)];
      const result = validateTeamComposition(mockFaction, team);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject team with too few operatives', () => {
      const team = [mockOperative2];
      const result = validateTeamComposition(mockFaction, team);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject team without leader', () => {
      const team = [mockOperative1, mockOperative1, mockOperative1, mockOperative1];
      const result = validateTeamComposition(mockFaction, team);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Team must have exactly 1 leader operative');
    });

    it('should reject team with duplicate unique operatives', () => {
      const team = [mockOperative2, mockOperative3, mockOperative3, mockOperative1];
      const result = validateTeamComposition(mockFaction, team);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Cannot have multiple'))).toBe(true);
    });
  });

  describe('calculateTeamCost', () => {
    it('should calculate total team cost', () => {
      const team = [mockOperative1, mockOperative2];
      const cost = calculateTeamCost(team);
      expect(cost).toBe(3);
    });

    it('should return 0 for empty team', () => {
      const cost = calculateTeamCost([]);
      expect(cost).toBe(0);
    });
  });

  describe('canAddOperative', () => {
    it('should allow adding operative within limits', () => {
      const team = [mockOperative2, mockOperative1, mockOperative1, mockOperative1];
      const result = canAddOperative(mockFaction, team, mockOperative1);
      expect(result.canAdd).toBe(true);
    });

    it('should prevent adding operative beyond max', () => {
      const team = [mockOperative2, ...Array(5).fill(mockOperative1)];
      const result = canAddOperative(mockFaction, team, mockOperative1);
      expect(result.canAdd).toBe(false);
      expect(result.reason).toContain('maximum capacity');
    });

    it('should prevent adding second leader', () => {
      const team = [mockOperative2, mockOperative1];
      const result = canAddOperative(mockFaction, team, mockOperative2);
      expect(result.canAdd).toBe(false);
      expect(result.reason).toContain('leader');
    });

    it('should prevent adding duplicate unique operative', () => {
      const team = [mockOperative2, mockOperative3];
      const result = canAddOperative(mockFaction, team, mockOperative3);
      expect(result.canAdd).toBe(false);
      expect(result.reason).toContain('already in the team');
    });

    it('should allow adding multiple warriors', () => {
      const team = [mockOperative2, mockOperative1, mockOperative1];
      const result = canAddOperative(mockFaction, team, mockOperative1);
      expect(result.canAdd).toBe(true);
    });
  });
});
