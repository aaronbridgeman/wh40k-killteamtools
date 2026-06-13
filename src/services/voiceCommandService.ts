import { useState, useEffect } from 'react';

// Define the available voice commands
const COMMANDS = ['reset', 'next', 'show card', 'add wound', 'remove wound'];

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  [index: number]: SpeechRecognitionAlternativeLike;
  length: number;
}

interface SpeechRecognitionResultListLike {
  [index: number]: SpeechRecognitionResultLike;
  length: number;
}

interface SpeechRecognitionEventLike extends Event {
  results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: SpeechRecognitionLike, event: Event) => void) | null;
  onend: ((this: SpeechRecognitionLike, event: Event) => void) | null;
  onerror: ((this: SpeechRecognitionLike, event: Event) => void) | null;
  onresult:
    | ((this: SpeechRecognitionLike, event: SpeechRecognitionEventLike) => void)
    | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructorLike {
  new (): SpeechRecognitionLike;
}

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
  }
}

export function useVoiceCommands(
  onCommand: (command: string, args?: string) => void
) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognitionLike | null>(
    null
  );

  useEffect(() => {
    const SpeechRecognitionCtor = window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      console.error('Web Speech API not supported in this browser.');
      return;
    }

    const speechRecognition = new SpeechRecognitionCtor();
    speechRecognition.continuous = true;
    speechRecognition.interimResults = false;
    speechRecognition.lang = 'en-US';

    speechRecognition.onstart = () => setIsListening(true);
    speechRecognition.onend = () => setIsListening(false);
    speechRecognition.onerror = (event: Event) =>
      console.error('Speech recognition error:', event);

    speechRecognition.onresult = (event: SpeechRecognitionEventLike) => {
      const lastResult = event.results[event.results.length - 1];
      const transcript = lastResult?.[0]?.transcript?.trim().toLowerCase();
      if (!transcript) {
        return;
      }
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
