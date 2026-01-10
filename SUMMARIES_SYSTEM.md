# Sistema de Resumos & Timeline

## 📋 Visão Geral

O Sistema de Resumos fornece uma timeline centralizada e visual de todas as atividades do usuário, incluindo:
- 🔄 **Revisões** - Acompanhamento de revisões espaçadas
- 🎯 **Metas** - Progresso e atualizações de metas
- ⏱️ **Sessões de Foco** - Pomodoros e sessões de estudo
- ✅ **Conclusões** - Tarefas e objetivos concluídos
- 📝 **Notas** - Anotações importantes

## 🎨 Componentes

### Timeline
```tsx
import { Timeline } from '@/components/timeline';

<Timeline 
  items={summaries} 
  emptyMessage="Suas atividades aparecerão aqui"
/>
```

### TimelineItem
Renderiza individualmente cada entrada de resumo com animações e estilo premium.

## 📊 Tipos

```typescript
interface SummaryEntry {
  id: string;
  timestamp: string; // ISO 8601
  type: 'review' | 'goal' | 'session' | 'completion' | 'progress' | 'note';
  title?: string;
  description?: string;
  number?: number; // Número da revisão ou progresso
  metadata?: {
    reviewNumber?: number;
    goalProgress?: number;
    sessionDuration?: number;
    status?: string;
    [key: string]: any;
  };
}
```

## 🔧 Como Usar

### 1. Adicionar Resumo de Revisão

```typescript
import { SummaryHelpers } from '@/types/summary-helpers';

// Em StudyContext ou ThemeList
const handleCompleteReview = (subthemeId: string, reviewNumber: number) => {
  const subtheme = findSubtheme(subthemeId);
  
  // Adicionar resumo
  const updatedSummaries = SummaryHelpers.addReview(
    subtheme.summaries || [],
    reviewNumber,
    `${reviewNumber}ª revisão concluída com sucesso`
  );
  
  // Atualizar subtheme
  updateSubtheme(subthemeId, { summaries: updatedSummaries });
};
```

### 2. Adicionar Resumo de Progresso de Meta

```typescript
const handleUpdateGoalProgress = (goalId: string, newProgress: number) => {
  const goal = findGoal(goalId);
  
  const updatedSummaries = SummaryHelpers.addGoalProgress(
    goal.summaries || [],
    newProgress,
    `Meta atualizada para ${newProgress}%`
  );
  
  updateGoal(goalId, { 
    progress: newProgress,
    summaries: updatedSummaries 
  });
};
```

### 3. Adicionar Resumo de Sessão de Foco

```typescript
const handleCompleteFocusSession = (itemId: string, duration: number) => {
  const item = findItem(itemId); // Pode ser task, goal ou subtheme
  
  const updatedSummaries = SummaryHelpers.addSession(
    item.summaries || [],
    duration,
    `Sessão de foco de ${duration} minutos concluída`
  );
  
  updateItem(itemId, { summaries: updatedSummaries });
};
```

### 4. Adicionar Resumo de Conclusão

```typescript
const handleCompleteTask = (taskId: string) => {
  const task = findTask(taskId);
  
  const updatedSummaries = SummaryHelpers.addCompletion(
    task.summaries || [],
    `Tarefa "${task.title}" concluída!`
  );
  
  updateTask(taskId, { 
    status: 'completed',
    summaries: updatedSummaries 
  });
};
```

### 5. Adicionar Nota

```typescript
const handleAddNote = (itemId: string, title: string, content: string) => {
  const item = findItem(itemId);
  
  const updatedSummaries = SummaryHelpers.addNote(
    item.summaries || [],
    title,
    content
  );
  
  updateItem(itemId, { summaries: updatedSummaries });
};
```

## 🎯 Integração com Contextos Existentes

### StudyContext

Adicione resumos quando:
- ✅ Uma revisão for completada (`completeReview`)
- ✅ Um tema/subtema for concluído
- ✅ Conteúdo for salvo com notas importantes

### PomodoroContext

Adicione resumos quando:
- ✅ Uma sessão de foco for concluída
- ✅ Um pomodoro for finalizado com sucesso

### Funções de Tarefas e Metas

Adicione resumos quando:
- ✅ Uma tarefa for concluída
- ✅ Uma meta for atualizada
- ✅ Um checklist item for marcado

## 📱 Página de Resumos

A página `/summaries` exibe todos os resumos de todas as fontes:
- Tarefas (`tasks.summaries`)
- Metas (`goals.summaries`)
- Temas (`themes.summaries`)
- Subtemas (`subthemes.summaries`)

### Funcionalidades
- 🔍 Busca por texto
- 🎨 Filtros por tipo de evento
- 📊 Contadores por categoria
- ⏰ Ordenação cronológica (mais recente primeiro)
- 🎭 Animações suaves ao adicionar/remover

## 💾 Persistência

Os resumos são armazenados como parte dos objetos:
- `Task.summaries`
- `Goal.summaries`
- `Theme.summaries`
- `Subtheme.summaries`

E sincronizados automaticamente com Supabase através do `SyncService`.

## 🎨 Customização

Cada tipo de resumo tem sua própria cor e ícone:
- 🟣 **Revisão** - Roxo (`purple-500`)
- 🔵 **Meta** - Azul (`blue-500`)
- 🟠 **Foco** - Laranja (`orange-500`)
- 🟢 **Conclusão** - Verde (`green-500`)
- 🟡 **Nota** - Amarelo (`yellow-500`)

## 🚀 Próximos Passos

1. **Adicionar resumos automaticamente** nos contextos existentes
2. **Criar notificações** quando eventos importantes acontecerem
3. **Exportar timeline** em PDF ou outros formatos
4. **Adicionar gráficos** de atividades ao longo do tempo
5. **Filtros avançados** por data, projeto, tema, etc.

## 📝 Exemplo Completo

```typescript
// No StudyContext, ao completar uma revisão
import { SummaryHelpers } from '@/types/summary-helpers';

export const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const completeReview = async (subthemeId: string, reviewNumber: number) => {
    const theme = themes.find(t => 
      t.subthemes.some(st => st.id === subthemeId)
    );
    
    if (!theme) return;
    
    const subtheme = theme.subthemes.find(st => st.id === subthemeId);
    if (!subtheme) return;
    
    // Adicionar resumo
    const updatedSummaries = SummaryHelpers.addReview(
      subtheme.summaries || [],
      reviewNumber,
      `${reviewNumber}ª revisão do tópico "${subtheme.title}" concluída`
    );
    
    // Atualizar a revisão e os resumos
    const updatedReviews = subtheme.reviews.map(r =>
      r.number === reviewNumber
        ? { ...r, status: 'completed' as const, completedAt: new Date().toISOString() }
        : r
    );
    
    const updatedSubtheme = {
      ...subtheme,
      reviews: updatedReviews,
      summaries: updatedSummaries
    };
    
    // Salvar no estado e no banco
    updateTheme(theme.id, {
      subthemes: theme.subthemes.map(st =>
        st.id === subthemeId ? updatedSubtheme : st
      )
    });
  };
  
  // ... resto do contexto
};
```
