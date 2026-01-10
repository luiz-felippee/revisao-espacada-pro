# 🚀 Guia de Deploy - Revisão Espaçada PRO

## Pré-requisitos
✅ Aplicação funcionando localmente
✅ Git inicializado
✅ Conta no GitHub
✅ Conta na Vercel (gratuita)

## 📋 Passo a Passo para Deploy

### 1. Commit das Mudanças

```bash
git add .
git commit -m "Preparando aplicação para deploy em produção"
```

### 2. Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Nome do repositório: `revisao-espacada-pro` (ou outro nome de sua preferência)
3. **NÃO** inicialize com README, .gitignore ou licença
4. Clique em "Create repository"

### 3. Conectar ao GitHub

```bash
git remote add origin https://github.com/SEU-USUARIO/revisao-espacada-pro.git
git branch -M main
git push -u origin main
```

**Substitua `SEU-USUARIO` pelo seu nome de usuário do GitHub!**

### 4. Deploy na Vercel

#### Opção A: Via Website (Recomendado)

1. Acesse: https://vercel.com/new
2. Conecte sua conta do GitHub
3. Selecione o repositório `revisao-espacada-pro`
4. Configure as variáveis de ambiente:
   - Clique em "Environment Variables"
   - Adicione as seguintes variáveis (pegue do seu arquivo `.env`):

   ```
   VITE_SUPABASE_URL = [seu-projeto].supabase.co
   VITE_SUPABASE_ANON_KEY = sua-chave-anon-aqui
   ```

5. Clique em "Deploy"

#### Opção B: Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel

# Seguir prompts e adicionar variáveis de ambiente quando solicitado
```

### 5. Configurar Variáveis de Ambiente na Vercel

**IMPORTANTE:** Suas variáveis de ambiente do arquivo `.env` local precisam ser configuradas na Vercel:

1. No Dashboard da Vercel, vá em:
   - Seu Projeto > Settings > Environment Variables

2. Adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

3. Para cada variável:
   - Cole o valor do seu `.env` local
   - Selecione "Production", "Preview" e "Development"
   - Clique em "Add"

4. **Redeploy** o projeto após adicionar as variáveis:
   - Deployments > ⋯ (três pontos) > Redeploy>

### 6. Configurar Redirect URLs no Supabase

1. Acesse seu projeto Supabase: https://app.supabase.com
2. Vá em: Authentication > URL Configuration
3. Adicione em "Site URL":
   ```
   https://seu-projeto.vercel.app
   ```
4. Adicione em "Redirect URLs":
   ```
   https://seu-projeto.vercel.app/**
   http://localhost:5173/**
   ```

### 7. Testar a Aplicação

Após o deploy:
1. Acesse a URL fornecida pela Vercel (ex: `https://revisao-espacada-pro.vercel.app`)
2. Teste o login/cadastro
3. Verifique se todas as funcionalidades estão funcionando

## 🔧 Troubleshooting

### Erro: "Missing Supabase environment variables"
- Verifique se as variáveis foram adicionadas corretamente na Vercel
- Faça um redeploy após adicionar as variáveis

### Erro de Autenticação
- Verifique se adicionou as Redirect URLs no Supabase
- Confirme que a Site URL está correta

### Página 404 ao navegar
- Isso já está resolvido com o `vercel.json` criado!

## 📱 Próximos Passos

Após o deploy bem-sucedido:

1. **Domínio Personalizado** (Opcional):
   - Vercel > Seu Projeto > Settings > Domains
   - Adicione seu domínio personalizado

2. **Analytics**:
   - Vercel > Seu Projeto > Analytics
   - Ative o Vercel Analytics (gratuito)

3. **Performance**:
   - Monitore o desempenho no Vercel Dashboard
   - Use o Lighthouse para otimizações

## 🎉 Conclusão

Sua aplicação estará disponível em:
- **URL Temporária**: `https://seu-projeto.vercel.app`
- **Atualizações Automáticas**: Cada push no GitHub => Deploy automático!

---

**Dúvidas?** Verifique a documentação:
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs
