import React from 'react';
import styles from './VoiceIndicator.module.css';

interface VoiceIndicatorProps {
  isListening: boolean;
  onToggle: () => void;
}

export const VoiceIndicator: React.FC<VoiceIndicatorProps> = ({ isListening, onToggle }) => {
  return (
    <div className={styles.voiceIndicator}>
      <button onClick={onToggle} className={isListening ? styles.active : styles.inactive}>
        {isListening ? '🎙️ Listening...' : '🎤 Voice Off'}
      </button>
    </div>
  );
};