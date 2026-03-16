import {
  SidebarContent,
  SidebarContentProps,
} from '@/components/sidebar/sidebar-content';
import { render, screen } from '@/lib/test-utils';
import userEvent from '@testing-library/user-event';

const pushMock = jest.fn();
let searchParamsMock = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  useSearchParams: () => searchParamsMock,
}));

const initialPrompts = [
  {
    id: '1',
    title: 'Prompt 1',
    content: 'Conteúdo do Prompt 1',
  },
];

const makeSut = (
  { prompts = initialPrompts }: SidebarContentProps = {} as SidebarContentProps
) => {
  return render(<SidebarContent prompts={prompts} />);
};

describe('SidebarContent', () => {
  const user = userEvent.setup();

  describe('Base', () => {
    it('deveria renderizar o botao para criar o novo prompt', () => {
      makeSut();

      expect(screen.getByRole('complementary')).toBeVisible();
      expect(screen.getByRole('button', { name: 'Novo prompt' })).toBeVisible();
    });

    it('deveria renderizar a lista de prompts', () => {
      makeSut();

      expect(screen.getByText(initialPrompts[0].title)).toBeInTheDocument();
      expect(screen.getAllByRole('paragraph')).toHaveLength(
        initialPrompts.length
      );
    });

    it('deveria atualizar o campo de busca ao digitar', async () => {
      const text = 'AI';
      makeSut();
      const searchInput = screen.getByPlaceholderText('Buscar prompts...');

      await user.type(searchInput, text);

      expect(searchInput).toHaveValue(text);
    });
  });

  describe('Colapsar / Expandir Sidebar', () => {
    it('deveria iniciar expandida e exibir o botão minimizar', () => {
      makeSut();

      const aside = screen.getByRole('complementary');
      expect(aside).toBeVisible();

      const collapseButton = screen.getByRole('button', {
        name: /minimizar sidebar/i,
      });
      expect(collapseButton).toBeVisible();

      const expandButton = screen.queryByRole('button', {
        name: /expandir sidebar/i,
      });
      expect(expandButton).not.toBeInTheDocument();
    });

    it('deveria reexpandir ao clicar no botão de expandir', async () => {
      makeSut();

      const collapseButton = screen.getByRole('button', {
        name: /minimizar sidebar/i,
      });
      await user.click(collapseButton);

      const expandButton = screen.getByRole('button', {
        name: /expandir sidebar/i,
      });
      await user.click(expandButton);

      expect(
        screen.getByRole('button', { name: /minimizar sidebar/i })
      ).toBeVisible();

      expect(
        screen.getByRole('navigation', { name: 'Lista de prompts' })
      ).toBeVisible();
    });

    it('deveria contrair e mostrar o botao de expandir', async () => {
      makeSut();

      const collapseButton = screen.getByRole('button', {
        name: /minimizar sidebar/i,
      });
      await user.click(collapseButton);

      const expandButton = screen.getByRole('button', {
        name: /expandir sidebar/i,
      });
      expect(expandButton).toBeInTheDocument();

      expect(collapseButton).not.toBeInTheDocument();
    });

    it('deveria exibir o botao de criar um novo prompt na sidebar colapsada', async () => {
      makeSut();

      const collapseButton = screen.getByRole('button', {
        name: /minimizar sidebar/i,
      });
      await user.click(collapseButton);

      const newPromptButton = screen.getByRole('button', {
        name: 'Novo Prompt',
      });
      expect(newPromptButton).toBeInTheDocument();
    });

    it('não deveria exibir a lista de prompts na sidebar colapsada', async () => {
      makeSut();

      const collapseButton = screen.getByRole('button', {
        name: /minimizar sidebar/i,
      });
      await user.click(collapseButton);

      const nav = screen.queryByRole('navigation', {
        name: 'Lista de Prompts',
      });
      expect(nav).not.toBeInTheDocument();
    });
  });

  describe('Novo prompt', () => {
    it('deveria redirecionar para a pagina de criação de prompt /new', async () => {
      makeSut();

      const newPromptButton = screen.getByRole('button', {
        name: 'Novo prompt',
      });
      await user.click(newPromptButton);

      expect(pushMock).toHaveBeenCalledWith('/new');
    });
  });

  describe('Busca', () => {
    it('deveria navegar com URL codificada ao digitar e limpar ', async () => {
      const text = 'A B';
      makeSut();
      const searchInput = screen.getByPlaceholderText('Buscar prompts...');

      await user.type(searchInput, text);
      expect(pushMock).toHaveBeenCalled();

      const lastCall = pushMock.mock.calls.at(-1);
      expect(lastCall?.[0]).toBe('/?q=A%20B');

      await user.clear(searchInput);
      const lastClearCall = pushMock.mock.calls.at(-1);
      expect(lastClearCall?.[0]).toBe('/');
    });

    it('deveria submeter o form ao digitar no campo de busca', async () => {
      const submitSpy = jest
        .spyOn(HTMLFormElement.prototype, 'requestSubmit')
        .mockImplementation(() => undefined);
      makeSut();

      const searchInput = screen.getByPlaceholderText('Buscar prompts...');

      await user.type(searchInput, 'AI');

      expect(submitSpy).toHaveBeenCalled();
      submitSpy.mockRestore();
    });

    it('deveria submeter automaticamente ao montar quando houver query', async () => {
      const submitSpy = jest
        .spyOn(HTMLFormElement.prototype, 'requestSubmit')
        .mockImplementation(() => undefined);
      const text = 'text';
      const searchParams = new URLSearchParams(`q=${text}`);
      searchParamsMock = searchParams;
      makeSut();

      expect(submitSpy).toHaveBeenCalled();
      submitSpy.mockRestore();
    });
  });

  it('deveria iniciar o campo de busca com o shearch param', async () => {
    const text = 'inicial';
    const searchParam = new URLSearchParams(`q=${text}`);
    searchParamsMock = searchParam;
    makeSut();

    const searchInput = screen.getByPlaceholderText('Buscar prompts...');
    expect(searchInput).toHaveValue(text);
  });
});
