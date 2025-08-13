import { promises as fs } from 'fs';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import 'dotenv/config';

const client = new ImageAnnotatorClient();

// Definición de interfaces y tipos
export interface MenuDish {
  name: string;
  description?: string;
  price?: number | null;
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

// Funciones auxiliares
const parsePrice = (text: string): number | null => {
  const regex = /[$€]?\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/;
  const match = text.match(regex);
  if (!match) return null;
  
  let num = match[1]
    .replace(/\./g, '')
    .replace(',', '.');
  
  const price = parseFloat(num);
  return isNaN(price) ? null : price;
};

const isCategory = (line: string): boolean => {
  if (!line || line.length < 2) return false;
  return line === line.toUpperCase() && 
         !/[0-9$€]/.test(line) &&
         line.length < 50;
};

const isPossibleDishName = (line: string): boolean => {
  return line.length > 2 && 
         line.split(/\s+/).length <= 7 && 
         !isCategory(line) &&
         !parsePrice(line);
};

// Función principal
export const processMenuImage = async (filePath: string): Promise<OcrResult> => {
  try {
    const imageBuffer = await fs.readFile(filePath);
    const [result] = await client.textDetection(imageBuffer);
    const rawText = result.fullTextAnnotation?.text || '';
    const detectedLanguage = result.textAnnotations?.[0]?.locale || 'es';

    let totalConfidence = 0;
    let wordCount = 0;
    if (result.textAnnotations) {
      result.textAnnotations.slice(1).forEach(annotation => {
        if (annotation.confidence != null) {
          totalConfidence += annotation.confidence;
          wordCount++;
        }
      });
    }
    const avgConfidence = wordCount > 0 ? totalConfidence / wordCount : null;

    const lines = rawText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const categories: string[] = [];
    const dishes: MenuDish[] = [];
    let currentCategory: string | undefined;
    let currentDish: MenuDish | null = null;
    
    for (const line of lines) {
      const price = parsePrice(line);

      if (isCategory(line)) {
        if (currentDish) {
          dishes.push(currentDish);
        }
        currentCategory = line;
        categories.push(currentCategory);
        currentDish = null;
        continue;
      }
      
      if (isPossibleDishName(line)) {
        if (currentDish) {
          dishes.push(currentDish);
        }
        currentDish = {
          name: line,
          category: currentCategory,
          price: price,
          confidence: avgConfidence
        };
      } else if (currentDish && price !== null) {
        currentDish.price = price;
      } else if (currentDish) {
        currentDish.description = currentDish.description
          ? `${currentDish.description} ${line}`
          : line;
      }
    }
    
    if (currentDish) {
      dishes.push(currentDish);
    }

    const cleanedDishes = dishes.filter(d => 
      d.name && d.name.length > 2 && d.name.split(/\s+/).length <= 10
    );

    return {
      dishes: cleanedDishes,
      categories: [...new Set(categories)],
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
    try {
      await fs.unlink(filePath);
    } catch {
      // Ignore
    }
  }
};