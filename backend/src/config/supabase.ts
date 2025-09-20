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

export async function uploadAndGetUrl(file: Express.Multer.File, bucket: string, pathPrefix: string, retries?: number): Promise<string>;
export async function uploadAndGetUrl(files: Express.Multer.File[], bucket: string, pathPrefix: string, retries?: number): Promise<string[]>;

export async function uploadAndGetUrl(
  fileOrFiles: Express.Multer.File | Express.Multer.File[],
  bucket: string,
  pathPrefix: string,
  retries = 3
): Promise<string | string[]> {
  const filesArray = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];

  const uploadPromises = filesArray.map(async (file) => {
    const path = `${pathPrefix}/${Date.now()}_${file.originalname}`;
    let attempts = 0;
    let lastError: any = null;

    while (attempts < retries) {
      try {
        const { error } = await supabaseAdmin.storage
          .from(bucket)
          .upload(path, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
          });

        if (error) {
          throw error;
        }

        const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
      } catch (err: any) {
        lastError = err;
        if (err.__isStorageError && err.originalError?.code === 'ECONNRESET' && attempts < retries) {
          attempts++;
          console.warn(`Connection reset for file ${file.originalname}. Retrying upload... (Attempt ${attempts}/${retries})`);
          await new Promise(res => setTimeout(res, 1000 * attempts));
        } else {
          throw err;
        }
      }
    }
    throw lastError;
  });

  const urls = await Promise.all(uploadPromises);

  return Array.isArray(fileOrFiles) ? urls : urls[0];
}