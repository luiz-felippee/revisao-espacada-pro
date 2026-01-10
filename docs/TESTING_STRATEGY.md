# 🧪 Estratégia de Testes - Study Panel

Este documento descreve a abordagem de testes implementada para garantir a estabilidade e manutenibilidade do projeto.

## 🏗️ Arquitetura de Testes

Utilizamos **Vitest** como runner e **React Testing Library** para interação com componentes e hooks.

### 1. Separação de Responsabilidades (Separation of Concerns)

Para facilitar os testes, adotamos o padrão de extrair lógica complexa de componentes visuais para **Custom Hooks** (Controllers).

**Exemplo:** `GlobalSearch`
- **Antes:** Lógica de navegação, estado de modal e efeitos misturados com JSX. Testar exigia renderizar tudo.
- **Depois:**
  - `useGlobalSearchController.ts`: Contém toda a lógica de estado e navegação. Testável unitariamente via `renderHook`.
  - `GlobalSearch.tsx`: Componente "burro" que apenas renderiza dados recebidos do hook. Testável via integração visual simples.

### 2. Tipos de Testes Implementados

#### A. Testes Unitários de Hooks (`src/hooks/__tests__`)
Focam em testar a lógica pura, isolada da UI.
- **useOptimization.test.ts**: Valida `useDebounce`, `useThrottle` (incluindo correção de leading edge).
- **useGlobalSearchController.test.ts**: Valida fluxo de busca, seleção e navegação por teclado. Mocka dependências externas como `react-router-dom` e outros hooks.

#### B. Testes de Integração de Componentes (`src/components/__tests__`)
Focam em verificar se a UI responde corretamente ao estado e interações.
- **GlobalSearch.test.tsx**: Renderiza o componente com mocks de contexto e hooks. Verifica se elementos aparecem na tela e se classes CSS de estado (ex: seleção) são aplicadas.
- **Mocking de Lazy Components**: Para componentes pesados carregados via `React.lazy`, usamos `vi.mock` para renderizar placeholders simples (`<div data-testid="...">`), evitando carregar a árvore inteira de dependências.

## 🛠️ Ferramentas e Configuração

- **Vitest**: Runner rápido compatível com Vite.
- **@testing-library/react**: Utilitários `render`, `screen`, `fireEvent`, `renderHook`.
- **@testing-library/jest-dom**: Matchers estendidos (`toBeInTheDocument`, `toHaveClass`).
- **Setup Files**: `src/setupTests.ts` configura mocks globais para APIs do browser não presentes no jsdom (como `ResizeObserver`, `matchMedia`).

## 🚀 Como Rodar os Testes

```bash
# Rodar todos os testes
npm test

# Rodar testes específicos
npx vitest run src/hooks/__tests__/useGlobalSearchController.test.ts

# Rodar com UI gráfica
npm run test:ui

# Rodar Testes E2E (Simulação de Usuário)
npm run test:e2e
```

### 3. Testes End-to-End (E2E) (`tests/e2e`)
Utilizamos **Playwright** para simular fluxos reais de usuário em navegadores reais.
- **core-flow.spec.ts**: Testa o "caminho feliz" crítico: Registro/Login (ou Modo Offline) -> Criação de Tarefa -> Conclusão -> Verificação de Feedback.
- Valida a integração completa do frontend com o "backend" (ou mocks).
- Roda isolado dos testes unitários.


## 📝 Diretrizes para Novos Testes

1. **Lógica Complexa?** Extraia para um hook e teste o hook.
2. **Componente Visual?** Teste se ele renderiza o que o hook retorna.
3. **Dependências Externas?** Mocke serviços e contextos complexos.
4. **Assincronismo?** Use `async/await`, `waitFor` e `act` para garantir que o React processou as atualizações.
