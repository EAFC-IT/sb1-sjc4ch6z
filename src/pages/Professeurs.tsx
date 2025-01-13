import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User, Mail, BookOpen, Search, Plus, X, Upload } from 'lucide-react';
import { debounce } from 'lodash';

type Professeur = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  emprunts_en_cours: number;
};

type NewProfesseur = {
  nom: string;
  prenom: string;
  email: string;
};

export function Professeurs() {
  const [professeurs, setProfesseurs] = useState<Professeur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProfesseur, setNewProfesseur] = useState<NewProfesseur>({
    nom: '',
    prenom: '',
    email: ''
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const debouncedSetSearch = useCallback(
    debounce((query: string) => {
      setDebouncedSearchQuery(query);
    }, 800),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSetSearch(value);
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csvText = event.target?.result as string;
        const lines = csvText.split('\n');
        
        // Skip empty lines and remove any BOM character
        const nonEmptyLines = lines.filter(line => line.trim()).map(line => 
          line.replace(/^\uFEFF/, '')
        );
        
        if (nonEmptyLines.length === 0) {
          setFormError('Le fichier CSV est vide');
          return;
        }

        // Get headers and normalize them
        const headers = nonEmptyLines[0].split(',').map(h => 
          h.trim().toLowerCase()
        );

        // Verify required columns exist
        const requiredColumns = ['nom', 'prenom', 'email'];
        const missingColumns = requiredColumns.filter(col => 
          !headers.includes(col)
        );

        if (missingColumns.length > 0) {
          setFormError(`Colonnes manquantes dans le CSV: ${missingColumns.join(', ')}`);
          return;
        }

        // Get column indices
        const nomIndex = headers.indexOf('nom');
        const prenomIndex = headers.indexOf('prenom');
        const emailIndex = headers.indexOf('email');

        // Process each line
        const professeurs = [];
        const errors = [];

        for (let i = 1; i < nonEmptyLines.length; i++) {
          const values = nonEmptyLines[i].split(',').map(v => v.trim());
          
          if (values.length !== headers.length) {
            errors.push(`Ligne ${i + 1}: nombre de colonnes incorrect`);
            continue;
          }

          const professeur = {
            nom: values[nomIndex],
            prenom: values[prenomIndex],
            email: values[emailIndex]
          };

          // Basic validation
          if (!professeur.nom || !professeur.prenom || !professeur.email) {
            errors.push(`Ligne ${i + 1}: champs obligatoires manquants`);
            continue;
          }

          if (!professeur.email.includes('@')) {
            errors.push(`Ligne ${i + 1}: adresse email invalide`);
            continue;
          }

          professeurs.push(professeur);
        }

        if (errors.length > 0) {
          setFormError(`Erreurs dans le fichier CSV:\n${errors.join('\n')}`);
          return;
        }

        // Insert all professors
        const { error: insertError } = await supabase
          .from('professeurs')
          .insert(professeurs);

        if (insertError) {
          if (insertError.code === '23505') {
            setFormError('Certaines adresses email sont déjà utilisées');
          } else {
            setFormError('Une erreur est survenue lors de l\'import');
          }
          return;
        }

        setImportSuccess(`${professeurs.length} professeurs importés avec succès`);
        loadProfesseurs();
        
        // Reset file input
        e.target.value = '';
      } catch (err) {
        setFormError('Erreur lors de la lecture du fichier CSV');
      }
    };

    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setImportSuccess(null);

    // Validation basique
    if (!newProfesseur.nom || !newProfesseur.prenom || !newProfesseur.email) {
      setFormError('Tous les champs sont obligatoires');
      return;
    }

    if (!newProfesseur.email.includes('@')) {
      setFormError('Adresse email invalide');
      return;
    }

    const { error } = await supabase
      .from('professeurs')
      .insert([newProfesseur]);

    if (error) {
      if (error.code === '23505') {
        setFormError('Cette adresse email est déjà utilisée');
      } else {
        setFormError('Une erreur est survenue lors de la création du professeur');
      }
      return;
    }

    // Réinitialiser le formulaire et fermer le modal
    setNewProfesseur({
      nom: '',
      prenom: '',
      email: ''
    });
    setShowAddModal(false);
    loadProfesseurs();
  };

  async function loadProfesseurs() {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('professeurs')
        .select(`
          *,
          emprunts!inner (
            count
          )
        `, { count: 'exact' })
        .eq('emprunts.status', 'en_cours');

      if (debouncedSearchQuery) {
        query = query.or(`nom.ilike.%${debouncedSearchQuery}%,prenom.ilike.%${debouncedSearchQuery}%,email.ilike.%${debouncedSearchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const professeursWithCount = data?.map(prof => ({
        ...prof,
        emprunts_en_cours: prof.emprunts[0]?.count || 0
      }));

      setProfesseurs(professeursWithCount || []);
    } catch (err) {
      console.error('Error loading professeurs:', err);
      setError('Une erreur est survenue lors du chargement des professeurs');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfesseurs();
  }, [debouncedSearchQuery]);

  if (loading && !professeurs.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Chargement des professeurs...</div>
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
          <h1 className="text-2xl font-bold text-gray-900">Liste des Professeurs</h1>
          <p className="mt-2 text-gray-600">
            {professeurs.length} professeurs enregistrés
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Ajouter un professeur
        </button>
      </div>

      {/* Modal d'ajout de professeur */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Ajouter un professeur</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md whitespace-pre-line">
                {formError}
              </div>
            )}

            {importSuccess && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
                {importSuccess}
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-medium mb-2">Import CSV</h3>
              <div className="space-y-2">
                <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Upload className="h-5 w-5 mr-2" />
                  Importer un fichier CSV
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleCSVUpload}
                  />
                </label>
                <p className="text-sm text-gray-500">
                  Format attendu: nom,prenom,email
                </p>
              </div>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">ou ajouter manuellement</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">
                  Prénom
                </label>
                <input
                  type="text"
                  id="prenom"
                  value={newProfesseur.prenom}
                  onChange={(e) => setNewProfesseur({...newProfesseur, prenom: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <input
                  type="text"
                  id="nom"
                  value={newProfesseur.nom}
                  onChange={(e) => setNewProfesseur({...newProfesseur, nom: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Adresse email
                </label>
                <input
                  type="email"
                  id="email"
                  value={newProfesseur.email}
                  onChange={(e) => setNewProfesseur({...newProfesseur, email: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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

      <div className="mb-6 relative">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un professeur..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {professeurs.length === 0 ? (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-yellow-700">Aucun professeur trouvé dans la base de données.</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {professeurs.map((professeur) => (
              <li key={professeur.id}>
                <Link
                  to={`/professeurs/${professeur.id}`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-indigo-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-lg font-medium text-gray-900">
                            {professeur.prenom} {professeur.nom}
                          </div>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <Mail className="h-4 w-4 mr-1" />
                            {professeur.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="flex items-center text-sm text-gray-500">
                          <BookOpen className="h-4 w-4 mr-1" />
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {professeur.emprunts_en_cours} emprunt{professeur.emprunts_en_cours > 1 ? 's' : ''} en cours
                          </span>
                        </div>
                        <svg className="h-5 w-5 text-gray-400 ml-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}