
import { createClient } from "@supabase/supabase-js";

// Vérifiez si les variables d'environnement sont définies
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Créez un client Supabase avec des valeurs par défaut si les variables d'environnement ne sont pas définies
export const supabase = createClient(
  // Utilisez une URL par défaut si la variable d'environnement n'est pas définie
  supabaseUrl || 'https://example.supabase.co',
  // Utilisez une clé par défaut si la variable d'environnement n'est pas définie
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.public'
);
