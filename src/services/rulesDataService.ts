/**
 * Rules Data Service
 * Provides access to game rules data from rules.json
 */

import rulesData from '@/data/rules/rules.json';

export interface Rule {
  name: string;
  description: string;
}

export interface RuleCategory {
  category: string;
  rules: Rule[];
}

/**
 * Get all rules data
 */
export function getAllRules(): RuleCategory[] {
  return rulesData as RuleCategory[];
}

/**
 * Get action rules (rules with AP costs)
 */
export function getActionRules(): Rule[] {
  const allRules = getAllRules();
  const actionsCategory = allRules.find(
    (category) => category.category === 'Actions'
  );
  return actionsCategory?.rules || [];
}

/**
 * Get general rules (non-action rules)
 */
export function getGeneralRules(): RuleCategory[] {
  const allRules = getAllRules();
  return allRules.filter((category) => category.category !== 'Actions');
}

/**
 * Extract AP cost from rule name
 * E.g., "Reposition (1AP)" -> "1AP"
 */
export function extractAPCost(ruleName: string): string | null {
  const match = ruleName.match(/\((\d+AP)\)/);
  return match ? match[1] : null;
}

/**
 * Extract action name without AP cost
 * E.g., "Reposition (1AP)" -> "Reposition"
 */
export function extractActionName(ruleName: string): string {
  return ruleName.replace(/\s*\(\d+AP\)/, '');
}
