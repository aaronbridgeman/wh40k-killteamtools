/**
 * usePwaInstall — custom hook for PWA installation prompt.
 *
 * Listens for the `beforeinstallprompt` event emitted by Chromium-based
 * browsers (Chrome, Edge, Android Chrome) when PWA install criteria are met.
 * Exposes a prompt function so the UI can trigger the native install dialog.
 *
 * Also detects iOS devices where `beforeinstallprompt` is not supported;
 * callers can show manual "Add to Home Screen" instructions in that case.
 *
 * Returns nothing (and `canInstall` is false) when the app is already
 * running in standalone / installed mode.
 */

import { useState, useEffect, useMemo } from 'react';

/** The non-standard BeforeInstallPromptEvent emitted by Chromium browsers. */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PwaInstallState {
  /** True when the browser has surfaced an install prompt we can trigger. */
  canInstall: boolean;
  /** True when the app is already running in standalone (installed) mode. */
  isInstalled: boolean;
  /** True on iOS devices (Safari "Add to Home Screen" flow required). */
  isIos: boolean;
  /** Triggers the native browser install dialog. No-op if `canInstall` is false. */
  install: () => Promise<void>;
}

export function usePwaInstall(): PwaInstallState {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [isInstalled, setIsInstalled] = useState(
    () =>
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari sets navigator.standalone when running from home screen
      (navigator as Navigator & { standalone?: boolean }).standalone === true
  );

  const isIos = useMemo(
    () => /iphone|ipad|ipod/i.test(navigator.userAgent),
    []
  );

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setIsInstalled(true);
    }
    setInstallPrompt(null);
  };

  return {
    canInstall: !!installPrompt,
    isInstalled,
    isIos,
    install,
  };
}
