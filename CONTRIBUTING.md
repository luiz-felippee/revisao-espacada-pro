# Guia de Contribuição 🤝

Obrigado por seu interesse em contribuir com o **Study Panel PRO**! Este guia ajudará você a entender como começar e quais são os padrões que seguimos.

## 🚀 Como Começar

1. **Fork o repositório**
2. **Clone seu fork localmente**
   ```bash
   git clone https://github.com/seu-usuario/study-panel.git
   ```
3. **Instale as dependências**
   ```bash
   npm install
   ```
4. **Configure o ambiente**
   - Siga as instruções no [README.md](./README.md) para configurar o Supabase e as variáveis de ambiente.

## 🛠️ Padrões de Desenvolvimento

### Stack Tecnológica
- **React 19** com TypeScript
- **Tailwind CSS** para estilização
- **Framer Motion** para animações
- **Zod** para validação de esquemas
- **Supabase** para backend e autenticação

### Qualidade de Código
- **TypeScript**: Use tipagem forte. Evite o uso de `any` a menos que seja estritamente necessário (e documentado).
- **Hooks**: Centralize a lógica de negócio em hooks customizados em `src/hooks/`.
- **Serviços**: Use `src/services/` para integrações com APIs externas e lógica complexa de background.
- **Componentes**: Mantenha componentes focados e reutilizáveis em `src/features/` ou `src/components/`.

### Logging
- **NUNCA** use `console.log` diretamente. Utilize o utilitário de log em `src/utils/logger.ts`:
  ```typescript
  import { logger } from '../utils/logger';
  logger.debug('Mensagem de depuração');
  ```
  Isso garante que logs de depuração sejam removidos em produção automaticamente.

## 🧪 Testes

A qualidade do código é garantida por uma suíte de testes rigorosa.

- **Unitários e Integração**: Use Vitest e React Testing Library.
- **Comandos**:
  ```bash
  npm run test             # Executar testes
  npm run test:coverage    # Garantir que novas funcionalidades tenham cobertura
  ```

## 📝 Processo de Pull Request

1. Verifique se os testes existentes ainda passam: `npm run test`
2. Certifique-se de que o código está devidamente tipado e sem erros de lint: `npm run lint`
3. Atualize a documentação se houver mudanças em funcionalidades.
4. Abra o Pull Request com uma descrição clara do que foi alterado e por quê.

## 🙏 Agradecimentos

Sua contribuição é valiosa e ajuda a tornar o Study Panel PRO melhor para todos os estudantes!
