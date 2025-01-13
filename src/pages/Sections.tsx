import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BookOpen, Plus, X } from 'lucide-react';

type Section = {
  id: string;
  nom: string;
};

export function Sections() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSection, setNewSection] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  async function loadSections() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .order('nom');

      if (error) throw error;

      setSections(data || []);
    } catch (err) {
      console.error('Error loading sections:', err);
      setError('Une erreur est survenue lors du chargement des sections');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSections();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newSection.trim()) {
      setFormError('Le nom de la section est requis');
      return;
    }

    try {
      const { error } = await supabase
        .from('sections')
        .insert([{ nom: newSection.trim() }]);

      if (error) {
        if (error.code === '23505') {
          setFormError('Cette section existe déjà');
        } else {
          setFormError('Une erreur est survenue lors de la création de la section');
        }
        return;
      }

      setNewSection('');
      setShowAddModal(false);
      loadSections();
    } catch (err) {
      setFormError('Une erreur est survenue');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Chargement des sections...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-700">Erreur: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Liste des Sections</h1>
          <p className="mt-2 text-gray-600">
            {sections.length} sections disponibles
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Ajouter une section
        </button>
      </div>

      {/* Modal d'ajout de section */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Ajouter une section</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                  Nom de la section
                </label>
                <input
                  type="text"
                  id="nom"
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Ex: Français"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {sections.map((section) => (
            <li key={section.id}>
              <div className="px-6 py-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-lg font-medium text-gray-900">
                      {section.nom}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}