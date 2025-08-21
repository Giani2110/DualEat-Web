import { promises as fs } from 'fs';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import 'dotenv/config';

const client = new ImageAnnotatorClient();

export interface MenuDish {
  name: string;
  price: number;
  category?: string;
  confidence?: number | null;
}

export interface OcrResult {
  dishes: MenuDish[];
  categories: string[];
  processingInfo: {
    rawText: string;
    detectedLanguage: string;
    confidence: number | null;
  };
}

/* ------------------- Utilidades ------------------- */

const MIN_PRICE = 500; 
const MAX_PRICE = 1000000;

const BAD_START = [
  'y', 'con', 'acompañado', 'acompañada', 'acompañados', 'acompañadas', 'de', 'en', 'o', 'sin','para', 
  'plato', 'platos', 'postre', 'postres', 'bebida', 'bebidas',
  'entrada', 'entradas', 'sopa', 'sopas', 'ensalada', 'ensaladas', 'menu', 'menú',
  'especial', 'especiales', 'oferta', 'ofertas', 'promoción', 'promociones',
  'combo', 'combos', 'plato del día', 'plato del dia', 'platos del día', 'platos del dia', 'incluye', 'incluyen',
  'horario', 'horarios', 'lunes', 'martes', 'miércoles', 'miercoles', 'jueves', 'viernes', 'sábado', 'sabado', 'domingo', 'abierto', 'cerrado',
  'precio', 'precios', 'iva incluido', 'iva no incluido', 'impuestos incluidos', 'impuestos no incluidos',
  'consulte', 'consultan', 'pregunte', 'preguntan', 'gracias', 'bienvenido', 'bienvenida', 'bienvenidos', 'bienvenidas', 
  'disculpe', 'disculpen', 'favor', 'favor de', 'prohibido', 'no se permite',
];

const sanitizeName = (s: string) =>
  s
    .replace(/[.,;:]+$/g, '')   // saca puntuación final
    .replace(/\s{2,}/g, ' ')
    .trim();

const startsLower = (s: string) => /^[\p{Ll}]/u.test(s);
const hasDigits = (s: string) => /\d/.test(s);

const isPriceOnlyLine = (s: string) => /^\s*\$?\s*\d[\d.,]*\s*$/.test(s.trim());

const parsePrice = (text: string): number | null => {
  const match = text.match(/\$?\s*(\d[\d.,]*)/);
  if (!match) return null;

  let num = match[1].replace(/\./g, '').replace(',', '.');
  const price = parseFloat(num);

  if (isNaN(price) || price < MIN_PRICE || price > MAX_PRICE) return null;
  return price;
};

const extractNameBeforeLastPrice = (line: string): { name: string | null; price: number | null } => {
  const matches = line.match(/\$?\s*\d[\d.,]*/g);
  if (!matches) return { name: null, price: null };

  const last = matches[matches.length - 1];
  const idx = line.lastIndexOf(last);
  const namePart = sanitizeName(line.slice(0, idx));
  const pricePart = parsePrice(last);
  return { name: namePart || null, price: pricePart };
};

const isPossibleDishName = (line: string): boolean => {
  const s = sanitizeName(line);
  if (!s || s.length < 3) return false;
  if (startsLower(s)) return false;
  if (hasDigits(s)) return false;

  const lower = s.toLowerCase();
  if (BAD_START.some(w => lower.startsWith(w + ' '))) return false;

  const words = s.split(/\s+/);
  if (words.length < 1 || words.length > 6) return false;

  // Evita frases que suelen ser descripciones
  if (/\b(y|con|de|en|o)\b/i.test(lower) && words.length > 3) return false;

  return true;
};

/* ------------------- Procesamiento OCR ------------------- */

export const processMenuImage = async (filePath: string): Promise<OcrResult> => {
  try {
    const imageBuffer = await fs.readFile(filePath);
    const [result] = await client.textDetection(imageBuffer);
    const rawText = result.fullTextAnnotation?.text || '';
    const detectedLanguage = result.textAnnotations?.[0]?.locale || 'es';

    let totalConfidence = 0;
    let wordCount = 0;
    if (result.textAnnotations) {
      result.textAnnotations.slice(1).forEach(a => {
        if (a.confidence != null) {
          totalConfidence += a.confidence;
          wordCount++;
        }
      });
    }
    const avgConfidence = wordCount > 0 ? totalConfidence / wordCount : null;

    // Preprocesado de líneas
    const lines = rawText
      .split('\n')
      .map(l => l.replace(/\s{2,}/g, ' ').trim())
      .filter(l => l.length > 0);

    const dishes: MenuDish[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const { name: inlineName, price: inlinePrice } = extractNameBeforeLastPrice(line);
      if (inlineName && inlinePrice !== null && isPossibleDishName(inlineName)) {
        dishes.push({
          name: inlineName,
          price: inlinePrice,
          confidence: avgConfidence
        });
        continue;
      }

      // Caso: nombre en una línea y precio en la siguiente
      if (isPossibleDishName(line)) {
        const next = lines[i + 1] ?? '';
        if (isPriceOnlyLine(next) && parsePrice(next) !== null) {
          dishes.push({
            name: sanitizeName(line),
            price: parsePrice(next)!,
            confidence: avgConfidence
          });
          i++;
        }
      }
    }

    // Limpieza final
    const seen = new Set<string>();
    const cleanedDishes = dishes
      .map(d => ({ ...d, name: sanitizeName(d.name) }))
      .filter(d => {
        const key = d.name.toLowerCase();
        if (BAD_START.some(w => key.startsWith(w + ' '))) return false;
        if (key.endsWith(' con') || key.endsWith(' de') || key.endsWith(' en')) return false;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    return {
      dishes: cleanedDishes,
      categories: [],
      processingInfo: {
        rawText,
        detectedLanguage,
        confidence: avgConfidence
      }
    };
  } catch (err) {
    console.error('Error en procesamiento OCR:', err);
    throw err;
  } finally {
    try { await fs.unlink(filePath); } catch {}
  }
};