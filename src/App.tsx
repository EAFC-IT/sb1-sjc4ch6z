import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Items } from './pages/Items';
import { ItemDetails } from './pages/ItemDetails';
import { Professeurs } from './pages/Professeurs';
import { ProfesseurDetails } from './pages/ProfesseurDetails';
import { Sections } from './pages/Sections';
import { ScanItem } from './pages/ScanItem';
import { ConnectionStatus } from './components/ConnectionStatus';

// Context pour le thème
export const ThemeContext = React.createContext({
  isDarkMode: false,
  toggleDarkMode: () => {}
});

export function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/items" element={<Items />} />
            <Route path="/items/:id" element={<ItemDetails />} />
            <Route path="/professeurs" element={<Professeurs />} />
            <Route path="/professeurs/:id" element={<ProfesseurDetails />} />
            <Route path="/sections" element={<Sections />} />
            <Route path="/scan" element={<ScanItem />} />
          </Routes>
          <ConnectionStatus />
        </Layout>
      </Router>
    </ThemeContext.Provider>
  );
}