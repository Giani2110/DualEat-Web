export function capitalize(word: string) {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function pluralize(unit: string, quantity: number): string {
  if (quantity === 1) return unit;

  const irregulars: Record<string, string> = {
    unidad: "unidades",
    cucharada: "cucharadas",
    cucharadita: "cucharaditas",
    taza: "tazas",
    paquete: "paquetes",
    pizca: "pizcas",
  };

  return irregulars[unit] || unit;
}

export const getMimeTypeFromUrl = (url: string): string | null => {
  const pathname = new URL(url).pathname;
  const ext = pathname.split(".").pop()?.toLowerCase();
  if (!ext) return null;

  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    webm: "video/webm",
    svg: "image/svg+xml",
    mp4: "video/mp4",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
  };

  const mimeType = mimeTypes[ext.toLowerCase()];

  if (!mimeType) return null;

  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.startsWith("image/")) return "image";

  return null;
};
