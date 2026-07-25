"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed (running in standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    // iOS doesn't support beforeinstallprompt — show manual instructions
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      // Show iOS prompt after a delay if not dismissed
      const dismissed = localStorage.getItem("pwa-ios-dismissed");
      if (!dismissed) {
        const timer = setTimeout(() => setShowPrompt(true), 3000);
        return () => clearTimeout(timer);
      }
      return;
    }

    // Android/Chrome — listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => {
      setInstalled(true);
      setShowPrompt(false);
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  async function handleInstall() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setInstalled(true);
      }
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  }

  function dismiss() {
    setShowPrompt(false);
    localStorage.setItem("pwa-ios-dismissed", "1");
  }

  if (installed || !showPrompt) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="card-dark p-4 flex items-center gap-3 max-w-sm shadow-[var(--shadow-lift)]">
        <div className="shrink-0 w-10 h-10 rounded-lg bg-sunburst-yellow/20 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F4C430" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="M7 10l5 5 5-5" />
            <path d="M12 15V3" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sandstone-cream text-sm">Add to your phone</p>
          <p className="text-xs text-sandstone-cream/60">
            {isIOS
              ? "Tap Share → Add to Home Screen"
              : "Install the app for quick access"}
          </p>
        </div>
        {!isIOS && (
          <button onClick={handleInstall} className="btn btn-primary btn-sm shrink-0">
            Install
          </button>
        )}
        <button onClick={dismiss} className="text-sandstone-cream/40 hover:text-sandstone-cream shrink-0" aria-label="Dismiss">
          ✕
        </button>
      </div>
    </div>
  );
}
