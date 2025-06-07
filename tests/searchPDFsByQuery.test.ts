import { describe, it, expect, vi, beforeEach } from 'vitest';

let rpcMock: any;
let embeddingsCreateMock: any;

vi.mock('@supabase/supabase-js', () => {
  rpcMock = vi.fn().mockResolvedValue({ data: [{ id: '1' }], error: null });
  return {
    createClient: vi.fn(() => ({
      rpc: rpcMock,
    })),
  };
});

class MockOpenAI {
  embeddings = { create: embeddingsCreateMock };
}

vi.mock('openai', () => {
  embeddingsCreateMock = vi.fn().mockResolvedValue({ data: [{ embedding: [1, 2, 3] }] });
  return {
    OpenAI: vi.fn(() => new MockOpenAI()),
  };
});

describe('searchPDFsByQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns matching documents', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'key';
    process.env.OPENAI_API_KEY = 'key';

    const { searchPDFsByQuery } = await import('../src/actions/searchPDFsByQuery');
    const result = await searchPDFsByQuery('hello');

    expect(embeddingsCreateMock).toHaveBeenCalled();
    expect(rpcMock).toHaveBeenCalled();
    expect(result).toEqual({ results: [{ id: '1' }] });
  });
});
