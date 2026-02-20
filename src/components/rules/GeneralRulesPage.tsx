/**
 * General Rules Reference Page Component
 * Displays all general game rules organized by category with easy navigation
 */

import { useState } from 'react';
import { getGeneralRules } from '@/services/rulesDataService';
import styles from './GeneralRulesPage.module.css';

export function GeneralRulesPage() {
  const categories = getGeneralRules();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>General Rules Reference</h2>
        <p className={styles.subtitle}>
          Complete reference for Kill Team game rules - click categories to jump
          to sections
        </p>
      </div>

      {/* Category Navigation */}
      <nav className={styles.categoryNav}>
        {categories.map((category) => (
          <button
            key={category.category}
            className={`${styles.categoryButton} ${
              activeCategory === category.category ? styles.active : ''
            }`}
            onClick={() => {
              const element = document.getElementById(
                `category-${category.category}`
              );
              element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              setActiveCategory(category.category);
            }}
          >
            {category.category}
          </button>
        ))}
      </nav>

      {/* Categories with Rules */}
      {categories.map((category) => (
        <section
          key={category.category}
          id={`category-${category.category}`}
          className={styles.categorySection}
        >
          <h3 className={styles.categoryTitle}>{category.category}</h3>
          <div className={styles.rulesGrid}>
            {category.rules.map((rule) => (
              <div key={rule.name} className={styles.ruleCard}>
                <h4 className={styles.ruleName}>{rule.name}</h4>
                <p className={styles.ruleDescription}>{rule.description}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
