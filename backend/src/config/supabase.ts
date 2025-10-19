import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Cliente de administrador (para operaciones del lado del servidor que requieren permisos elevados)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false, // Opcional, pero recomendado para el backend
  },
});

export async function uploadAndGetUrl(file: Express.Multer.File, bucket: string, pathPrefix: string, retries?: number): Promise<string>;
export async function uploadAndGetUrl(files: Express.Multer.File[], bucket: string, pathPrefix: string, retries?: number): Promise<string[]>;

// Subir uno o varios archivos a Supabase Storage y obtener sus URLs públicas
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

// Borrar uno o varios archivos de Supabase Storage dado un array de URLs públicas
export async function deleteSupabaseFiles(urls: string[], bucket: string) {
  const paths = urls
    .map((url) => {
      const parts = url.split(`${bucket}/`);
      return parts[1] ? decodeURIComponent(parts[1]) : null;
    })
    .filter((path): path is string => !!path);

  if (paths.length > 0) {
    const { error } = await supabaseAdmin.storage.from(bucket).remove(paths);
    if (error) {
      console.error(`Error al borrar archivos del bucket ${bucket}:`, error);
    }
  }
}