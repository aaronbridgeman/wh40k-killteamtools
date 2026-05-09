import { FormEvent, useMemo, useState } from 'react';
import './SoloJointOpsView.css';

interface TrackedOperative {
  id: string;
  name: string;
  damageTaken: number;
  injured: boolean;
}

type ActivationSide = 'player' | 'npo';

const generateOperativeId = () =>
  `op-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function SoloJointOpsView() {
  const [playerTeamName, setPlayerTeamName] = useState('Player Kill Team');
  const [npoTeamName, setNpoTeamName] = useState('NPO Team');
  const [playerOperatives, setPlayerOperatives] = useState<TrackedOperative[]>(
    []
  );
  const [npoOperatives, setNpoOperatives] = useState<TrackedOperative[]>([]);
  const [playerInput, setPlayerInput] = useState('');
  const [npoInput, setNpoInput] = useState('');
  const [playerDeployed, setPlayerDeployed] = useState(false);
  const [npoDeployed, setNpoDeployed] = useState(false);
  const [initiative, setInitiative] = useState<ActivationSide>('player');
  const [turningPoint, setTurningPoint] = useState(1);
  const [activationNumber, setActivationNumber] = useState(0);
  const [activeSide, setActiveSide] = useState<ActivationSide>('player');

  const activeTeamLabel = useMemo(
    () => (activeSide === 'player' ? playerTeamName : npoTeamName),
    [activeSide, npoTeamName, playerTeamName]
  );

  const addOperative = (
    event: FormEvent,
    team: ActivationSide,
    operativeName: string
  ) => {
    event.preventDefault();
    const normalizedName = operativeName.trim();
    if (!normalizedName) return;

    const newOperative: TrackedOperative = {
      id: generateOperativeId(),
      name: normalizedName,
      damageTaken: 0,
      injured: false,
    };

    if (team === 'player') {
      setPlayerOperatives((prev) => [...prev, newOperative]);
      setPlayerInput('');
      return;
    }

    setNpoOperatives((prev) => [...prev, newOperative]);
    setNpoInput('');
  };

  const removeOperative = (team: ActivationSide, operativeId: string) => {
    if (team === 'player') {
      setPlayerOperatives((prev) => prev.filter((op) => op.id !== operativeId));
      return;
    }
    setNpoOperatives((prev) => prev.filter((op) => op.id !== operativeId));
  };

  const updateNpoOperative = (
    operativeId: string,
    updates: Partial<TrackedOperative>
  ) => {
    setNpoOperatives((prev) =>
      prev.map((operative) =>
        operative.id === operativeId ? { ...operative, ...updates } : operative
      )
    );
  };

  const startActivationSequence = () => {
    setActivationNumber(1);
    setActiveSide(initiative);
  };

  const nextActivation = () => {
    setActivationNumber((prev) => prev + 1);
    setActiveSide((prev) => (prev === 'player' ? 'npo' : 'player'));
  };

  const nextTurningPoint = () => {
    setTurningPoint((prev) => prev + 1);
    setActivationNumber(0);
    setActiveSide(initiative);
  };

  return (
    <div className="solo-joint-ops-view">
      <header>
        <h2>Solo / Joint Ops (Initial Implementation)</h2>
        <p>
          Starter tools for list building, deployment, and activation flow
          against NPO operatives.
        </p>
      </header>

      <section className="solo-card">
        <h3>List Builder</h3>
        <div className="team-builders">
          <form
            onSubmit={(event) => addOperative(event, 'player', playerInput)}
            className="team-builder"
          >
            <label htmlFor="player-team-name">Player Team Name</label>
            <input
              id="player-team-name"
              value={playerTeamName}
              onChange={(event) => setPlayerTeamName(event.target.value)}
            />
            <label htmlFor="player-operative-input">Add Operative</label>
            <div className="input-row">
              <input
                id="player-operative-input"
                value={playerInput}
                onChange={(event) => setPlayerInput(event.target.value)}
                placeholder="e.g. Intercessor Sergeant"
              />
              <button type="submit">Add Player Operative</button>
            </div>
            <ul>
              {playerOperatives.map((operative) => (
                <li key={operative.id}>
                  <span>{operative.name}</span>
                  <button
                    type="button"
                    onClick={() => removeOperative('player', operative.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </form>

          <form
            onSubmit={(event) => addOperative(event, 'npo', npoInput)}
            className="team-builder"
          >
            <label htmlFor="npo-team-name">NPO Team Name</label>
            <input
              id="npo-team-name"
              value={npoTeamName}
              onChange={(event) => setNpoTeamName(event.target.value)}
            />
            <label htmlFor="npo-operative-input">Add NPO Operative</label>
            <div className="input-row">
              <input
                id="npo-operative-input"
                value={npoInput}
                onChange={(event) => setNpoInput(event.target.value)}
                placeholder="e.g. Rebel Trooper"
              />
              <button type="submit">Add NPO Operative</button>
            </div>
            <ul>
              {npoOperatives.map((operative) => (
                <li key={operative.id}>
                  <span>{operative.name}</span>
                  <button
                    type="button"
                    onClick={() => removeOperative('npo', operative.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </form>
        </div>
      </section>

      <section className="solo-card">
        <h3>Deployment</h3>
        <div className="deployment-grid">
          <label>
            <input
              type="checkbox"
              checked={playerDeployed}
              onChange={(event) => setPlayerDeployed(event.target.checked)}
            />
            {playerTeamName} Deployed
          </label>
          <label>
            <input
              type="checkbox"
              checked={npoDeployed}
              onChange={(event) => setNpoDeployed(event.target.checked)}
            />
            {npoTeamName} Deployed
          </label>
        </div>
      </section>

      <section className="solo-card">
        <h3>Activation</h3>
        <div className="activation-controls">
          <label htmlFor="initiative-side">Initiative</label>
          <select
            id="initiative-side"
            value={initiative}
            onChange={(event) =>
              setInitiative(event.target.value as ActivationSide)
            }
          >
            <option value="player">{playerTeamName}</option>
            <option value="npo">{npoTeamName}</option>
          </select>
          <button type="button" onClick={startActivationSequence}>
            Start Activations
          </button>
          <button
            type="button"
            onClick={nextActivation}
            disabled={activationNumber === 0}
          >
            Next Activation
          </button>
          <button type="button" onClick={nextTurningPoint}>
            Next Turning Point
          </button>
        </div>
        <p aria-live="polite" className="activation-status">
          Turning Point {turningPoint} · Activation {activationNumber} · Active:{' '}
          {activeTeamLabel}
        </p>
      </section>

      <section className="solo-card">
        <h3>NPO Datacards (Starter)</h3>
        {npoOperatives.length === 0 ? (
          <p>Add NPO operatives in the list builder to manage them here.</p>
        ) : (
          <div className="npo-cards">
            {npoOperatives.map((operative) => (
              <article className="npo-card" key={operative.id}>
                <h4>{operative.name}</h4>
                <p>Damage Taken: {operative.damageTaken}</p>
                <div className="input-row">
                  <button
                    type="button"
                    onClick={() =>
                      updateNpoOperative(operative.id, {
                        damageTaken: Math.max(0, operative.damageTaken - 1),
                      })
                    }
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateNpoOperative(operative.id, {
                        damageTaken: operative.damageTaken + 1,
                      })
                    }
                  >
                    +1
                  </button>
                </div>
                <label>
                  <input
                    type="checkbox"
                    checked={operative.injured}
                    onChange={(event) =>
                      updateNpoOperative(operative.id, {
                        injured: event.target.checked,
                      })
                    }
                  />
                  Injured
                </label>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
