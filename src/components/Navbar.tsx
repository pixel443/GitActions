import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Github as GitHub, LogOut, Menu, Moon, Plus, Sun, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type NavbarProps = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

export default function Navbar({ darkMode, toggleDarkMode }: NavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <GitHub size={24} className="text-primary" />
              <span className="ml-2 text-xl font-bold">Action Monitor</span>
            </Link>
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                <Link
                  to="/projects"
                  className="px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 
                             hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Projects
                </Link>
                <Link
                  to="/projects/new"
                  className="px-3 py-2 text-sm font-medium rounded-md bg-primary text-white 
                             hover:bg-primary-dark transition-colors flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  New Project
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 
                         dark:hover:text-gray-200 focus:outline-none transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {user && (
              <button
                onClick={handleSignOut}
                className="ml-4 p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 
                           dark:hover:text-gray-200 focus:outline-none transition-colors hidden sm:flex items-center"
              >
                <LogOut size={20} />
                <span className="ml-1">Sign Out</span>
              </button>
            )}
            <div className="sm:hidden ml-4">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 
                           dark:hover:text-gray-200 focus:outline-none transition-colors"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>
      {isOpen && user && (
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/projects"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Projects
            </Link>
            <Link
              to="/projects/new"
              className="block px-3 py-2 rounded-md text-base font-medium bg-primary text-white 
                         hover:bg-primary-dark transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Plus size={16} className="inline mr-1" />
              New Project
            </Link>
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 
                         dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <LogOut size={16} className="inline mr-1" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}