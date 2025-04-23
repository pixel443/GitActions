import React, { createContext, useContext, useState, useEffect } from 'react';
import { initSupabase } from '../lib/supabase';
import { loadEnvConfig } from '../lib/env';

type Settings = {
  supabaseUrl: string;
  supabaseKey: string;
  githubToken: string;
  ngrokToken: string;
};

type SettingsContextType = {
  settings: Settings | null;
  isConfigured: boolean;
  saveSettings: (settings: Settings) => void;
  isInitialized: boolean;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(() => {
    const env = loadEnvConfig();
    if (env) {
      return {
        supabaseUrl: env.VITE_SUPABASE_URL,
        supabaseKey: env.VITE_SUPABASE_ANON_KEY,
        githubToken: env.VITE_GITHUB_TOKEN,
        ngrokToken: env.VITE_NGROK_AUTH_TOKEN,
      };
    }
    return null;
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (settings?.supabaseUrl && settings?.supabaseKey) {
      initSupabase(settings.supabaseUrl, settings.supabaseKey);
    }
    setIsInitialized(true);
  }, [settings?.supabaseUrl, settings?.supabaseKey]);

  const isConfigured = Boolean(settings?.supabaseUrl && settings?.supabaseKey && 
                             settings?.githubToken && settings?.ngrokToken);

  const saveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    initSupabase(newSettings.supabaseUrl, newSettings.supabaseKey);
  };

  return (
    <SettingsContext.Provider value={{ settings, isConfigured, saveSettings, isInitialized }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}