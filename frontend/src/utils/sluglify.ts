export const generateSlug = (text: string): string => {
  return text 
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Elimina acentos
    .replace(/[^\w\s]/g, "") // Elimina caracteres no alfanuméricos (EXCEPTO espacios)
    .trim() // Elimina espacios al inicio y final // CAMBIO CLAVE 2: Reemplaza espacios por nada (une las palabras)
    .replace(/[\s]+/g, "");
};
