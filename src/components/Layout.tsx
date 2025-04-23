import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Github as GitHub, Moon, Sun } from 'lucide-react';

export default function Layout() {
  const [darkMode, setDarkMode] = React.useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
      <main className="flex-1 container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center space-x-2">
            <GitHub size={20} className="text-primary" />
            <span className="font-medium">GitHub Action Monitor</span>
          </div>
          <div className="mt-4 sm:mt-0 text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} GitHub Action Monitor. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}