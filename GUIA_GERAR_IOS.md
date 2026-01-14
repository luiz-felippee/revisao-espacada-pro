# 🍎 Guia: Como Gerar o APP iOS (.ipa)

## ✅ O que já foi configurado:

- ✅ Projeto iOS criado em `/ios`
- ✅ Capacitor configurado
- ✅ Build web pronto em `/dist`

---

## ⚠️ REQUISITOS OBRIGATÓRIOS:

### Para DESENVOLVER e TESTAR:
- ✅ **MacOS** (obrigatório - não funciona em Windows/Linux)
- ✅ **Xcode** (grátis na App Store do Mac)
- ✅ **Simulador iOS** (incluído no Xcode)

### Para PUBLICAR na App Store:
- ✅ Tudo acima +
- ✅ **Apple Developer Account** ($99/ano)
- ✅ **Dispositivo iOS físico** (para testes)

---

## 🚀 PASSOS (No Mac):

### 1. Abra o Projeto no Xcode

```bash
# Navegue até a pasta do projeto
cd /caminho/para/study-panel

# Abra o Xcode
npx cap open ios
```

Isso abrirá o Xcode automaticamente com o projeto iOS.

---

### 2. Configure o Signing (Assinatura)

No Xcode:

1. Selecione o projeto **App** na barra lateral
2. Vá na aba **Signing & Capabilities**
3. **Selecione seu Team** (Apple Developer Account)
4. **Bundle Identifier**: `com.revisaopro.app`
5. Xcode configurará automaticamente os certificados

---

### 3. Teste no Simulador

1. No topo do Xcode, selecione um **simulador** (ex: iPhone 15 Pro)
2. Clique no botão **▶️ Play** ou pressione `Cmd + R`
3. O app abrirá no simulador iOS!

---

### 4. Teste em Dispositivo Real

1. Conecte seu iPhone via cabo USB
2. **Confie no computador** no iPhone
3. No Xcode, selecione **seu iPhone** no menu superior
4. Clique em **▶️ Play**
5. No iPhone: `Ajustes` → `Geral` → `VPN e Gerenciamento` → **Confie no desenvolvedor**

---

### 5. Gerar Arquivo .ipa (para distribuição)

#### Para TestFlight (testes):

```bash
# No Xcode:
# 1. Product → Archive
# 2. Aguarde o build (pode demorar 5-10 min)
# 3. Window → Organizer → Archives
# 4. Clique em "Distribute App"
# 5. Escolha "TestFlight & App Store"
# 6. Siga o assistente
```

#### Para distribuição direta (sem App Store):

```bash
# 1. Product → Archive
# 2. Distribute App → Ad Hoc
# 3. Export .ipa
# 4. Instale via Xcode ou serviços como TestFlight
```

---

### 6. Publicar na App Store

1. **App Store Connect**: https://appstoreconnect.apple.com
2. **Criar novo app**:
   - Nome: Revisão PRO
   - Bundle ID: com.revisaopro.app
   - Categoria: Produtividade
3. **Upload via Xcode**:
   - Product → Archive → Distribute App → App Store
4. **Preencher metadados**:
   - Descrição
   - Screenshots (6.7", 6.5", 5.5")
   - Ícone (1024x1024)
   - Privacidade
5. **Enviar para revisão** (pode levar 1-3 dias)

---

## 🔄 Atualizando o app após mudanças:

```bash
# 1. Build do projeto web
npm run build

# 2. Sincronizar com iOS
npx cap sync ios

# 3. Abrir no Xcode
npx cap open ios

# 4. Product → Clean Build Folder (Cmd + Shift + K)
# 5. Product → Build (Cmd + B)
```

---

## 📱 PWA como Alternativa (Recomendado para iniciar):

Enquanto não tiver Mac ou Apple Developer Account:

### No iPhone (Safari):
1. Acesse: **https://revisao-espacada-pro.vercel.app**
2. Toque no botão **Compartilhar** (⬆️)
3. **"Adicionar à Tela de Início"**
4. Toque em **"Adicionar"**

✅ **Funciona como app nativo!**
- Ícone na tela inicial
- Funciona offline
- Notificações (limitadas)
- Sem necessidade de App Store

---

## 🎨 Personalizações Importantes:

### Ícone do App

Substitua os arquivos em:
```
ios/App/App/Assets.xcassets/AppIcon.appiconset/
```

Tamanhos necessários:
- 20x20, 29x29, 40x40, 58x58, 60x60
- 76x76, 80x80, 87x87, 120x120, 152x152
- 167x167, 180x180, 1024x1024

### Splash Screen

Edite:
```
ios/App/App/Assets.xcassets/Splash.imageset/
```

---

## ❓ Problemas Comuns:

### "Signing for 'App' requires a development team"
- **Solução**: Adicione seu Apple ID no Xcode → Preferences → Accounts

### "No iOS Distribution certificate found"
- **Solução**: Xcode → Preferences → Accounts → Manage Certificates → + (iOS Distribution)

### "Provisioning profile doesn't match"
- **Solução**: Product → Clean Build Folder → Rebuildar

### "Unable to install"
- **Solução**: Ajustes → Geral → VPN e Gerenciamento → Confiar

---

## 📊 Comparação de Distribuição:

| Método | Custo | Requisitos | Público |
|---|---|---|---|
| **PWA** | 🟢 Grátis | Safari | Qualquer pessoa |
| **TestFlight** | 🟡 $99/ano | Apple Developer | Até 10.000 testadores |
| **App Store** | 🟡 $99/ano | Apple Developer + Revisão | Mundo todo |
| **Ad Hoc** | 🟡 $99/ano | Apple Developer | Até 100 dispositivos |

---

## 🔗 Links Úteis:

- **Xcode**: https://developer.apple.com/xcode/
- **Apple Developer**: https://developer.apple.com/
- **App Store Connect**: https://appstoreconnect.apple.com/
- **TestFlight**: https://developer.apple.com/testflight/
- **Guias Apple**: https://developer.apple.com/documentation/

---

## 💡 Dica Pro:

Se você **não tem Mac agora**, use a versão **PWA** no iPhone! Ela funciona perfeitamente e você pode publicar o app nativo mais tarde quando tiver acesso a um Mac.

Boa sorte! 🚀🍎
