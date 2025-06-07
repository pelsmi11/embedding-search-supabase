import { describe, it, expect, vi, beforeEach } from 'vitest';

let uploadMock: any;
let getPublicUrlMock: any;
let insertMock: any;
let rpcMock: any;

let embeddingsCreateMock: any;
let chatCreateMock: any;

vi.mock('@supabase/supabase-js', () => {
  uploadMock = vi.fn().mockResolvedValue({ error: null });
  getPublicUrlMock = vi.fn().mockReturnValue({ data: { publicUrl: 'https://supabase.test/file.pdf' } });
  insertMock = vi.fn().mockResolvedValue({ error: null });
  rpcMock = vi.fn();
  return {
    createClient: vi.fn(() => ({
      storage: {
        from: vi.fn(() => ({
          upload: uploadMock,
          getPublicUrl: getPublicUrlMock,
        })),
      },
      from: vi.fn(() => ({ insert: insertMock })),
      rpc: rpcMock,
    })),
  };
});

class MockOpenAI {
  embeddings = { create: embeddingsCreateMock };
  chat = { completions: { create: chatCreateMock } };
}

vi.mock('openai', () => {
  embeddingsCreateMock = vi.fn().mockResolvedValue({ data: [{ embedding: [1, 2, 3] }] });
  chatCreateMock = vi.fn().mockResolvedValue({ choices: [{ message: { content: 'Title: Test\nDescription: Example' } }] });
  return {
    OpenAI: vi.fn(() => new MockOpenAI()),
  };
});

vi.mock('pdf-parse', () => ({ default: vi.fn(async () => ({ text: 'pdf text' })) }));

describe('uploadAndEmbedPDF', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uploads file and stores embedding', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'key';
    process.env.OPENAI_API_KEY = 'key';

    const { uploadAndEmbedPDF } = await import('../src/actions/uploadAndEmbedPDF');
    const formData = new FormData();
    const file = new File(['dummy'], 'test.pdf', { type: 'application/pdf' });
    formData.set('file', file);

    const result = await uploadAndEmbedPDF(formData);

    expect(uploadMock).toHaveBeenCalled();
    expect(insertMock).toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      title: 'Test',
      description: 'Example',
      url: 'https://supabase.test/file.pdf',
    });
  });
});
