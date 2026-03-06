
import { createClient } from '@supabase/supabase-js';

// En Project IDX, estas variables se inyectan automáticamente si usas la integración lateral.
// Si no, debes configurarlas en tu archivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Creamos el cliente solo si las credenciales existen para evitar errores en modo demo local.
export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey, {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: true,
    }
  })
  : null;

export const isSupabaseConnected = () => !!supabase;

/**
 * Función auxiliar para verificar la conexión
 */
export const checkConnection = async () => {
  if (!supabase) return { success: false, message: 'Faltan credenciales de Supabase' };
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error) throw error;
    return { success: true, message: 'Conectado a Onyx Cloud' };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
};
