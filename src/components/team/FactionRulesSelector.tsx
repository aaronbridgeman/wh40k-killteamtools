/**
 * Component for selecting faction-specific rule choices
 * (e.g., Chapter Tactics for Angels of Death)
 */

import { Faction, FactionRuleChoices } from '@/types';
import { ChapterTacticsSelector } from './ChapterTacticsSelector';
import styles from './FactionRulesSelector.module.css';

interface FactionRulesSelectorProps {
  faction: Faction;
  ruleChoices: FactionRuleChoices | null;
  onRuleChoiceChange: (category: string, ruleId: string) => void;
}

export function FactionRulesSelector({
  faction,
  ruleChoices,
  onRuleChoiceChange,
}: FactionRulesSelectorProps) {
  // Handle Chapter Tactics for Angels of Death
  if (faction.chapter_tactics) {
    const primaryTactic = ruleChoices?.chapterTactics?.primary || '';
    const secondaryTactic = ruleChoices?.chapterTactics?.secondary || '';

    const handlePrimaryChange = (tacticId: string) => {
      onRuleChoiceChange('chapter_tactics_primary', tacticId);
    };

    const handleSecondaryChange = (tacticId: string) => {
      onRuleChoiceChange('chapter_tactics_secondary', tacticId);
    };

    return (
      <ChapterTacticsSelector
        chapterTactics={faction.chapter_tactics}
        primaryTactic={primaryTactic}
        secondaryTactic={secondaryTactic}
        onPrimaryChange={handlePrimaryChange}
        onSecondaryChange={handleSecondaryChange}
      />
    );
  }

  // Check if faction has any strategic or tactical rules that might offer choices
  const strategicRules = faction.rules.filter((r) => r.type === 'strategic');
  const tacticalRules = faction.rules.filter((r) => r.type === 'tactical');

  // If no rules with choices, show a simple info message
  if (strategicRules.length === 0 && tacticalRules.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3>Faction Rules</h3>
        </div>
        <p className={styles.infoMessage}>
          This faction has no selectable rule options. All faction rules are
          always active.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Faction Rule Options</h3>
        <p className={styles.subtitle}>
          Select your faction-specific tactical choices
        </p>
      </div>

      {strategicRules.length > 0 && (
        <div className={styles.ruleCategory}>
          <h4>Strategic Options</h4>
          <p className={styles.categoryNote}>
            These options are available and you can choose to use them during
            the game.
          </p>
          <div className={styles.rulesList}>
            {strategicRules.map((rule) => (
              <div key={rule.id} className={styles.ruleItem}>
                <strong>{rule.name}</strong>
                <p>{rule.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tacticalRules.length > 0 && (
        <div className={styles.ruleCategory}>
          <h4>Tactical Options</h4>
          <p className={styles.categoryNote}>
            These tactical ploys are available during the game.
          </p>
          <div className={styles.rulesList}>
            {tacticalRules.map((rule) => (
              <div key={rule.id} className={styles.ruleItem}>
                <strong>{rule.name}</strong>
                <p>{rule.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
