import { createClient } from "@supabase/supabase-js";

// Obtén las variables directamente de process.env
// Asegúrate de que tus variables de entorno tienen la clave anon y la de servicio
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Verifica que las variables existan para evitar errores
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables");
}

// Cliente público (para operaciones del lado del cliente)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Cliente de administrador (para operaciones del lado del servidor que requieren permisos elevados)
// Este cliente se usaría para la inserción en la base de datos que te está dando problemas
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false, // Opcional, pero recomendado para el backend
  },
});