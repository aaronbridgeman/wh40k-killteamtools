import { useState } from 'react';
import { FactionSelector } from './components/faction/FactionSelector';
import { FactionDetails } from './components/faction/FactionDetails';
import { OperativeCard } from './components/datacard/OperativeCard';
import { loadFaction, FactionId } from './services/dataLoader';
import { Faction } from './types';
import './App.css';

function App() {
  const [selectedFactionId, setSelectedFactionId] = useState<
    FactionId | undefined
  >();
  const [faction, setFaction] = useState<Faction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFactionSelect = async (factionId: FactionId) => {
    setSelectedFactionId(factionId);
    setLoading(true);
    setError(null);

    try {
      const loadedFaction = await loadFaction(factionId);
      setFaction(loadedFaction);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setFaction(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Kill Team Dataslate</h1>
        <p className="subtitle">Warhammer 40,000 Kill Team Reference Tool</p>
      </header>

      <main className="app-main">
        <FactionSelector
          selectedFactionId={selectedFactionId}
          onFactionSelect={handleFactionSelect}
        />

        {loading && <div className="loading">Loading faction data...</div>}

        {error && <div className="error">Error: {error}</div>}

        {faction && (
          <>
            <FactionDetails faction={faction} />

            {faction.operatives.length > 0 ? (
              <section className="operatives-section">
                <h2>Operatives</h2>
                <div className="operatives-grid">
                  {faction.operatives.map((operative) => (
                    <OperativeCard key={operative.id} operative={operative} />
                  ))}
                </div>
              </section>
            ) : (
              <div className="info-message">
                No operative data available yet. Operative datacards will be
                added in future updates.
              </div>
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>
          This is an unofficial fan-made tool. Warhammer 40,000 and Kill Team
          are registered trademarks of Games Workshop Ltd.
        </p>
      </footer>
    </div>
  );
}

export default App;
