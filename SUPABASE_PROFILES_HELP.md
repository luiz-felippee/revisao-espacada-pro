# Supabase Profiles - Preciso de Ajuda

## ⚠️ Problema

O erro Supabase 400 está relacionado à tabela `profiles`, mas não consigo determinar o schema correto.

## 🔍 Tentativas

1. **Tentativa 1 (Original)**: `.eq('id', userId)` → 400 Bad Request
2. **Tentativa 2**: `.eq('user_id', userId)` → Erro: "column profiles.user_id does not exist"

## ❓ Preciso Saber

**Por favor, verifique no Supabase Dashboard**:
1. Abra https://supabase.com
2. Selecione o projeto
3. Vá em "Table Editor" → "profiles"
4. **Me diga qual coluna contém o ID do usuário**

Pode ser:
- `id` (PK da tabela)
- `user_id` (FK para auth.users)
- `owner_id`
- Outro nome?

## 📸 Screenshot Necessário

Por favor, tire um screenshot da estrutura da tabela `profiles` mostrando:
- Nome das colunas
- Tipos
- Constraints (PK/FK)

---

**Status**: Aguardando informação do usuário para prosseguir
