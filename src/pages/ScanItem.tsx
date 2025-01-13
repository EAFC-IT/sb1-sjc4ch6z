import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Camera, X } from 'lucide-react';

export function ScanItem() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    let scanner: any;

    const initializeScanner = async () => {
      try {
        const { Html5QrcodeScanner } = await import('html5-qrcode');
        scanner = new Html5QrcodeScanner(
          'reader',
          { 
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          false
        );

        scanner.render(onScanSuccess, onScanError);
      } catch (err) {
        setError('Erreur lors de l\'initialisation de la caméra');
      }
    };

    initializeScanner();

    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, []);

  const onScanSuccess = async (decodedText: string) => {
    try {
      setScanning(false);
      const itemData = JSON.parse(decodedText);
      
      // Vérifier si l'item existe et est disponible
      const { data: item } = await supabase
        .from('items')
        .select('id, quantite_disponible')
        .eq('id', itemData.id)
        .single();

      if (!item) {
        setError('Item non trouvé');
        return;
      }

      if (item.quantite_disponible <= 0) {
        setError('Item non disponible');
        return;
      }

      // Rediriger vers la page de détails de l'item
      navigate(`/items/${itemData.id}`);
    } catch (err) {
      setError('QR code invalide');
      setScanning(true);
    }
  };

  const onScanError = (error: string) => {
    // Ignorer les erreurs de scan qui ne sont pas critiques
    if (error.includes('NotFound')) return;
    setError(error);
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Scanner un item</h1>
          <Camera className="h-6 w-6 text-gray-400" />
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
          <div id="reader" className="w-full h-full"></div>
        </div>

        <p className="mt-4 text-sm text-gray-600 text-center">
          Placez le QR code de l'item dans le cadre pour l'emprunter
        </p>
      </div>
    </div>
  );
}