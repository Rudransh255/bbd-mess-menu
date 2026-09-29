'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('install-prompt-dismissed') || window.matchMedia('(display-mode: standalone)').matches) return;

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const iosTimer = isIos ? window.setTimeout(() => setShowIosHelp(true), 0) : undefined;

    const handleInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handleInstall);
    return () => {
      if (iosTimer) window.clearTimeout(iosTimer);
      window.removeEventListener('beforeinstallprompt', handleInstall);
    };
  }, []);

  if (!installEvent && !showIosHelp) return null;

  const dismiss = () => {
    sessionStorage.setItem('install-prompt-dismissed', 'true');
    setInstallEvent(null);
    setShowIosHelp(false);
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    dismiss();
  };

  return <aside className="install-prompt" aria-label="Install BBD Mess">
    <div><strong>ADD BBD MESS TO YOUR HOME SCREEN</strong><p>{showIosHelp ? 'On iPhone, open this site in Safari. Tap Share, then Add to Home Screen.' : 'Open the daily menu quickly, just like an app.'}</p></div>
    {installEvent && <button className="primary-button" type="button" onClick={install}>ADD NOW</button>}
    <button className="install-dismiss" type="button" onClick={dismiss} aria-label="Dismiss install prompt">×</button>
  </aside>;
}
