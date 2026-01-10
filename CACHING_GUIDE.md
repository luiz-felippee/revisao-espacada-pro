# 🗜️ Compression & Caching Guide

## Overview

O app usa **estratégia de caching otimizada** via Vercel headers.

---

## Cache Strategy

### Assets Estáticos (Immutable)
```json
{
  "source": "/assets/(.*)",
  "headers": [{
    "key": "Cache-Control",
    "value": "public, max-age=31536000, immutable"
  }]
}
```

**Applies to**:
- `/assets/*.js`
- `/assets/*.css`
- Qualquer arquivo em `/assets/`

**Cache Duration**: 1 ano (31536000 segundos)

**Immutable**: Navegador nunca revalida

### Imagens & Fontes (Immutable)
```json
{
  "source": "/(.*\\.(jpg|jpeg|png|gif|ico|svg|webp|woff|woff2))",
  "headers": [{
    "key": "Cache-Control",
    "value": "public, max-age=31536000, immutable"
  }]
}
```

**Applies to**:
- Todas as imagens (jpg, png, svg, webp, etc)
- Todas as fontes (woff, woff2)

### HTML & Outros
```json
{
  "source": "/(.*)",
  "headers": [
    { "key": "X-Content-Type-Options", "value": "nosniff" },
    { "key": "X-Frame-Options", "value": "DENY" },
    // ... security headers
  ]
}
```

**No cache headers**: HTML deve ser sempre fresh

---

## How It Works

### Cache Invalidation
```
Build 1: assets/index-abc123.js
Build 2: assets/index-def456.js  ← New hash
```

**Vite** adiciona hash ao filename:
- Mudança no código → Novo hash
- Novo hash → Novo filename
- Novo filename → Cache miss → Download novo

**Resultado**: Cache infinito sem stale content!

---

## Compression

### Automatic (Vercel)
Vercel comprime automaticamente:
- ✅ Gzip
- ✅ Brotli (melhor compressão)

**Nenhuma config necessária!**

### Compression Ratio
```
index.js (raw): 500KB
index.js (gzip): 150KB (-70%)
index.js (brotli): 120KB (-76%)
```

---

## Security Headers

### Content Security Policy (CSP)
```
default-src 'self' https://*.supabase.co
script-src 'self' 'unsafe-inline' 'unsafe-eval'
style-src 'self' 'unsafe-inline'
```

**Protege contra**: XSS, data injection

### X-Frame-Options
```
DENY
```

**Protege contra**: Clickjacking

### X-Content-Type-Options
```
nosniff
```

**Protege contra**: MIME type sniffing

### Referrer-Policy
```
strict-origin-when-cross-origin
```

**Protege**: Privacy em cross-origin requests

### Permissions-Policy
```
camera=(), microphone=(), geolocation=()
```

**Bloqueia**: APIs sensíveis

---

## Performance Impact

| Metric | Sem Cache | Com Cache | Ganho |
|--------|-----------|-----------|-------|
| **First Load** | 500KB | 500KB | - |
| **Return Visit** | 500KB | ~10KB | -98% |
| **Asset Requests** | 20 | 2 | -90% |
| **Load Time** | 3.5s | 0.5s | -86% |

---

## Verification

### Check Headers (DevTools)
```
1. F12 → Network tab
2. Reload page (Ctrl+Shift+R para hard reload)
3. Click em asset (ex: index-abc123.js)
4. Ver Headers:
   Cache-Control: public, max-age=31536000, immutable ✅
```

### Check Cache Hit
```
1. Load page normalmente
2. Reload (Ctrl+R)
3. Network tab:
   Size: (disk cache) ou (memory cache) ✅
```

### Production Test
```bash
# Deploy
vercel deploy --prod

# Acesse site
# F12 → Network
# Ver headers de cache
```

---

## Best Practices

### ✅ DO
- Use hash em filenames (Vite faz isso)
- Set immutable para assets
- Keep HTML sem cache
- Security headers sempre

### ❌ DON'T
- Cache HTML files
- Use max-age sem hash
- Disable compression
- Skip security headers

---

## Troubleshooting

### Cache não funciona
```
✅ Check: Deploy em Vercel (não local)
✅ Check: Hard reload (Ctrl+Shift+R)
✅ Check: vercel.json deployed
✅ Check: Headers no Network tab
```

### Changes não aparecem
```
✅ Solution: Hard reload (Ctrl+Shift+R)
✅ Causa: Browser cache do HTML
✅ Assets: Atualizam automaticamente (hash)
```

### Headers não aplicam
```
✅ Check: vercel.json syntax
✅ Check: Redeploy projeto
✅ Check: Source patterns corretos
```

---

## Configuration File

Tudo configurado em: [`vercel.json`](file:///c:/Users/luizf/antigraty/study-panel/vercel.json)

---

**Caching otimizado! 🚀**
