/**
 * Service for expanding weapon rule abbreviations
 */

import weaponRules from '@/data/weapons/weapon-rules.json';

type WeaponRuleSection = {
  category: string;
  rules: Array<{ name: string; description: string }>;
};

export interface RuleExpansion {
  name: string;
  description: string;
}

const normalizeRuleKey = (name: string) =>
  name.replace(/\s+[xX]\+?$/, '').trim();

const applyPlaceholder = (text: string, value: number | string) => {
  const v = String(value);
  // First replace x+ (keep the plus), then any remaining x placeholders.
  return text.replace(/x\+/gi, `${v}+`).replace(/x/gi, v);
};

const ruleMap: Record<string, RuleExpansion> = (
  weaponRules as WeaponRuleSection[]
).reduce(
  (acc, section) => {
    section.rules.forEach((rule) => {
      const key = normalizeRuleKey(rule.name);
      acc[key] = {
        name: rule.name,
        description: rule.description,
      };
    });
    return acc;
  },
  {} as Record<string, RuleExpansion>
);

/**
 * Expand a weapon rule abbreviation to its full description
 */
export function expandWeaponRule(
  ruleName: string,
  value?: number | string
): RuleExpansion | null {
  const normalized = normalizeRuleKey(ruleName);
  const baseRule = ruleMap[normalized];

  if (!baseRule) {
    return null;
  }

  // Replace X with the actual value if provided
  let description = baseRule.description;
  if (value !== undefined) {
    description = applyPlaceholder(description, value);
  }

  return {
    name:
      value !== undefined
        ? applyPlaceholder(baseRule.name, value)
        : baseRule.name,
    description,
  };
}

/**
 * Get all available weapon rules
 */
export function getAllWeaponRules(): Record<string, RuleExpansion> {
  return { ...ruleMap };
}

/**
 * Search weapon rules by name or description
 */
export function searchWeaponRules(query: string): RuleExpansion[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(ruleMap)
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
