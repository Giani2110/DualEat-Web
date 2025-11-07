export function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function interleaveByCommunity<T extends { community_id: string }>(
  posts: T[]
): T[] {
  const grouped = new Map<string, T[]>();

  // Agrupar posts por comunidad
  for (const post of posts) {
    if (!grouped.has(post.community_id)) {
      grouped.set(post.community_id, []);
    }
    grouped.get(post.community_id)!.push(post);
  }

  // Convertir a array de arrays y barajar cada grupo
  const buckets = Array.from(grouped.values()).map(shuffleArray);

  const result: T[] = [];
  let added = true;

  // Intercalar uno por uno de cada grupo
  while (added) {
    added = false;
    for (const bucket of buckets) {
      if (bucket.length > 0) {
        result.push(bucket.shift()!);
        added = true;
      }
    }
  }

  return result;
}