import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BookOpen, Film, Music, Wrench, Gamepad2, Search, Plus, Upload, Trash2, Edit, Tag } from 'lucide-react';
import { debounce } from 'lodash';

// Types
type Item = {
  id: string;
  titre: string;
  description: string;
  categorie_id: string;
  quantite_totale: number;
  quantite_disponible: number;
  categories: {
    nom: string;
  };
  sections?: {
    id: string;
    nom: string;
  }[];
};

type Category = {
  id: string;
  nom: string;
};

type Section = {
  id: string;
  nom: string;
};

type NewItem = {
  titre: string;
  description: string;
  categorie_id: string;
  quantite_totale: number;
  sections: string[];
};

type EditItem = {
  id: string;
  titre: string;
  description: string;
  categorie_id: string;
  quantite_totale: number;
  sections: string[];
};

type Professeur = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
};

export function Items() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [professeurs, setProfesseurs] = useState<Professeur[]>([]);
  const [professeursSearchQuery, setProfesseursSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [newItem, setNewItem] = useState<NewItem>({
    titre: '',
    description: '',
    categorie_id: '',
    quantite_totale: 1,
    sections: []
  });
  const [editItem, setEditItem] = useState<EditItem>({
    id: '',
    titre: '',
    description: '',
    categorie_id: '',
    quantite_totale: 1,
    sections: []
  });

  // Load categories and sections
  useEffect(() => {
    async function loadData() {
      const [categoriesResult, sectionsResult] = await Promise.all([
        supabase.from('categories').select('*').order('nom'),
        supabase.from('sections').select('*').order('nom')
      ]);

      if (categoriesResult.data) setCategories(categoriesResult.data);
      if (sectionsResult.data) setSections(sectionsResult.data);
    }
    loadData();
  }, []);

  // Load professeurs when search query changes
  useEffect(() => {
    async function loadProfesseurs() {
      const { data } = await supabase
        .from('professeurs')
        .select('*')
        .ilike('nom', `%${professeursSearchQuery}%`)
        .order('nom');
      if (data) setProfesseurs(data);
    }
    loadProfesseurs();
  }, [professeursSearchQuery]);

  const debouncedSetSearch = useCallback(
    debounce((query: string) => {
      setDebouncedSearchQuery(query);
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSetSearch(value);
  };

  const handleDelete = async (itemId: string) => {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId);
    
    if (!error) {
      setItems(items.filter(item => item.id !== itemId));
    }
  };

  const handleEdit = async (item: Item) => {
    // Charger les sections de l'item
    const { data: itemSections } = await supabase
      .from('items_sections')
      .select('section_id')
      .eq('item_id', item.id);

    setEditItem({
      id: item.id,
      titre: item.titre,
      description: item.description,
      categorie_id: item.categorie_id,
      quantite_totale: item.quantite_totale,
      sections: itemSections?.map(is => is.section_id) || []
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mise à jour de l'item
    const { error: itemError } = await supabase
      .from('items')
      .update({
        titre: editItem.titre,
        description: editItem.description,
        categorie_id: editItem.categorie_id,
        quantite_totale: editItem.quantite_totale
      })
      .eq('id', editItem.id);

    if (!itemError) {
      // Supprimer les anciennes sections
      await supabase
        .from('items_sections')
        .delete()
        .eq('item_id', editItem.id);

      // Ajouter les nouvelles sections
      if (editItem.sections.length > 0) {
        await supabase
          .from('items_sections')
          .insert(
            editItem.sections.map(sectionId => ({
              item_id: editItem.id,
              section_id: sectionId
            }))
          );
      }

      loadItems();
      setShowEditModal(false);
    }
  };

  const handleBorrow = async (professeurId: string) => {
    if (!selectedItemId) return;

    const { error } = await supabase.rpc('create_emprunt', {
      p_item_id: selectedItemId,
      p_professeur_id: professeurId
    });

    if (!error) {
      loadItems();
      setShowBorrowModal(false);
      setSelectedItemId(null);
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target?.result as string;
      const lines = csvText.split('\n');
      
      const headers = lines[0].split(',');
      
      const titleIndex = headers.findIndex(h => h.trim().toLowerCase() === 'titre');
      const descriptionIndex = headers.findIndex(h => h.trim().toLowerCase() === 'description');
      const categoryIndex = headers.findIndex(h => h.trim().toLowerCase() === 'categorie');
      const quantityIndex = headers.findIndex(h => h.trim().toLowerCase() === 'quantite');

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length < headers.length) continue;

        const category = categories.find(c => 
          c.nom.toLowerCase() === values[categoryIndex].trim().toLowerCase()
        );
        
        if (category) {
          await supabase.from('items').insert({
            titre: values[titleIndex].trim(),
            description: values[descriptionIndex].trim(),
            categorie_id: category.id,
            quantite_totale: parseInt(values[quantityIndex]) || 1,
            quantite_disponible: parseInt(values[quantityIndex]) || 1
          });
        }
      }
      
      loadItems();
      setShowAddModal(false);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Insérer le nouvel item
    const { data: newItemData, error: itemError } = await supabase
      .from('items')
      .insert({
        ...newItem,
        quantite_disponible: newItem.quantite_totale
      })
      .select()
      .single();

    if (!itemError && newItemData) {
      // Ajouter les sections si sélectionnées
      if (newItem.sections.length > 0) {
        await supabase
          .from('items_sections')
          .insert(
            newItem.sections.map(sectionId => ({
              item_id: newItemData.id,
              section_id: sectionId
            }))
          );
      }

      loadItems();
      setShowAddModal(false);
      setNewItem({
        titre: '',
        description: '',
        categorie_id: '',
        quantite_totale: 1,
        sections: []
      });
    }
  };

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('items')
        .select(`
          *,
          categories (
            nom
          ),
          items_sections (
            sections (
              id,
              nom
            )
          )
        `);

      if (debouncedSearchQuery) {
        query = query.ilike('titre', `%${debouncedSearchQuery}%`);
      }

      if (selectedCategories.length > 0) {
        query = query.in('categorie_id', selectedCategories);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transformer les données pour avoir un format plus simple
      let transformedData = data?.map(item => ({
        ...item,
        sections: item.items_sections?.map((is: any) => is.sections) || []
      })) || [];

      // Filter by sections if any are selected
      if (selectedSections.length > 0) {
        transformedData = transformedData.filter(item =>
          item.sections.some(section => selectedSections.includes(section.id))
        );
      }

      setItems(transformedData);
    } catch (err) {
      console.error('Error loading items:', err);
      setError('Une erreur est survenue lors du chargement des items');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, selectedCategories, selectedSections]);

  useEffect(() => {
    const channel = supabase
      .channel('items_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items'
        },
        () => {
          loadItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadItems]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'livre':
        return <BookOpen className="h-6 w-6" />;
      case 'dvd':
        return <Film className="h-6 w-6" />;
      case 'cd':
        return <Music className="h-6 w-6" />;
      case 'matériel':
        return <Wrench className="h-6 w-6" />;
      case 'jeu':
        return <Gamepad2 className="h-6 w-6" />;
      default:
        return <BookOpen className="h-6 w-6" />;
    }
  };

  if (loading && !items.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Chargement des items...</div>
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
          <h1 className="text-2xl font-bold text-gray-900">Catalogue des Items</h1>
          <p className="mt-2 text-gray-600">
            {items.length} items disponibles dans la médiathèque
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Ajouter un item
        </button>
      </div>

      <div className="mb-6 relative">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un item..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        {/* Filters */}
        <div className="mt-4 space-y-4">
          {/* Categories filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Catégories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategories(prev =>
                      prev.includes(category.id)
                        ? prev.filter(id => id !== category.id)
                        : [...prev, category.id]
                    );
                  }}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedCategories.includes(category.id)
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {getCategoryIcon(category.nom)}
                  <span className="ml-2">{category.nom}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sections filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Sections</h3>
            <div className="flex flex-wrap gap-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setSelectedSections(prev =>
                      prev.includes(section.id)
                        ? prev.filter(id => id !== section.id)
                        : [...prev, section.id]
                    );
                  }}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedSections.includes(section.id)
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  <Tag className="h-4 w-4 mr-2" />
                  {section.nom}
                </button>
              ))}
            </div>
          </div>

          {/* Clear filters */}
          {(selectedCategories.length > 0 || selectedSections.length > 0) && (
            <button
              onClick={() => {
                setSelectedCategories([]);
                setSelectedSections([]);
              }}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Effacer les filtres
            </button>
          )}
        </div>
      </div>

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Ajouter un nouvel item</h2>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Import CSV</h3>
              <div className="flex items-center space-x-2">
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
                <span className="text-sm text-gray-500">ou remplir manuellement</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Titre
                  </label>
                  <input
                    type="text"
                    required
                    value={newItem.titre}
                    onChange={(e) => setNewItem({...newItem, titre: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Catégorie
                  </label>
                  <select
                    required
                    value={newItem.categorie_id}
                    onChange={(e) => setNewItem({...newItem, categorie_id: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Sections
                  </label>
                  <div className="mt-2 space-y-2">
                    {sections.map((section) => (
                      <label key={section.id} className="inline-flex items-center mr-4">
                        <input
                          type="checkbox"
                          checked={newItem.sections.includes(section.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewItem({
                                ...newItem,
                                sections: [...newItem.sections, section.id]
                              });
                            } else {
                              setNewItem({
                                ...newItem,
                                sections: newItem.sections.filter(id => id !== section.id)
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{section.nom}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Quantité
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newItem.quantite_totale}
                    onChange={(e) => setNewItem({...newItem, quantite_totale: parseInt(e.target.value)})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Modifier l'item</h2>
            
            <form onSubmit={handleEditSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Titre
                  </label>
                  <input
                    type="text"
                    required
                    value={editItem.titre}
                    onChange={(e) => setEditItem({...editItem, titre: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={editItem.description}
                    onChange={(e) => setEditItem({...editItem, description: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Catégorie
                  </label>
                  <select
                    required
                    value={editItem.categorie_id}
                    onChange={(e) => setEditItem({...editItem, categorie_id: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Sections
                  </label>
                  <div className="mt-2 space-y-2">
                    {sections.map((section) => (
                      <label key={section.id} className="inline-flex items-center mr-4">
                        <input
                          type="checkbox"
                          checked={editItem.sections.includes(section.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditItem({
                                ...editItem,
                                sections: [...editItem.sections, section.id]
                              });
                            } else {
                              setEditItem({
                                ...editItem,
                                sections: editItem.sections.filter(id => id !== section.id)
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{section.nom}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Quantité totale
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editItem.quantite_totale}
                    onChange={(e) => setEditItem({...editItem, quantite_totale: parseInt(e.target.value)})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'emprunt */}
      {showBorrowModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Emprunter un item</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher un professeur
              </label>
              <input
                type="text"
                placeholder="Rechercher par nom..."
                value={professeursSearchQuery}
                onChange={(e) => setProfesseursSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="max-h-60 overflow-y-auto">
              {professeurs.map((professeur) => (
                <button
                  key={professeur.id}
                  onClick={() => handleBorrow(professeur.id)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 rounded-md transition-colors"
                >
                  <div className="font-medium">{professeur.prenom} {professeur.nom}</div>
                  <div className="text-sm text-gray-500">{professeur.email}</div>
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowBorrowModal(false);
                  setSelectedItemId(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-yellow-700">Aucun item trouvé dans la base de données.</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {items.map((item) => (
              <li key={item.id}>
                <div className="block hover:bg-gray-50 transition-colors">
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <Link 
                        to={`/items/${item.id}`}
                        className="flex items-center flex-1"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            {getCategoryIcon(item.categories?.nom || '')}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-lg font-medium text-gray-900">
                            {item.titre}
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                             {item.description}
                          </div>
                          {item.sections && item.sections.length > 0 && (
                            <div className="mt-2 flex items-center space-x-2">
                              <Tag className="h-4 w-4 text-gray-400" />
                              <div className="flex flex-wrap gap-2">
                                {item.sections.map((section) => (
                                  <span
                                    key={section.id}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                  >
                                    {section.nom}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {item.categories?.nom}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.quantite_disponible}/{item.quantite_totale} disponible{item.quantite_totale > 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedItemId(item.id);
                              setShowBorrowModal(true);
                            }}
                            disabled={item.quantite_disponible === 0}
                            className="px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-500 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Emprunter
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleEdit(item);
                            }}
                            className="p-1 text-gray-600 hover:text-gray-500 hover:bg-gray-50 rounded-full transition-colors"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 text-red-600 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}