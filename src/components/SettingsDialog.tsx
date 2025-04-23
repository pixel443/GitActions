import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { AlertTriangle, Check } from 'lucide-react';
import toast from 'react-hot-toast';

type SettingsDialogProps = {
  onConfigured: () => void;
};

export default function SettingsDialog({ onConfigured }: SettingsDialogProps) {
  const { settings: savedSettings, saveSettings } = useSettings();
  const [supabaseUrl, setSupabaseUrl] = useState(savedSettings?.supabaseUrl || import.meta.env.VITE_SUPABASE_URL || '');
  const [supabaseKey, setSupabaseKey] = useState(savedSettings?.supabaseKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '');
  const [githubToken, setGithubToken] = useState(savedSettings?.githubToken || import.meta.env.VITE_GITHUB_TOKEN || '');
  const [ngrokToken, setNgrokToken] = useState(savedSettings?.ngrokToken || import.meta.env.VITE_NGROK_AUTH_TOKEN || '');
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    try {
      // Test Supabase connection
      const supabaseResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      });
      
      if (!supabaseResponse.ok) {
        throw new Error('Invalid Supabase credentials');
      }

      // Test GitHub token
      const githubResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${githubToken}`,
        },
      });

      if (!githubResponse.ok) {
        throw new Error('Invalid GitHub token');
      }

      // Save settings
      saveSettings({
        supabaseUrl,
        supabaseKey,
        githubToken,
        ngrokToken,
      });

      toast.success('Configuration successful!');
      onConfigured();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Configuration test failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6 space-y-6">
        <div className="flex items-center space-x-2 text-warning">
          <AlertTriangle size={24} />
          <h2 className="text-xl font-semibold">Configuration Required</h2>
        </div>

        <p className="text-gray-600 dark:text-gray-400">
          Please provide your API credentials to continue.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Supabase URL
            </label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="form-input"
              placeholder="https://your-project.supabase.co"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Supabase Anon Key
            </label>
            <input
              type="password"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="form-input"
              placeholder="your-supabase-anon-key"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              GitHub Personal Access Token
            </label>
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              className="form-input"
              placeholder="ghp_your-github-token"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ngrok Auth Token
            </label>
            <input
              type="password"
              value={ngrokToken}
              onChange={(e) => setNgrokToken(e.target.value)}
              className="form-input"
              placeholder="your-ngrok-token"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={testConnection}
            disabled={testing || !supabaseUrl || !supabaseKey || !githubToken || !ngrokToken}
            className="btn-primary w-full flex items-center justify-center"
          >
            {testing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                Testing Connection...
              </>
            ) : (
              <>
                <Check size={18} className="mr-2" />
                Save & Test Configuration
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}