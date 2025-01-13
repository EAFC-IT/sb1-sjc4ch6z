import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Library, Users, Home as HomeIcon, QrCode, BookOpen, Sun, Moon } from 'lucide-react';
import { ThemeContext } from '../App';

export function Layout({ children }: { children: React.ReactNode }) {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <nav className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link 
                to="/" 
                className={`flex items-center px-2 py-2 ${
                  isDarkMode ? 'text-white hover:text-primary-300' : 'text-gray-900 hover:text-primary-600'
                }`}
              >
                <Library className="h-6 w-6 mr-2" />
                <span className="font-semibold">Médiathèque EAFC-Uccle</span>
              </Link>
              <div className="ml-6 flex space-x-4">
                <Link
                  to="/items"
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                    isDarkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  } rounded-md transition-colors`}
                >
                  <HomeIcon className="h-4 w-4 mr-2" />
                  Items
                </Link>
                <Link
                  to="/professeurs"
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                    isDarkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  } rounded-md transition-colors`}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Professeurs
                </Link>
                <Link
                  to="/sections"
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                    isDarkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  } rounded-md transition-colors`}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Sections
                </Link>
                <Link
                  to="/scan"
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                    isDarkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  } rounded-md transition-colors`}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Scanner
                </Link>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${
                isDarkMode 
                  ? 'text-yellow-300 hover:text-yellow-200 hover:bg-gray-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              } transition-colors`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}