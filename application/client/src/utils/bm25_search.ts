import Bluebird from "bluebird";
import type { Tokenizer, IpadicFeatures } from "kuromoji";

async function getTokenizer(): Promise<Tokenizer<IpadicFeatures>> {
  const { default: kuromoji } = await import("kuromoji");
  const builder = Bluebird.promisifyAll(kuromoji.builder({ dicPath: "/dicts" }));
  return await (builder as any).buildAsync();
}

export type Document = {
  id: string;
  text: string;
};

export function extractTokens(tokens: any[]): string[] {
  return tokens
    .filter((token) => ["名詞", "動詞", "形容詞"].includes(token.pos))
    .map((token) => token.surface_form);
}

export function filterSuggestionsBM25(
  tokenizer: Tokenizer<IpadicFeatures>,
  candidates: string[],
  queryTokens: string[],
): string[] {
  if (queryTokens.length === 0) return [];
  return candidates
    .filter((candidate) => {
      const candidateLower = candidate.toLowerCase();
      return queryTokens.every((token) => candidateLower.includes(token.toLowerCase()));
    })
    .slice(0, 10);
}

export async function search(query: string, documents: Document[]): Promise<Document[]> {
  const [tokenizer, { BM25 }] = await Promise.all([
    getTokenizer(),
    import("bayesian-bm25") as any,
  ]);

  const bm25 = new BM25();
  for (const doc of documents) {
    const tokens = tokenizer.tokenize(doc.text).map((t: any) => t.surface_form);
    bm25.addDocument(doc.id, tokens);
  }

  const queryTokens = tokenizer.tokenize(query).map((t: any) => t.surface_form);
  const results = bm25.search(queryTokens);

  return results
    .sort((a: any, b: any) => b.score - a.score)
    .map((res: any) => documents.find((doc) => doc.id === res.id)!);
}
