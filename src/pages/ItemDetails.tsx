import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import QRCode from 'qrcode';
import { Printer } from 'lucide-react';

type Item = {
  id: string;
  titre: string;
  description: string;
  quantite_totale: number;
  quantite_disponible: number;
  categories: {
    nom: string;
  };
};

type Emprunt = {
  id: string;
  date_emprunt: string;
  date_retour: string | null;
  status: string;
  professeur_id: string;
  professeurs: {
    id: string;
    nom: string;
    prenom: string;
  };
};

type Professeur = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
};

export function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [emprunts, setEmprunts] = useState<Emprunt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [professeurs, setProfesseurs] = useState<Professeur[]>([]);
  const [professeursSearchQuery, setProfesseursSearchQuery] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  async function loadItem() {
    if (!id) return;

    const { data: itemData } = await supabase
      .from('items')
      .select(`
        *,
        categories (
          nom
        )
      `)
      .eq('id', id)
      .single();

    setItem(itemData);

    const { data: empruntsData } = await supabase
      .from('emprunts')
      .select(`
        *,
        professeurs (
          id,
          nom,
          prenom
        )
      `)
      .eq('item_id', id)
      .order('date_emprunt', { ascending: false });

    setEmprunts(empruntsData || []);
    setLoading(false);

    // Generate QR code
    if (itemData) {
      const qrData = {
        id: itemData.id,
        titre: itemData.titre,
        categorie: itemData.categories.nom,
      };
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 200,
        margin: 2,
      });
      setQrCodeUrl(qrCodeDataUrl);
    }
  }

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

  async function handleReturn(empruntId: string) {
    const { error } = await supabase
      .from('emprunts')
      .update({
        status: 'retourne',
        date_retour: new Date().toISOString()
      })
      .eq('id', empruntId);

    if (!error) {
      loadItem();
    }
  }

  async function handleBorrow(professeurId: string) {
    if (!id) return;

    const { error } = await supabase.rpc('create_emprunt', {
      p_item_id: id,
      p_professeur_id: professeurId
    });

    if (!error) {
      loadItem();
      setShowBorrowModal(false);
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !item) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${item.titre}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              padding: 20px;
              text-align: center;
            }
            .container {
              max-width: 400px;
              margin: 0 auto;
            }
            .qr-code {
              margin: 20px 0;
            }
            .qr-code img {
              max-width: 200px;
            }
            .details {
              margin-top: 20px;
              text-align: left;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 10px;
            }
            p {
              margin: 5px 0;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${item.titre}</h1>
            <div class="qr-code">
              <img src="${qrCodeUrl}" alt="QR Code" />
            </div>
            <div class="details">
              <p><strong>Catégorie:</strong> ${item.categories.nom}</p>
              <p><strong>Description:</strong> ${item.description}</p>
              <p><strong>Quantité totale:</strong> ${item.quantite_totale}</p>
            </div>
          </div>
          <script>
            window.onload = () => window.print();
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  useEffect(() => {
    loadItem();
  }, [id]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!item) {
    return <div>Item non trouvé</div>;
  }

  const empruntsEnCours = emprunts.filter(e => e.status === 'en_cours');
  const empruntsTermines = emprunts.filter(e => e.status !== 'en_cours');

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{item.titre}</h1>
            <p className="text-gray-600 mb-4">{item.description}</p>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {item.categories.nom}
              </span>
              <span className="text-sm text-gray-500">
                {item.quantite_disponible}/{item.quantite_totale} disponible{item.quantite_totale > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {item.quantite_disponible > 0 && (
              <button
                onClick={() => setShowBorrowModal(true)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Emprunter
              </button>
            )}
          </div>
        </div>

        {qrCodeUrl && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">QR Code de l'item</h2>
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimer le QR Code
              </button>
            </div>
            <div className="flex justify-center">
              <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
            </div>
          </div>
        )}
      </div>

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
                onClick={() => setShowBorrowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

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
                  <Link 
                    to={`/professeurs/${emprunt.professeur_id}`}
                    className="font-medium text-gray-900 hover:text-indigo-600"
                  >
                    {emprunt.professeurs.prenom} {emprunt.professeurs.nom}
                  </Link>
                  <p className="text-sm text-gray-500">
                    Emprunté le{' '}
                    {format(new Date(emprunt.date_emprunt), 'dd MMMM yyyy', {
                      locale: fr,
                    })}
                  </p>
                </div>
                <button
                  onClick={() => handleReturn(emprunt.id)}
                  className="px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-500 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                >
                  Rendre
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Liste des emprunts ({empruntsTermines.length})
        </h2>
        <div className="space-y-4">
          {empruntsTermines.map((emprunt) => (
            <div
              key={emprunt.id}
              className="border-b border-gray-200 pb-4 last:border-0"
            >
              <div className="flex justify-between items-start">
                <div>
                  <Link 
                    to={`/professeurs/${emprunt.professeur_id}`}
                    className="font-medium text-gray-900 hover:text-indigo-600"
                  >
                    {emprunt.professeurs.prenom} {emprunt.professeurs.nom}
                  </Link>
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}