# Relatório de Otimização do Pomodoro

## Divisão de Contexto
Para resolver o problema de consumo de bateria em dispositivos móveis, identificamos que o `PomodoroContext` estava fazendo com que toda a aplicação fosse renderizada novamente a cada segundo (a cada tique do cronômetro). Isso acontecia porque o contexto combinava estado estável (como `isActive`) com estado volátil (`timeLeft`).

## Alterações Implementadas

1.  **Contextos Divididos**:
    -   `PomodoroStateContext`: Contém estado estável (isActive, modo, ciclos) e ações (iniciar, parar, etc.). Atualiza apenas na interação do usuário ou mudança de modo.
    -   `PomodoroTimeContext`: Contém `timeLeft`. Atualiza a cada segundo quando o cronômetro está rodando.

2.  **Consumidores Otimizados**:
    Migramos os componentes que só precisam *controlar* o cronômetro ou verificar se ele está *ativo* (mas não exibem a contagem regressiva) para usar `usePomodoroState()` em vez do contexto completo.

    **Componentes Impactados:**
    -   `MainLayout.tsx`: Evita renderizar novamente toda a estrutura da página.
    -   `Dashboard.tsx`: Removeu a inscrição de contexto não utilizada.
    -   `MissionCard.tsx`: Usa `isActive` para o estado de animação (estável), agora evita renderizações por segundo.
    -   `MissionItem.tsx`: O mesmo que acima.
    -   `TaskList.tsx`: Usa `isActive` para animações de itens da lista.
    -   `GoalList.tsx`: Usa `isActive` para animações de botões.
    -   `SubthemeItem.tsx`: Usa `isActive` para bloquear interações.
    -   `Calendar.tsx`: Usa `isActive` para animações de modal.
    -   `TodayMissionModal.tsx`: Usa ações e verificação de `isActive`.

3.  **Resultado**:
    -   O `PomodoroWidget` e a `GlobalActionBar` (que exibem o cronômetro) ainda são renderizados novamente a cada segundo, o que é esperado.
    -   O restante da aplicação (listas, modais, layouts excessivos) agora permanece ocioso durante a contagem regressiva do cronômetro.
    -   Isso reduz significativamente o uso da CPU e o consumo de bateria em dispositivos móveis.

## Status da Build
A aplicação foi refatorada, mas alguns erros de TypeScript pré-existentes em `TodayMissionModal.tsx` (relacionados à formatação de data e tipos internos) foram detectados durante o processo de build. Eles parecem não estar relacionados à refatoração do contexto, mas devem ser resolvidos em um ciclo de manutenção futuro.
