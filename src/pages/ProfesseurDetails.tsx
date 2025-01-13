import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileText, Download, Mail, Copy } from 'lucide-react';

type Professeur = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
};

type Emprunt = {
  id: string;
  date_emprunt: string;
  date_retour: string | null;
  status: string;
  items: {
    id: string;
    titre: string;
    categories: {
      nom: string;
    };
  };
};

export function ProfesseurDetails() {
  const { id } = useParams<{ id: string }>();
  const [professeur, setProfesseur] = useState<Professeur | null>(null);
  const [emprunts, setEmprunts] = useState<Emprunt[]>([]);
  const [showSummaryOptions, setShowSummaryOptions] = useState(false);

  useEffect(() => {
    if (id) {
      loadProfesseur();
      loadEmprunts();
    }
  }, [id]);

  async function loadProfesseur() {
    const { data, error } = await supabase
      .from('professeurs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error loading professeur:', error);
      return;
    }

    setProfesseur(data);
  }

  async function loadEmprunts() {
    const { data, error } = await supabase
      .from('emprunts')
      .select(`
        *,
        items (
          id,
          titre,
          categories (
            nom
          )
        )
      `)
      .eq('professeur_id', id)
      .order('date_emprunt', { ascending: false });

    if (error) {
      console.error('Error loading emprunts:', error);
      return;
    }

    setEmprunts(data || []);
  }

  async function handleReturn(empruntId: string) {
    const { error } = await supabase
      .from('emprunts')
      .update({
        status: 'retourne',
        date_retour: new Date().toISOString()
      })
      .eq('id', empruntId);

    if (!error) {
      loadEmprunts();
    }
  }

  const generateSummaryContent = () => {
    const empruntsEnCours = emprunts.filter((e) => e.status === 'en_cours');
    const today = format(new Date(), 'dd MMMM yyyy', { locale: fr });
    
    return `Résumé des emprunts en cours - ${today}
    
Professeur: ${professeur?.prenom} ${professeur?.nom}
Email: ${professeur?.email}

Items empruntés:
${empruntsEnCours.map(e => `- ${e.items.titre} (${e.items.categories.nom}) - Emprunté le ${format(new Date(e.date_emprunt), 'dd/MM/yyyy')}`).join('\n')}`;
  };

  const handleDownload = () => {
    const content = generateSummaryContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emprunts_${professeur?.nom.toLowerCase()}_${professeur?.prenom.toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowSummaryOptions(false);
  };

  const handleCopy = async () => {
    const content = generateSummaryContent();
    await navigator.clipboard.writeText(content);
    setShowSummaryOptions(false);
  };

  const handleEmail = () => {
    const content = generateSummaryContent();
    const subject = `Résumé des emprunts - ${format(new Date(), 'dd/MM/yyyy')}`;
    const mailtoLink = `mailto:${professeur?.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(content)}`;
    window.location.href = mailtoLink;
    setShowSummaryOptions(false);
  };

  if (!professeur) {
    return <div>Chargement...</div>;
  }

  const empruntsEnCours = emprunts.filter((e) => e.status === 'en_cours');
  const empruntsTermines = emprunts.filter((e) => e.status !== 'en_cours');

  return (
    <div>
      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {professeur.prenom} {professeur.nom}
            </h1>
            <p className="text-gray-600">{professeur.email}</p>
          </div>
          {empruntsEnCours.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowSummaryOptions(!showSummaryOptions)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FileText className="h-5 w-5 mr-2" />
                Générer un résumé
              </button>

              {showSummaryOptions && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu">
                    <button
                      onClick={handleDownload}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </button>
                    <button
                      onClick={handleEmail}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Envoyer par email
                    </button>
                    <button
                      onClick={handleCopy}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copier
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Emprunts en cours ({empruntsEnCours.length})
          </h2>
          <div className="space-y-4">
            {empruntsEnCours.map((emprunt) => (
              <div
                key={emprunt.id}
                className="border-b border-gray-200 pb-4 last:border-0"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">
                      {emprunt.items.titre}
                    </p>
                    <p className="text-sm text-gray-500">
                      Emprunté le{' '}
                      {format(new Date(emprunt.date_emprunt), 'dd MMMM yyyy', {
                        locale: fr,
                      })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {emprunt.items.categories.nom}
                    </span>
                    <button
                      onClick={() => handleReturn(emprunt.id)}
                      className="px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-500 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                    >
                      Rendre
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Historique des emprunts
          </h2>
          <div className="space-y-4">
            {empruntsTermines.map((emprunt) => (
              <div
                key={emprunt.id}
                className="border-b border-gray-200 pb-4 last:border-0"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">
                      {emprunt.items.titre}
                    </p>
                    <p className="text-sm text-gray-500">
                      Emprunté le{' '}
                      {format(new Date(emprunt.date_emprunt), 'dd MMMM yyyy', {
                        locale: fr,
                      })}
                    </p>
                    {emprunt.date_retour && (
                      <p className="text-sm text-gray-500">
                        Retourné le{' '}
                        {format(new Date(emprunt.date_retour), 'dd MMMM yyyy', {
                          locale: fr,
                        })}
                      </p>
                    )}
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {emprunt.items.categories.nom}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}