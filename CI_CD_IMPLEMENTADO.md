# 🚀 Integração Contínua (CI/CD) Implementada

Configuramos um pipeline automatizado usando **GitHub Actions** para garantir a qualidade e estabilidade do código.

## 🛠️ O que foi configurado?

Arquivo: `.github/workflows/ci.yml`

Este workflow roda automaticamente em:
- ✅ Todo `push` para a branch `main`
- ✅ Todo `pull request` para a branch `main`
- ✅ Manualmente (opção workflow_dispatch)

### Etapas do Pipeline:

1.  **Checkout:** Baixa o código do repositório.
2.  **Setup Node.js:** Prepara o ambiente Node (v18.x) com cache de npm para ser mais rápido.
3.  **Install Dependencies:** Instala as dependências usando `npm install --legacy-peer-deps` (mesmo comando usado localmente e na Vercel).
4.  **Lint:** Verifica erros de estilo e qualidade de código (`npm run lint`).
5.  **Test:** Executa a suíte de testes unitários (`npm run test`).
6.  **Build:** Tenta compilar a aplicação para garantir que não há erros de build (`npm run build`).

## 🛡️ Benefícios

1.  **Segurança:** Impede que código quebrado (que falha nos testes ou no build) chegue a produção.
2.  **Automação:** Você não precisa rodar testes manualmente toda vez; o GitHub faz pra você.
3.  **Qualidade:** Garante que o padrão de código (linting) seja mantido.
4.  **Feedback Rápido:** Se algo quebrar, você recebe um e-mail ou notificação do GitHub imediatamente.

## 📊 Como Ver

1.  Vá para a aba **Actions** no seu repositório GitHub.
2.  Você verá os workflows rodando a cada commit.
3.  Um ✅ verde indica sucesso, um ❌ vermelho indica que algo precisa de correção.

---

**Status:** IMPLEMENTADO ✅
