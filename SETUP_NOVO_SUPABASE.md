 # 🚀 Setup Novo Supabase - Guia Completo

## Passo 1: Criar Nova Conta

1. Vá para https://supabase.com
2. Clique em "Start your project"
3. Use um **novo email** (Gmail, Outlook, etc)
4. Crie senha e confirme email

---

## Passo 2: Criar Novo Projeto

1. Clique em "New Project"
2. **Nome**: `study-panel` (ou qualquer nome)
3. **Database Password**: Anote bem! Você vai precisar
4. **Region**: `South America (São Paulo)` (mais próximo do Brasil)
5. Clique em "Create new project"
6. ⏳ Aguarde ~2 minutos para o projeto inicializar

---

## Passo 3: Executar SQL para Criar Tabelas

### 3.1 Ir para SQL Editor
1. No menu esquerdo, clique em "SQL Editor"
2. Clique em "New query"

### 3.2 Executar o Arquivo de Migração

Nós criamos um arquivo consolidado com TUDO que você precisa (Tabelas, RLS, Índices e Triggers).

1. Abra o arquivo: `supabase/migrations/20240101_initial_schema.sql` (está na pasta do seu projeto)
2. Copie TODO o conteúdo deste arquivo.
3. Cole no "SQL Editor" do Supabase.
4. Clique em "RUN".

> **Nota**: Este arquivo contém índices otimizados para performance e todas as regras de segurança necessárias.

---

## Passo 4: Verificação Automática

Você pode rodar este script para confirmar se tudo foi criado corretamente:

```bash
npx tsx scripts/verify_supabase_setup.ts
```

Se aparecer "DATABASE SETUP VERIFIED", seu banco está pronto!

---


---



---

## Passo 6: Pegar Credenciais do Novo Projeto

1. No menu esquerdo, clique em "Project Settings" (ícone de engrenagem)
2. Clique em "API"
3. **Copie**:
   - **Project URL**: `https://tspghelrafvagmzfbeup.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## Passo : Atualizar `.env` Local

Abra o arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://tspghelrafvagmzfbeup.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Salve o arquivo!**

---

## Passo 8: Reiniciar Aplicação

```bash
# Parar servidor atual (Ctrl+C no terminal)
# Depois:
npm run dev
```

---

## ✅ Verificação Final

1. Abra http://localhost:5173
2. Faça login (ou crie nova conta)
3. Crie uma tarefa de teste
4. Abra o console (F12)
5. **Verifique**: SEM erros 400 do Supabase!

---

## 🎉 Pronto!

Sua aplicação agora está conectada ao **novo Supabase** com quota zerada!

Os dados do **localStorage** continuam funcionando normalmente e serão sincronizados conforme você for usando.

---

**Dúvidas?** Me chame! 🚀
