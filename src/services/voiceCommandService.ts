import { useState, useEffect } from 'react';

// Define the available voice commands
const COMMANDS = ["reset", "next", "show card", "add wound", "remove wound"];

export function useVoiceCommands(onCommand: (command: string, args?: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      console.error('Web Speech API not supported in this browser.');
      return;
    }

    const speechRecognition = new webkitSpeechRecognition();
    speechRecognition.continuous = true;
    speechRecognition.interimResults = false;
    speechRecognition.lang = 'en-US';

    speechRecognition.onstart = () => setIsListening(true);
    speechRecognition.onend = () => setIsListening(false);
    speechRecognition.onerror = (event) => console.error('Speech recognition error:', event);

    speechRecognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      console.log('Recognized:', transcript);

      for (const command of COMMANDS) {
        if (transcript.startsWith(command)) {
          const args = transcript.slice(command.length).trim();
          onCommand(command, args);
          break;
        }
      }
    };

    setRecognition(speechRecognition);
  }, [onCommand]);

  const startListening = () => {
    if (recognition && !isListening) {
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  return { isListening, startListening, stopListening };
}