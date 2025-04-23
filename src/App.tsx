import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import CreateProject from './pages/CreateProject';
import { SettingsProvider } from './contexts/SettingsContext';
import SettingsDialog from './components/SettingsDialog';
import { useSettings } from './contexts/SettingsContext';

function AppContent() {
  const { isConfigured, isInitialized } = useSettings();
  const [showSettings, setShowSettings] = useState(!isConfigured);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showSettings) {
    return <SettingsDialog onConfigured={() => setShowSettings(false)} />;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Projects />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/new" element={<CreateProject />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

export default App;