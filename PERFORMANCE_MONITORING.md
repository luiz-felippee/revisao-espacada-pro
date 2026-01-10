# 📊 Performance Monitoring Guide

## Overview

O app possui **dupla camada** de performance monitoring:
1. **Web Vitals** (Dev) - Console logging
2. **Vercel Analytics** (Prod) - Dashboard completo

---

## Web Vitals (Local)

### Implementado em: `src/utils/webVitals.ts`

### Métricas Rastreadas
```typescript
- CLS (Cumulative Layout Shift)
- INP (Interaction to Next Paint)
- FCP (First Contentful Paint)
- LCP (Largest Contentful Paint)
- TTFB (Time to First Byte)
```

### Console Output (Dev Only)
```javascript
📊 Web Vitals tracking initialized

[Web Vitals] LCP: 1.2s ✅
[Web Vitals] INP: 50ms ✅
[Web Vitals] CLS: 0.05 ✅
[Web Vitals] FCP: 0.9s ✅
[Web Vitals] TTFB: 400ms ✅
```

### Metas
```
LCP: < 2.5s  ✅
INP: < 200ms ✅
CLS: < 0.1   ✅
FCP: < 1.8s  ✅
TTFB: < 800ms ✅
```

---

## Vercel Analytics (Production)

### Packages Instalados
```bash
@vercel/analytics        # Core analytics
@vercel/speed-insights   # Performance tracking
```

### Integração: `src/App.tsx`
```typescript
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

// No final do App
<Analytics />
<SpeedInsights />
```

### Features
✅ Web Vitals automático  
✅ Page views  
✅ User sessions  
✅ Device breakdown  
✅ Geo distribution  
✅ Real User Monitoring (RUM)  

---

## Vercel Dashboard

### Acessar
```
1. Login em vercel.com
2. Selecionar projeto
3. Analytics tab
```

### Dados Disponíveis

#### Performance
```
- LCP, FCP, CLS, INP, TTFB
- Score geral (0-100)
- Trends históricos
- Device breakdown
```

#### Traffic
```
- Page views
- Unique visitors
- Session duration
- Top pages
```

#### Demographics
```
- Geo location
- Device types
- Browsers
- OS breakdown
```

---

## Custom Events (Opcional)

### Track Custom Events
```typescript
import { track } from '@vercel/analytics';

// Exemplo
track('button_click', {
  button: 'export_data',
  format: 'json'
});

track('feature_used', {
  feature: 'pomodoro',
  duration: '25min'
});
```

### No App
```typescript
// Onde quiser rastrear
import { track } from '@vercel/analytics';

const handleExport = () => {
  exportData();
  track('data_exported', { format: 'json' });
};
```

---

## Lighthouse Score

### Run Locally
```bash
npm run build
npm run preview
# Open Chrome DevTools → Lighthouse
```

### Metas
```
Performance: 90+ ✅
SEO: 90+ ✅
Accessibility: 85+ ✅
Best Practices: 90+ ✅
PWA: 90+ ✅
```

---

## Performance Budget

### Bundle Sizes
```
Total (gzipped): < 200KB ✅
LCP element: < 50KB ✅
Initial JS: < 150KB ✅
```

### Network
```
Total requests: < 30 ✅
Images optimized: WebP ✅
Fonts: Preloaded ✅
```

---

## Monitoring Checklist

### Development
- [ ] Check console for Web Vitals
- [ ] Verify metrics < thresholds
- [ ] No console errors
- [ ] Network tab clean

### Production
- [ ] Deploy to Vercel
- [ ] Wait 24h for data
- [ ] Check Analytics dashboard
- [ ] Verify Web Vitals green
- [ ] Review traffic patterns

---

## Troubleshooting

### Web Vitals não aparecem
```
✅ Check: import './utils/webVitals' em main.tsx
✅ Check: initWebVitals() é chamado
✅ Check: DEV mode (só mostra em dev)
```

### Vercel Analytics vazio
```
✅ Check: Deployed to Vercel
✅ Check: Analytics enabled no projeto
✅ Check: Wait 24-48h para dados
✅ Check: Visitou o site em prod
```

### Scores baixos
```
✅ Run: npm run build → bundle analysis
✅ Check: Lazy loading implementado
✅ Check: Images otimizadas
✅ Check: Terser minification ativo
```

---

## Resources

### Docs
- [Web Vitals](https://web.dev/vitals/)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Core Web Vitals](https://web.dev/articles/vitals)

### Tools
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/)

---

**Monitoramento completo! 📊**
