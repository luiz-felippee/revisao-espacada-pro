# 📱 Guia: Como Gerar o APP Android (APK)

## ✅ O que já foi configurado automaticamente:

- ✅ Capacitor instalado
- ✅ Projeto Android criado em `/android`
- ✅ Build de produção gerado em `/dist`

---

## 🚀 OPÇÃO 1: Gerar APK via Android Studio (RECOMENDADO)

### 📋 Pré-requisitos:
1. **Instale o Android Studio**: https://developer.android.com/studio
2. **Instale o Java JDK 17**: https://www.oracle.com/java/technologies/downloads/

### 🔧 Passos:

1. **Abra o Android Studio**

2. **Abra o projeto Android**:
   - No Android Studio, clique em `File` → `Open`
   - Navegue até: `c:\Users\luizf\antigraty\study-panel\android`
   - Clique em `OK`

3. **Aguarde a sincronização** (primeira vez demora ~10 min)

4. **Gere o APK**:
   - Clique em `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - Aguarde a compilação

5. **Localize o APK**:
   - Após concluir, clique em `locate` na notificação
   - Ou vá em: `android\app\build\outputs\apk\debug\app-debug.apk`

6. **Transfira para o celular**:
   - Via cabo USB, Bluetooth, Google Drive, etc.
   - Instale no Android (ative "Instalar apps de fontes desconhecidas")

---

## ⚡ OPÇÃO 2: Gerar APK via Linha de Comando (RÁPIDO)

Se já tiver Android Studio instalado:

```bash
# 1. Navegue até a pasta android
cd android

# 2. Gere o APK debug (para testes)
gradlew assembleDebug

# 3. APK estará em:
# android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 🌐 OPÇÃO 3: PWA (Mais Simples) - SEM NÉCESSIDADE DE BUILD

Seu app **JÁ É UM PWA**, então o usuário pode:

1. Acessar: https://revisao-espacada-pro.vercel.app
2. **No Chrome/Edge (Android)**:
   - Menu → "Adicionar à tela inicial" ou "Instalar app"
3. **No Safari (iOS)**:
   - Botão Compartilhar → "Adicionar à Tela de Início"

Pronto! O app funciona **100% offline** e aparece como app nativo!

---

## 📦 OPÇÃO 4: Publicar na Google Play Store

Para publicar oficialmente:

1. **Crie uma conta Google Play Developer** ($25 único)
2. **Gere APK/AAB assinado**:
   ```bash
   cd android
   gradlew bundleRelease
   ```
3. **Suba o arquivo** no Google Play Console
4. **Preencha os metadados** (descrição, screenshots, etc.)
5. **Envie para revisão**

---

## 🍎 Para iOS:

**Requisitos**:
- MacOS (obrigatório)
- Xcode instalado
- Conta Apple Developer ($99/ano)

**Comando**:
```bash
npx cap add ios
npx cap open ios
```

---

## 🔄 Atualizando o app após mudanças no código:

```bash
# 1. Build do projeto web
npm run build

# 2. Copiar para Android
npx cap sync android

# 3. Abrir Android Studio e recompilar
npx cap open android
```

---

## ❓ Problemas Comuns:

### "ANDROID_HOME not found"
- Configure a variável de ambiente ANDROID_HOME apontando para o SDK do Android

### "Java version incompatível"
- Use Java 17 (não 21 ou 11)

### "App não instala no celular"
- Ative "Fontes desconhecidas" nas configurações do Android
- Use `gradlew assembleDebug` em vez de `assembleRelease`

---

## 📞 Suporte:

- Documentação Capacitor: https://capacitorjs.com/docs
- Fórum: https://forum.ionicframework.com/

Boa sorte! 🚀
