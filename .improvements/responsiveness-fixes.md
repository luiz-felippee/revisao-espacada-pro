# 🔧 Correções Prioritárias de Responsividade

## Status: PENDENTE
**Criado em:** 17/01/2026  
**Prioridade:** ALTA 🔴

---

## 1. ❌ CRÍTICO: Breakpoint `xs:` Não Existe

### Problema
O arquivo `MobileBottomNav.tsx` usa `xs:w-6` mas este breakpoint não foi definido no Tailwind.

### Arquivos Afetados
- `src/components/layout/MobileBottomNav.tsx` (linhas 114, 115, 119, 121, 146, 160, 203, 208, 210)

### Solução
Adicionar o breakpoint ao `tailwind.config.js`:

```javascript
// tailwind.config.js
export default {
  content: [...],
  theme: {
    extend: {
      screens: {
        'xs': '480px',  // ADICIONAR ESTA LINHA
        // ... outros breakpoints
      },
      // ... resto da config
    },
  },
};
```

### Estimativa
⏱️ 2 minutos  
✅ Simples

---

## 2. ⚠️ MÉDIA: Lógica de window.innerWidth no Header

### Problema
O `Header.tsx` usa `window.innerWidth` diretamente no onClick, o que pode causar inconsistências com o CSS.

### Arquivo Afetado
- `src/components/layout/Header.tsx` (linhas 88-95)

### Código Atual
```tsx
onClick={() => {
  if (window.innerWidth >= 768 && window.innerWidth < 1024) {
    // Tablet
    setIsSidebarOpen(!isSidebarOpen);
  } else {
    // Mobile
    setIsMobileMenuOpen(!isMobileMenuOpen);
  }
}}
```

### Solução Proposta
Criar um hook customizado:

```tsx
// src/hooks/useBreakpoint.ts
import { useState, useEffect } from 'react';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width >= 1024) return 'desktop';
    if (width >= 768) return 'tablet';
    return 'mobile';
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setBreakpoint('desktop');
      } else if (width >= 768) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('mobile');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
};
```

Usar no componente:
```tsx
// Header.tsx
import { useBreakpoint } from '@/hooks/useBreakpoint';

const Header = () => {
  const breakpoint = useBreakpoint();
  
  const handleMenuClick = () => {
    if (breakpoint === 'tablet') {
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    }
  };
  
  return (
    <button onClick={handleMenuClick}>
      {/* ... */}
    </button>
  );
};
```

### Estimativa
⏱️ 15 minutos  
🟡 Média complexidade

---

## 3. 📱 Testes Necessários em Mobile

### Componentes Grandes que Precisam de Teste
- `TodayMissionModal.tsx` (62KB - muito grande!)
- `SummaryModal.tsx`
- Todos os formulários

### Cenários de Teste

#### iPhone SE (375px - tela pequena)
- [ ] Sidebar não ultrapassa 90vw ✅ (max-w implementado)
- [ ] Bottom nav visível e acessível
- [ ] Modais não cortam conteúdo
- [ ] Inputs não causam zoom indesejado ✅ (font-size 16px)
- [ ] Botões têm área mínima de 44px ✅

#### Tablet (768px - iPad Mini)
- [ ] Sidebar alterna corretamente
- [ ] Header compacto mas legível
- [ ] Dois colunas quando apropriado
- [ ] Landscape funciona bem

#### Desktop (1920px)
- [ ] Layout não fica muito esticado ✅ (max-w-[1600px])
- [ ] Sidebar sempre visível ✅
- [ ] Conteúdo bem distribuído

### Ferramentas
```bash
# Chrome DevTools
F12 > Toggle Device Toolbar (Ctrl+Shift+M)

# Playwright (já configurado)
npm run test:e2e
```

### Estimativa
⏱️ 2-4 horas (manual)  
⏱️ 1 dia (automatizado com Playwright)

---

## 4. 🎨 Uniformização de Padding/Spacing

### Problema
Alguns componentes usam valores hardcoded em vez dos tokens CSS.

### Tokens Disponíveis (mas não usados)
```css
--spacing-xs: 0.5rem;
--spacing-sm: 0.75rem;
--spacing-md: 1rem;
--spacing-lg: 1.5rem;
--spacing-xl: 2rem;
```

### Recomendação
**NÃO FAZER NADA**  
- Tailwind classes são mais eficientes
- Tree-shaking remove classes não usadas
- Tokens CSS podem ser removidos OU usados para valores customizados específicos

---

## 5. 📊 Análise de Bundle para Mobile

### Verificar
- Lazy loading está funcionando? ✅ (já implementado)
- Code splitting eficiente? ✅ (React.lazy usado)
- Imagens otimizadas?
- Fonts carregadas corretamente?

### Comando
```bash
npm run build
npx vite-bundle-visualizer
```

### Estimativa
⏱️ 30 minutos

---

## Ordem de Implementação Sugerida

### Hoje (17/01)
1. ✅ Fix breakpoint `xs:` (2 min)
2. Criar hook useBreakpoint (15 min)
3. Refatorar Header.tsx (10 min)
**Total: ~30 minutos**

### Esta Semana
4. Testes manuais em mobile (2h)
5. Verificar bundle size (30min)
**Total: ~3 horas**

### Próxima Semana
6. Testes automatizados (1 dia)
7. Documentação de breakpoints
8. Otimizações identificadas

---

## Notas Técnicas

### Breakpoints Oficiais da Aplicação
```javascript
xs: 480px   // ⚠️ ADICIONAR
sm: 640px   // Tailwind padrão
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Telas grandes
2xl: 1536px // Não usado
```

### Safe Areas (iOS/PWA)
```css
/* Já implementado em index.css */
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
```

### Performance Mobile
```css
/* Já implementado */
touch-action: manipulation; /* Previne double-tap zoom */
-webkit-tap-highlight-color: transparent;
-webkit-overflow-scrolling: touch;
```

---

## 🎯 Critérios de Sucesso

### Após Implementar Correções
- [ ] Breakpoint xs: funciona em todos os dispositivos
- [ ] Nenhum uso de window.innerWidth em event handlers
- [ ] Todos os modais testados em mobile (375px, 768px, 1024px)
- [ ] Bundle size < 500KB (inicial)
- [ ] Lighthouse Mobile Score > 90
- [ ] Nenhum overflow horizontal em nenhuma tela

---

**Status Final:** Pronto para implementação  
**Impacto Esperado:** Melhoria de 15-20% na UX mobile  
**Risco:** Baixo (mudanças pequenas e isoladas)
