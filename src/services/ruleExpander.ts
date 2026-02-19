/**
 * Service for expanding weapon rule abbreviations
 */

import rulesGlossary from '@/data/weapons/rules-glossary.json';

export interface RuleExpansion {
  name: string;
  description: string;
}

/**
 * Expand a weapon rule abbreviation to its full description
 */
export function expandWeaponRule(
  ruleName: string,
  value?: number | string
): RuleExpansion | null {
  const baseRule = rulesGlossary[ruleName as keyof typeof rulesGlossary];

  if (!baseRule) {
    return null;
  }

  // Replace X with the actual value if provided
  let description = baseRule.description;
  if (value !== undefined) {
    description = description.replace(/X/g, String(value));
  }

  return {
    name: value !== undefined ? `${baseRule.name} ${value}` : baseRule.name,
    description,
  };
}

/**
 * Get all available weapon rules
 */
export function getAllWeaponRules(): Record<string, RuleExpansion> {
  return Object.entries(rulesGlossary).reduce(
    (acc, [key, value]) => {
      acc[key] = {
        name: value.name,
        description: value.description,
      };
      return acc;
    },
    {} as Record<string, RuleExpansion>
  );
}

/**
 * Search weapon rules by name or description
 */
export function searchWeaponRules(query: string): RuleExpansion[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(rulesGlossary)
    .filter(
      (rule) =>
        rule.name.toLowerCase().includes(lowerQuery) ||
        rule.description.toLowerCase().includes(lowerQuery)
    )
    .map((rule) => ({
      name: rule.name,
      description: rule.description,
    }));
}
