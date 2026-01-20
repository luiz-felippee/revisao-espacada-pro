# 🔍 Diagnóstico de Sincronização entre Dispositivos

## Status da Implementação

✅ **Realtime Service**: Implementado e ativo
✅ **TaskProvider**: Configurado para receber atualizações em tempo real
✅ **GoalProvider**: Configurado para receber atualizações em tempo real  
✅ **ThemeProvider**: Configurado para receber atualizações em tempo real
✅ **AppProvider**: Inicializa o RealtimeService quando usuário faz login

## Como a Sincronização Funciona

```
Dispositivo A (Desktop)
    ↓
Cria/Edita Task → Salva no Supabase
    ↓
Supabase Postgres Change
    ↓
Realtime Broadcast
    ↓
Dispositivo B (Mobile) → Recebe evento → Refetch tasks → UI atualiza
```

## Possíveis Causas de Problemas

### 1. ⚠️ Cache do Navegador/PWA

**Problema**: Versão antiga do código em cache
**Solução**: 
```bash
# No navegador:
- Abra DevTools (F12)
- Application Tab → Clear Storage → Clear site data
- Hard refresh: Ctrl + Shift + R (Windows) ou Cmd + Shift + R (Mac)

# No mobile:
- Limpar cache do navegador
- Se for PWA, desinstalar e reinstalar
```

### 2. ⚠️ Supabase Realtime não habilitado

**Problema**: Tabelas não têm Realtime habilitado no Supabase
**Verificação**:
1. Acesse o Supabase Dashboard
2. Vá em Database → Replication
3. Verifique se as tabelas estão com Realtime ENABLED:
   - `tasks` ✅
   - `goals` ✅
   - `themes` ✅
   - `subthemes` ✅

### 3. ⚠️ Conexão de Internet

**Problema**: Dispositivo offline ou com conexão instável
**Verificação**:
- Verifique o ícone de status de sincronização no canto superior direito
- Deve mostrar "Online" quando conectado

### 4. ⚠️ Diferentes contas de usuário

**Problema**: Dispositivos logados com contas diferentes
**Verificação**:
- Confirme que o mesmo email está logado em ambos dispositivos
- Dados só sincronizam entre dispositivos da mesma conta

## Como Testar a Sincronização

### Teste Simples:
1. **Desktop**: Crie uma nova tarefa
2. **Mobile**: Aguarde 2-3 segundos
3. **Mobile**: A tarefa deve aparecer automaticamente

### Teste Avançado (Console):
```javascript
// Abra o Console (F12) em ambos dispositivos

// No Desktop:
console.log('User ID:', localStorage.getItem('sb-*-auth-token'));

// No Mobile:
console.log('User ID:', localStorage.getItem('sb-*-auth-token'));

// Devem ser iguais!
```

### Monitorar Logs do Realtime:
```javascript
// Cole no Console de cada dispositivo para ver os logs:
localStorage.setItem('debug', 'sync:*');
// Recarregue a página
```

## Comandos de Diagnóstico Manual

### Ver status dos canais Realtime:
```javascript
// Cole no console:
['tasks', 'goals', 'themes', 'subthemes'].forEach(table => {
  console.log(`${table}:`, RealtimeService.getChannelStatus(table));
});
```

### Forçar reconexão:
```javascript
// Cole no console:
window.location.reload();
```

## Solução Rápida (Reset Completo)

Se nada funcionar, faça um reset completo:

1. **Desktop**: Sair da conta (Logout)
2. **Mobile**: Sair da conta (Logout)
3. **Desktop**: Limpar cache do navegador
4. **Mobile**: Limpar cache do navegador
5. **Ambos**: Fazer login novamente com a mesma conta
6. **Ambos**: Aguardar 10 segundos para sincronização inicial

## Verificação de Configuração do Supabase

Execute este SQL no Supabase SQL Editor:

```sql
-- Ver políticas RLS das tabelas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('tasks', 'goals', 'themes', 'subthemes');

-- Ver se Realtime está habilitado
SELECT id, name FROM supabase_realtime.subscription;
```

## Ainda não funciona?

Se após todas essas verificações ainda não funcionar, o problema pode ser:
1. Limite de conexões Realtime do plano Supabase
2. Firewall bloqueando WebSocket (porta 443)
3. Extensão de navegador interferindo

**Tente**:
- Modo anônimo/privado do navegador
- Desabilitar extensões
- Testar em rede diferente (4G vs WiFi)
