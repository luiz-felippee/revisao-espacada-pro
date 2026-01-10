# CI/CD & Performance - Setup Guide

## 🔄 CI/CD Pipeline

### GitHub Secrets (Required)
Para o CI/CD funcionar, configure os seguintes secrets no GitHub:

1. Vá para: **Settings** → **Secrets and variables** → **Actions**
2. Adicione os secrets:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VERCEL_TOKEN=xxxxxxxxx
VERCEL_ORG_ID=team_xxxxxxxxx
VERCEL_PROJECT_ID=prj_xxxxxxxxx
```

### Como Obter Vercel Tokens
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Link project
vercel link

# 4. Ver org/project IDs
cat .vercel/project.json
```

### Workflow Trigger
```
Push to main → Auto deploy
Pull Request → Build test only
```

---

## 📦 Bundle Optimization

### Analisar Bundle
```bash
npm run build
# Abre stats.html automaticamente
```

### Otimizações Aplicadas
1. **Tree-shaking** - Remove código não usado
2. **Code splitting** - Lazy loading de rotas
3. **Bundle analysis** - Visualize dependências

### Metas
- Initial bundle: < 500KB (gzipped)
- LCP: < 2.5s
- FCP: < 1.8s

---

## 📊 Performance Monitoring

### Web Vitals no Console
Abra DevTools Console e veja:
```
[Web Vitals] LCP: 1.2s
[Web Vitals] FID: 50ms
[Web Vitals] CLS: 0.05
```

### Metas (Core Web Vitals)
- **LCP** (Largest Contentful Paint): < 2.5s ✅
- **FID** (First Input Delay): < 100ms ✅
- **CLS** (Cumulative Layout Shift): < 0.1 ✅
- **FCP** (First Contentful Paint): < 1.8s ✅
- **TTFB** (Time to First Byte): < 800ms ✅

---

## ✅ Verification Checklist

### CI/CD
- [ ] Push para main
- [ ] Ver workflow no GitHub Actions
- [ ] Verificar deploy automático

### Bundle
- [ ] Run `npm run build`
- [ ] Ver stats.html
- [ ] Verificar size < 500KB

### Monitoring
- [ ] Abrir app
- [ ] F12 → Console
- [ ] Ver web vitals logs
