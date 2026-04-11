export interface NoteEntry { path: string; title: string; summary: string; tags: string[]; mtime: number; embedding: number[]; }
export interface SearchResult { note: NoteEntry; score: number; }

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}

export function embeddingRecall(queryVec: number[], notes: NoteEntry[], topK: number): SearchResult[] {
  return notes.map(note => ({ note, score: cosineSimilarity(queryVec, note.embedding) }))
    .sort((a, b) => b.score - a.score).slice(0, topK);
}
