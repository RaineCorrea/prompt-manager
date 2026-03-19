import z from 'zod';

export const createPromptSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório'),
  content: z.string().min(1, 'O conteúdo é obrigatório'),
});

export type CreatePromptDTO = z.infer<typeof createPromptSchema>;
