import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// État de la connexion
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY = 2000; // 2 secondes

// Create Supabase client with enhanced configuration
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'mediatheque-scolaire@1.0.0'
    }
  }
});

// Fonction de reconnexion
const reconnect = async () => {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('Maximum reconnection attempts reached');
    return false;
  }

  reconnectAttempts++;
  await new Promise(resolve => setTimeout(resolve, RECONNECT_DELAY));
  
  try {
    const { data, error } = await supabase.from('items').select('id').limit(1);
    if (!error) {
      isConnected = true;
      reconnectAttempts = 0;
      return true;
    }
  } catch (err) {
    console.error('Reconnection attempt failed:', err);
  }
  
  return false;
};

// Gestionnaire d'erreur amélioré
export const handleSupabaseError = async (error: any) => {
  console.error('Supabase request failed:', error);

  if (!isConnected) {
    const reconnected = await reconnect();
    if (reconnected) {
      return 'Reconnexion réussie. Veuillez réessayer.';
    }
  }

  if (error.code === 'PGRST301') {
    return 'Erreur de connexion à la base de données. Veuillez réessayer.';
  }
  if (error.code === '23505') {
    return 'Cet enregistrement existe déjà.';
  }
  if (error.message === 'Failed to fetch') {
    isConnected = false;
    return 'Erreur de connexion au serveur. Vérifiez votre connexion internet.';
  }
  
  return 'Une erreur est survenue. Veuillez réessayer.';
};

// Vérification de connexion
export const checkConnection = async () => {
  try {
    const { error } = await supabase.from('items').select('id').limit(1);
    isConnected = !error;
    return isConnected;
  } catch {
    isConnected = false;
    return false;
  }
};