# 🚀 Guia de Deploy na Vercel - Med Briefing

Este guia contém todas as instruções para fazer deploy da aplicação Med Briefing na Vercel.

## 📋 Pré-requisitos

Antes de iniciar o deploy, certifique-se de ter:

- [ ] Conta na Vercel (https://vercel.com)
- [ ] Conta no GitHub (para importar o repositório)
- [ ] Chaves de API configuradas:
  - Supabase URL e Anon Key
  - Google Gemini API Key

## 🔧 Preparação do Código

### 1. Verificar que os arquivos essenciais existem:

```bash
# Verificar arquivos de configuração
ls vercel.json .env.example .gitignore
```

### 2. Testar build localmente:

```bash
# Build de produção
pnpm run build:prod

# Preview local
pnpm run preview
```

Se o build falhar, corrija os erros antes de continuar.

## 📦 Deploy na Vercel

### Método 1: Deploy via Dashboard (Recomendado)

#### Passo 1: Importar Projeto

1. Acesse https://vercel.com/new
2. Clique em "Import Git Repository"
3. Conecte sua conta do GitHub
4. Selecione o repositório `med-briefing`
5. Clique em "Import"

#### Passo 2: Configurar Build

A Vercel deve detectar automaticamente as configurações do `vercel.json`, mas verifique:

- **Framework Preset**: Vite
- **Build Command**: `pnpm run build:prod`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install --prefer-offline`

#### Passo 3: Configurar Variáveis de Ambiente

Na seção "Environment Variables", adicione:

```bash
# Supabase
VITE_SUPABASE_URL=https://pjbthsrnpytdaivchwqe.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui

# Google Gemini
VITE_GEMINI_API_KEY=sua-api-key-do-gemini-aqui
```

**Importante**: Marque todas as variáveis para os ambientes:
- ✅ Production
- ✅ Preview
- ✅ Development

#### Passo 4: Deploy

1. Clique em "Deploy"
2. Aguarde o build terminar (2-5 minutos)
3. Acesse o URL fornecido pela Vercel

### Método 2: Deploy via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Para deploy em produção
vercel --prod
```

## 🔐 Configuração de Segurança

### Headers de Segurança

Os seguintes headers já estão configurados no `vercel.json`:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Cache de Assets

Assets estáticos são cacheados por 1 ano (31536000 segundos) com header `immutable`.

## 🌐 Domínio Customizado (Opcional)

### Adicionar Domínio Próprio

1. Na dashboard do projeto, vá em "Settings" > "Domains"
2. Clique em "Add Domain"
3. Digite seu domínio (ex: `medbriefing.com`)
4. Siga as instruções para configurar DNS

### Configurar DNS

Adicione os seguintes registros no seu provedor de DNS:

```
Type: CNAME
Name: www (ou @)
Value: cname.vercel-dns.com
```

## 🔄 Atualizações Automáticas

### Deploy Automático

A Vercel faz deploy automático quando você:

1. Faz push para a branch `main` (produção)
2. Cria um Pull Request (preview)
3. Faz push em qualquer branch (preview)

### Configurar Branch de Produção

1. Vá em "Settings" > "Git"
2. Em "Production Branch", defina `main` ou `master`

## 🧪 Ambientes de Preview

Cada Pull Request gera um ambiente de preview automaticamente:

- URL única para testar mudanças
- Mesmas variáveis de ambiente de produção
- Build isolado

Acesse os previews em: `https://[seu-projeto]-[hash].vercel.app`

## 📊 Monitoramento

### Analytics

1. Vá em "Analytics" no dashboard
2. Ative o Vercel Analytics (gratuito para projetos Hobby)
3. Monitore:
   - Pageviews
   - Tempo de carregamento
   - Core Web Vitals

### Logs

Acesse logs em tempo real:

1. Dashboard do projeto
2. Aba "Deployments"
3. Clique em qualquer deployment
4. Veja "Build Logs" e "Function Logs"

## 🐛 Troubleshooting

### Build Falha

**Erro de TypeScript:**
```bash
# Localmente, rode:
pnpm run typecheck
```

**Erro de dependências:**
```bash
# Limpar e reinstalar:
pnpm run clean
pnpm install
```

### Variáveis de Ambiente Não Funcionam

1. Verifique se as variáveis começam com `VITE_`
2. Certifique-se de ter marcado os ambientes corretos
3. Faça um novo deploy após adicionar variáveis

### Erro 404 nas Rotas

O `vercel.json` já configura SPA rewrites. Se ainda tiver problemas:

1. Verifique se o arquivo `vercel.json` está na raiz
2. Confirme se a configuração de rewrites está correta

### Build Timeout

Se o build demorar muito:

1. Aumente o timeout no `vercel.json`:
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "maxLambdaSize": "50mb"
      }
    }
  ]
}
```

## 🎯 Otimizações Recomendadas

### 1. Habilitar Compression

Já está habilitado automaticamente pela Vercel (Brotli + Gzip).

### 2. Image Optimization

Para otimizar imagens, use o componente `next/image` ou configure CDN:

```javascript
// Em vite.config.ts, adicione plugin de image optimization
```

### 3. Code Splitting

O Vite já faz code splitting automático. Verifique os chunks gerados:

```bash
pnpm run build:prod
# Veja os tamanhos dos chunks em dist/assets/
```

### 4. Lighthouse Score

Após deploy, teste com Lighthouse:

```bash
# Chrome DevTools > Lighthouse
# Ou: https://pagespeed.web.dev/
```

Meta: 90+ em todas as métricas.

## 📱 Configurações Mobile

### PWA (Opcional)

Para tornar a aplicação instalável:

1. Adicione `vite-plugin-pwa`
2. Configure service worker
3. Adicione manifesto

## 🔗 Links Úteis

- [Documentação Vercel](https://vercel.com/docs)
- [Vite Production Build](https://vitejs.dev/guide/build.html)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Vercel CLI](https://vercel.com/docs/cli)

## ✅ Checklist Final

Antes de considerar o deploy completo:

- [ ] Build local funcionando sem erros
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Domínio customizado configurado (se aplicável)
- [ ] Analytics habilitado
- [ ] Testes manuais em produção realizados
- [ ] Documentação atualizada
- [ ] Equipe notificada do novo URL

## 🎉 Próximos Passos

Após deploy bem-sucedido:

1. Configure monitoramento de erros (Sentry, LogRocket)
2. Configure backups automáticos do Supabase
3. Documente processos de rollback
4. Configure CI/CD adicional se necessário
5. Implemente testes E2E (Playwright, Cypress)

---

**Suporte**: Para problemas específicos, consulte a [documentação oficial da Vercel](https://vercel.com/docs) ou abra uma issue no repositório.
