# 🔧 Problema: Vite Não Carrega .env

## Diagnóstico
- ✅ Arquivo `.env` existe e tem conteúdo correto
- ❌ Vite não está carregando as variáveis
- ❌ App trava com "Missing Supabase environment variables"

## Solução: Hard Restart Completo

###  Passos:

1. **Feche TODOS os terminais** com `npm run dev`
   - Ctrl+C em cada terminal

2. **Feche o VS Code completamente**
   - File → Exit

3. **Abra o VS Code novamente**

4. **Abra novo terminal** e rode:
```bash
npm run dev
```

5. **Abra** http://localhost:5173

---

## Se AINDA não funcionar:

Crie arquivo `.env.development`:
```bash
echo VITE_SUPABASE_URL=https://tspghelrafvagmzfbeup.supabase.co > .env.development
echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzcGdoZWxyYWZ2YWdtemZiZXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMTU5NDgsImV4cCI6MjA4Mjg5MTk0OH0.m1TAPKt4-XW_i56Clxl9lUGnZPQxPG1SfdsYCP96O70 >> .env.development
```

E reinicie novamente!
