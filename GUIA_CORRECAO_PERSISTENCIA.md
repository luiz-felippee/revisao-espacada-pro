# 🔧 GUIA DE VERIFICAÇÃO E CORREÇÃO - Problema de Persistência de Dados

## 📊 Sintomas Relatados
- ✅ Desktop: Dados são criados mas não aparecem ao recarregar
- ✅ Mobile: Dados não aparecem
- ✅ Sincronização: Dados criados não ficam salvos ao sair e voltar

## 🔍 Diagnóstico Passo a Passo

### 1. Verificar Autenticação
O sistema precisa de um usuário autenticado para sincronizar com o Supabase.

**Verificar:**
```javascript
// Abra o Console do navegador (F12) e execute:
localStorage.getItem('app_user')
```

**Status Esperado:**
- Se retornar `null` → **PROBLEMA**: Você não está autenticado
- Se retornar um objeto JSON com `id` → ✅ Autenticado

**Solução se não autenticado:**
1. Faça login ou crie uma conta no sistema
2. Ou use o modo Guest (será criado automaticamente)

---

### 2. Verificar Fila de Sincronização
**Verificar:**
```javascript
// No console do navegador:
localStorage.getItem('sync_queue_v1')
```

**Status Esperado:**
- Se retornar `[]` (array vazio) → ✅ Fila processada com sucesso
- Se retornar `null` → Sistema nunca tentou sincronizar
- Se retornar array com itens → 🔄 Ainda processando OU ❌ Travado

**Se a fila estiver travada:**
```javascript
// Limpar fila manualmente:
localStorage.removeItem('sync_queue_v1')
localStorage.setItem('sync_queue_version', 'v2')
```

---

### 3. Verificar Conexão com Supabase
**Verificar:**
```javascript
// No console:
fetch('https://seu-projeto.supabase.co/rest/v1/', {
  headers: {
    'apikey': 'sua-chave-publica'
  }
}).then(r => console.log('Supabase:', r.status))
```

**Status Esperado:**
- `200` ou `404` → ✅ Supabase acessível
- Erro de rede → ❌ Sem conexão com Supabase

---

### 4. Verificar Dados Locais
**Verificar:**
```javascript
// Tasks
JSON.parse(localStorage.getItem('study_tasks_backup') || '[]').length

// Goals  
JSON.parse(localStorage.getItem('study_goals_backup') || '[]').length

// Themes
JSON.parse(localStorage.getItem('study_themes_backup') || '[]').length
```

**Status Esperado:**
- Se retornar números > 0 → Dados salvos localmente
- Se retornar 0 → Nenhum dado local

---

### 5. Verificar Logs de Sincronização
**Verificar:**
Abra o Console (F12) e procure por:
- `[TaskProvider]` 
- `[SyncQueue]`
- `[Supabase]`

**Possíveis Erros:**
- `401 Unauthorized` → Problema de autenticação
- `RLS policy violation` → Configuração de segurança do Supabase
- `Network error` → Sem internet ou Supabase offline
- `23505 duplicate key` → Tentando criar item que já existe

---

## ✅ SOLUÇÕES RÁPIDAS

### Solução 1: Reautenticar
```javascript
// 1. Sair
// Clique em "Sair" no menu do aplicativo

// 2. Limpar cache
localStorage.clear()

// 3. Recarregar
location.reload()

// 4. Fazer login novamente
```

### Solução 2: Forçar Sincronização
```javascript
// No console:
SyncQueueService.processQueue(true)
```

### Solução 3: Verificar Variáveis de Ambiente
**Arquivo:** `.env` ou `.env.development`

**Deve conter:**
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica
```

**Verificar se está carregando:**
```javascript
// No console:
console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)
```

---

## 🛠️ CORREÇÃO DEFINITIVA (Se nada funcionar)

### Opção 1: Reset Completo do Sistema
```javascript
// ATENÇÃO: Isso apagará TODOS os dados locais!
// Use apenas se os dados não estiverem sincronizando de jeito nenhum

// 1. Backup (se tiver dados importantes)
const backup = {
  tasks: localStorage.getItem('study_tasks_backup'),
  goals: localStorage.getItem('study_goals_backup'),
  themes: localStorage.getItem('study_themes_backup')
}
console.log('Backup:', backup)

// 2. Limpar tudo
localStorage.clear()

// 3. Recarregar
location.reload()
```

### Opção 2: Verificar RLS (Row Level Security) no Supabase
Acesse o Supabase Dashboard e verifique se as políticas RLS estão ativas:

**Tabelas que precisam de RLS:**
- `tasks`
- `goals`
- `themes`
- `subthemes`
- `profiles`

**Políticas necessárias:**
```sql
-- Exemplo para tasks
CREATE POLICY "Users can CRUD own tasks"
ON tasks
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

---

## 📱 PROBLEMA ESPECÍFICO NO MOBILE

Se funciona no desktop mas não no mobile:

### 1. Verificar localStorage no Mobile
Alguns navegadores mobile podem ter restrições. Teste:
```javascript
try {
  localStorage.setItem('test', 'value')
  console.log(localStorage.getItem('test'))
  localStorage.removeItem('test')
  console.log('✅ localStorage OK')
} catch (e) {
  console.error('❌ localStorage bloqueado:', e)
}
```

### 2. Verificar Modo Anônimo/Privado
O modo anônimo pode bloquear localStorage. Certifique-se de estar em navegação normal.

### 3. Verificar Cache do Service Worker
```javascript
// Limpar cache do PWA:
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => reg.unregister())
  })
}
```

---

## 🆘 SE NADA FUNCIONAR

Abra as ferramentas de desenvolvedor no navegador (F12) e:

1. Vá em **Application** → **Local Storage**
2. Tire um screenshot de todas as chaves
3. Vá em **Console**
4. Execute: `JSON.parse(localStorage.getItem('sync_queue_v1'))`
5. Tire um screenshot do resultado

Envie essas informações para análise mais detalhada.
