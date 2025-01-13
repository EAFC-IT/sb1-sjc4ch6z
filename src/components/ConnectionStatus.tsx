import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('items').select('id').limit(1);
        setIsOnline(!error);
      } catch {
        setIsOnline(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed bottom-4 right-4 bg-danger-DEFAULT text-white font-medium px-4 py-2 rounded-lg shadow-lg border border-danger-dark">
        Connexion perdue. Tentative de reconnexion...
      </div>
    );
  }

  return null;
};