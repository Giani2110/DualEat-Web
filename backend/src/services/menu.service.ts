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

const parsePrice = (text: string): number | null => {
    const regex = /\$?\s*(\d+(?:[.,]\d{3})*(?:[.,]\d{2})?)/;
    const match = text.match(regex);
    if (!match) return null;
  
    let num = match[1].replace(/\./g, '').replace(',', '.');
  
    const price = parseFloat(num);
    // Rango de precios: 100 a 1.000.000 pesos
    if (isNaN(price) || price < 100 || price > 1000000) {
      return null;
    }
    return price;
  };

const isPossibleDishName = (line: string): boolean => {
  // Ahora la lógica simplemente verifica si la línea tiene 5 o menos palabras y no es solo un precio
  return line.length > 2 &&
         line.split(/\s+/).length <= 5 &&
         parsePrice(line) === null;
};


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

    const dishes: MenuDish[] = [];
    let currentDishName: string | null = null;
    
    for (const line of lines) {
      // Si la línea actual es un posible nombre de plato, lo guardamos
      if (isPossibleDishName(line)) {
        currentDishName = line;
      }
      
      // Si tenemos un nombre de plato guardado y la línea actual es un precio válido
      const price = parsePrice(line);
      if (currentDishName && price !== null) {
        dishes.push({
          name: currentDishName,
          price: price,
          category: undefined,
          confidence: avgConfidence
        });
        // Reiniciamos el nombre del plato para el siguiente ciclo
        currentDishName = null;
      }
    }

    const cleanedDishes = dishes.filter(d => 
      d.name && d.name.length > 2 && d.name.split(/\s+/).length <= 5
    );

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
    try {
      await fs.unlink(filePath);
    } catch {
      // Ignore
    }
  }
};