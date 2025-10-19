export function capitalize(word: string) {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function pluralize(unit: string, quantity: number): string {
  if (quantity === 1) return unit;

  const irregulars: Record<string, string> = {
    'unidad': 'unidades',
    'cucharada': 'cucharadas',
    'cucharadita': 'cucharaditas',
    'taza': 'tazas',
    'paquete': 'paquetes',
    'pizca': 'pizcas',
  };

  return irregulars[unit] || unit;
}