import {
  createPromptAction,
  searchPromptAction,
} from '@/app/actions/prompt.actions';

jest.mock('@/lib/prisma', () => ({ prisma: {} }));

const mockedSearchExecute = jest.fn();
const mockedCreateExecute = jest.fn();

jest.mock('@/core/application/prompts/search-prompts.use-case', () => ({
  SearchPromptsUseCase: jest.fn().mockImplementation(() => ({
    execute: mockedSearchExecute,
  })),
}));

jest.mock('@/core/application/prompts/create-prompt.use-case', () => ({
  CreatePromptUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: mockedCreateExecute })),
}));

describe('Server Actions: Prompts', () => {
  beforeEach(() => {
    mockedSearchExecute.mockReset();
    mockedCreateExecute.mockReset();
  });

  describe('createPromptAction', () => {
    it('deve criar um prompt com sucesso', async () => {
      mockedCreateExecute.mockResolvedValue(undefined);
      const data = {
        title: 'Title',
        content: 'Content',
      };

      const result = await createPromptAction(data);

      expect(result?.success).toBe(true);
      expect(result?.message).toBe('Prompt criado com sucesso!');
    });

    it('deve retornar erro de validação quando os campos forem vazios', async () => {
      const data = {
        title: '',
        content: '',
      };

      const result = await createPromptAction(data);

      expect(result?.success).toBe(false);
      expect(result?.message).toBe('Erro de validação');
      expect(result?.errors).toBeDefined();
    });

    it('deve retornar erro quando PROMPT_ALREADY_EXISTS acontecer', async () => {
      mockedCreateExecute.mockRejectedValue(new Error('PROMPT_ALREADY_EXISTS'));
      const data = {
        title: 'duplicado',
        content: 'duplicado',
      };

      const result = await createPromptAction(data);

      expect(result?.success).toBe(false);
      expect(result?.message).toBe('Este prompt já existe');
    });

    it('deve retornar erro genérico quando a criação falhar', async () => {
      mockedCreateExecute.mockRejectedValue(new Error('UNKNOWN'));
      const data = {
        title: 'title',
        content: 'content',
      };

      const result = await createPromptAction(data);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Falha ao criar o prompt');
    });
  });

  describe('searchPromptAction', () => {
    it('deve retornar sucesso com o termo de busca nao vazio', async () => {
      const input = [
        { id: '1', title: 'AI Prompt', content: 'Content about AI' },
      ];
      mockedSearchExecute.mockResolvedValue(input);
      const formData = new FormData();
      formData.append('q', 'AI');

      const result = await searchPromptAction({ success: false }, formData);
      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });

    it('deve retornar sucesso e listar todos os prompts quando o termo de busca for vazio', async () => {
      const input = [
        { id: '1', title: 'AI Prompt', content: 'Content about AI' },
        { id: '2', title: 'Cooking Prompt', content: 'Content about Cooking' },
      ];
      mockedSearchExecute.mockResolvedValue(input);
      const formData = new FormData();
      formData.append('q', '');

      const result = await searchPromptAction({ success: true }, formData);
      expect(result.success).toBeDefined();
      expect(result.prompts).toEqual(input);
    });

    it('deve retornar erro quando a busca falhar', async () => {
      const error = new Error('UNKNOWN');
      mockedSearchExecute.mockRejectedValue(error);
      const formData = new FormData();
      formData.append('q', 'error');

      const result = await searchPromptAction({ success: true }, formData);
      expect(result.success).toBe(false);
      expect(result.prompts).toBeUndefined();
      expect(result.message).toBe('Failed to search prompts.');
    });

    it('deve aparar espaços do termo antes de executar', async () => {
      const input = [{ id: '1', title: 'title 01', content: 'content 01' }];
      mockedSearchExecute.mockResolvedValue(input);

      const formData = new FormData();
      formData.append('q', '   title 01  ');

      const result = await searchPromptAction({ success: true }, formData);

      expect(mockedSearchExecute).toHaveBeenCalledWith('title 01');
      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });

    it('deve tratar ausência da query como termo vazio', async () => {
      const input = [
        { id: '1', title: 'first title', content: 'content 01' },
        { id: '2', title: 'second title', content: 'content 02' },
      ];
      mockedSearchExecute.mockResolvedValue(input);

      const formData = new FormData();

      const result = await searchPromptAction({ success: true }, formData);

      expect(mockedSearchExecute).toHaveBeenCalledWith('');
      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });
  });
});
