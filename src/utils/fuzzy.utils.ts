export interface FuzzyMatch {
  item: string;
  score: number;
  indices: number[];
}

export function fuzzyMatch(pattern: string, str: string): FuzzyMatch | null {
  const patternLower = pattern.toLowerCase();
  const strLower = str.toLowerCase();

  if (patternLower.length === 0) return { item: str, score: 1, indices: [] };

  let patternIdx = 0;
  let score = 0;
  let consecutive = 0;
  const indices: number[] = [];

  for (let i = 0; i < strLower.length; i++) {
    if (strLower[i] === patternLower[patternIdx]) {
      indices.push(i);
      consecutive++;
      score += consecutive;
      patternIdx++;

      if (patternIdx === patternLower.length) {
        if (indices[0] === 0) score += 10;
        score += Math.max(0, 20 - str.length);
        return { item: str, score, indices };
      }
    } else {
      consecutive = 0;
    }
  }

  return null;
}

export function fuzzySearch<T>(
  items: T[],
  query: string,
  getKey: (item: T) => string,
): Array<{ item: T; score: number; indices: number[] }> {
  if (!query.trim()) return items.map(item => ({ item, score: 0, indices: [] }));

  const results: Array<{ item: T; score: number; indices: number[] }> = [];

  for (const item of items) {
    const key = getKey(item);
    const match = fuzzyMatch(query, key);
    if (match) {
      results.push({ item, score: match.score, indices: match.indices });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
