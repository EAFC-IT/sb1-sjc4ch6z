import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Library, Users, BookOpen, Film, Music, Wrench, Gamepad2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ThemeContext } from '../App';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type Stats = {
  totalItems: number;
  totalEmprunts: number;
  totalProfesseurs: number;
  itemsParCategorie: Record<string, number>;
  empruntsParMois: Record<string, number>;
  itemsDisponibles: number;
  itemsEmpruntes: number;
};

export function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    async function loadStats() {
      try {
        const [itemsResult, empruntsResult, professeursResult, categoriesResult] = await Promise.all([
          supabase.from('items').select('*'),
          supabase.from('emprunts').select('*'),
          supabase.from('professeurs').select('*'),
          supabase.from('items').select('categories(nom), quantite_totale, quantite_disponible')
        ]);

        const itemsParCategorie: Record<string, number> = {};
        const empruntsParMois: Record<string, number> = {};
        
        // Calculer les items par catégorie
        categoriesResult.data?.forEach((item: any) => {
          const categorie = item.categories.nom;
          itemsParCategorie[categorie] = (itemsParCategorie[categorie] || 0) + item.quantite_totale;
        });

        // Calculer les emprunts par mois
        empruntsResult.data?.forEach((emprunt) => {
          const date = new Date(emprunt.date_emprunt);
          const moisAnnee = `${date.getMonth() + 1}/${date.getFullYear()}`;
          empruntsParMois[moisAnnee] = (empruntsParMois[moisAnnee] || 0) + 1;
        });

        const itemsDisponibles = categoriesResult.data?.reduce((acc, item) => acc + item.quantite_disponible, 0) || 0;
        const itemsTotal = categoriesResult.data?.reduce((acc, item) => acc + item.quantite_totale, 0) || 0;

        setStats({
          totalItems: itemsResult.data?.length || 0,
          totalEmprunts: empruntsResult.data?.length || 0,
          totalProfesseurs: professeursResult.data?.length || 0,
          itemsParCategorie,
          empruntsParMois,
          itemsDisponibles,
          itemsEmpruntes: itemsTotal - itemsDisponibles
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: isDarkMode ? '#fff' : '#000'
        }
      }
    },
    scales: {
      y: {
        ticks: {
          color: isDarkMode ? '#fff' : '#000'
        }
      },
      x: {
        ticks: {
          color: isDarkMode ? '#fff' : '#000'
        }
      }
    }
  };

  const pieChartData = {
    labels: ['Disponibles', 'Empruntés'],
    datasets: [
      {
        data: [stats?.itemsDisponibles || 0, stats?.itemsEmpruntes || 0],
        backgroundColor: ['#4ade80', '#f87171'],
        borderColor: ['#22c55e', '#ef4444'],
        borderWidth: 1,
      },
    ],
  };

  const barChartData = {
    labels: Object.keys(stats?.itemsParCategorie || {}),
    datasets: [
      {
        label: 'Nombre d\'items',
        data: Object.values(stats?.itemsParCategorie || {}),
        backgroundColor: '#60a5fa',
        borderColor: '#3b82f6',
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Chargement des statistiques...
        </div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'text-white' : 'text-gray-900'}>
      <div className={`bg-${isDarkMode ? 'gray-800' : 'white'} rounded-lg shadow-sm p-6 mb-8`}>
        <h1 className="text-3xl font-bold mb-4">
          Bienvenue dans la Médiathèque EAFC-Uccle
        </h1>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
          Gérez facilement vos ressources pédagogiques et suivez les emprunts des professeurs.
        </p>

        {/* Actions rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/items"
            className={`flex flex-col items-center p-4 rounded-lg ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-gray-50 hover:bg-gray-100'
            } transition-colors`}
          >
            <Library className="h-8 w-8 text-blue-500 mb-2" />
            <span>Gérer les items</span>
          </Link>
          <Link
            to="/professeurs"
            className={`flex flex-col items-center p-4 rounded-lg ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-gray-50 hover:bg-gray-100'
            } transition-colors`}
          >
            <Users className="h-8 w-8 text-purple-500 mb-2" />
            <span>Gérer les professeurs</span>
          </Link>
          <Link
            to="/scan"
            className={`flex flex-col items-center p-4 rounded-lg ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-gray-50 hover:bg-gray-100'
            } transition-colors`}
          >
            <BookOpen className="h-8 w-8 text-green-500 mb-2" />
            <span>Scanner un item</span>
          </Link>
          <Link
            to="/sections"
            className={`flex flex-col items-center p-4 rounded-lg ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-gray-50 hover:bg-gray-100'
            } transition-colors`}
          >
            <Gamepad2 className="h-8 w-8 text-red-500 mb-2" />
            <span>Gérer les sections</span>
          </Link>
        </div>
      </div>

      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`bg-${isDarkMode ? 'gray-800' : 'white'} rounded-lg shadow-sm p-6`}>
          <div className="flex items-center">
            <Library className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Total des items</p>
              <p className="text-2xl font-semibold">{stats?.totalItems}</p>
            </div>
          </div>
        </div>
        <div className={`bg-${isDarkMode ? 'gray-800' : 'white'} rounded-lg shadow-sm p-6`}>
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Emprunts totaux</p>
              <p className="text-2xl font-semibold">{stats?.totalEmprunts}</p>
            </div>
          </div>
        </div>
        <div className={`bg-${isDarkMode ? 'gray-800' : 'white'} rounded-lg shadow-sm p-6`}>
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Professeurs actifs</p>
              <p className="text-2xl font-semibold">{stats?.totalProfesseurs}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className={`bg-${isDarkMode ? 'gray-800' : 'white'} rounded-lg shadow-sm p-6`}>
          <h2 className="text-xl font-semibold mb-4">Distribution par catégorie</h2>
          <Bar options={chartOptions} data={barChartData} />
        </div>
        <div className={`bg-${isDarkMode ? 'gray-800' : 'white'} rounded-lg shadow-sm p-6`}>
          <h2 className="text-xl font-semibold mb-4">État des items</h2>
          <Pie data={pieChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}