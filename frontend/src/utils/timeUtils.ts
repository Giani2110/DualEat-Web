export const withMinimumDelay = async <T>(
  promise: Promise<T>,
  minTime: number
): Promise<T> => {
  const delay = new Promise((resolve) => setTimeout(resolve, minTime));
  const [result] = await Promise.all([promise, delay]);
  return result;
};
