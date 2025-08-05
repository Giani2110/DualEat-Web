/**
 * Ejecuta una promesa y se asegura de que tome al menos `minTime` milisegundos.
 *
 * @template T - Tipo de la promesa original.
 * @param promise - Promesa que se desea ejecutar.
 * @param minTime - Tiempo mínimo en milisegundos que debe tomar la ejecución.
 * @returns Una promesa que resuelve con el mismo valor que `promise`, pero que tarda al menos `minTime`.
 */

export const withMinimumDelay = async <T>(
  promise: Promise<T>,
  minTime: number
): Promise<T> => {
  const delay = new Promise((resolve) => setTimeout(resolve, minTime));
  const [result] = await Promise.all([promise, delay]);
  return result;
};
