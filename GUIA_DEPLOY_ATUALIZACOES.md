# Guia de Deploy das Atualizações

## ✅ Atualizações Realizadas

### 1. Frontend (React)
- ✅ Relatórios de Performance (RealizedSaleReport e LostSaleReport)
- ✅ Briefing SPIN (BriefingSPINResult)
- Removidos emojis e aplicado design minimalista

### 2. Backend (Supabase Edge Functions)
- ✅ Prompts de análise da IA (prompt-templates-v3.ts)
- Linguagem minimalista e objetiva

---

## 📋 Passos para Implementar

### Opção 1: Apenas Frontend (Mudanças Visuais)

Se você quer ver as mudanças nos **relatórios e briefings** (sem emojis, design novo):

```bash
# 1. Pare o servidor se estiver rodando (Ctrl+C)

# 2. Reinicie o servidor
npm run dev
```

✅ As mudanças nos componentes React aparecerão imediatamente.

---

### Opção 2: Frontend + Backend (Mudanças Completas)

Para implementar **TUDO**, incluindo os prompts da IA sem emojis:

#### Passo 1: Verificar Link do Supabase

```bash
# Verificar se está linkado
./supabase.exe projects list
```

Se não aparecer seu projeto, você precisa linkar:

```bash
# Linkar ao projeto
./supabase.exe link --project-ref SEU_PROJECT_REF
```

**Como encontrar o PROJECT_REF:**
1. Acesse: https://supabase.com/dashboard
2. Entre no seu projeto
3. Vá em **Settings** → **General**
4. Copie o "Reference ID"

#### Passo 2: Deploy das Edge Functions

```bash
# Deploy da função principal de análise V3
./supabase.exe functions deploy analyze-consultation-v3 --no-verify-jwt

# Se houver outras funções relacionadas
./supabase.exe functions deploy generate-spin-briefing --no-verify-jwt
```

#### Passo 3: Reiniciar Frontend

```bash
npm run dev
```

---

## 🔧 Alternativa: Deploy Manual via Dashboard

Se o CLI não funcionar, você pode fazer upload manual:

1. Acesse: https://supabase.com/dashboard
2. Entre no seu projeto
3. Vá em **Edge Functions**
4. Clique na função (ex: `analyze-consultation-v3`)
5. Clique em **Deploy new version**
6. Faça upload do arquivo:
   - `supabase/functions/analyze-consultation-v3/index.ts`

---

## 📱 Verificar se Funcionou

### Frontend (Relatórios e Briefing):
1. Abra a aplicação
2. Vá em Análises ou Briefings
3. Verifique se **NÃO há emojis** nos relatórios
4. Verifique se o design está **minimalista e limpo**

### Backend (Prompts da IA):
1. Faça uma **nova análise** de consulta
2. O relatório gerado pela IA deve ter:
   - Linguagem mais objetiva (sem "BRUTALMENTE", "CALOU A BOCA", etc.)
   - Textos sem emojis nos prompts internos

---

## ❗ Importante

- **Análises antigas** continuarão com o formato antigo (já foram geradas)
- **Novas análises** usarão os novos prompts
- Se fizer deploy via Vercel, as mudanças do frontend serão automáticas no próximo deploy

---

## 🆘 Problemas Comuns

### "Cannot find project ref"
Solução: Execute `./supabase.exe link --project-ref SEU_REF`

### "Permission denied"
Solução: Execute `./supabase.exe login` primeiro

### Mudanças não aparecem
Solução:
1. Limpe cache do navegador (Ctrl+Shift+Del)
2. Reinicie o servidor npm
3. Verifique se fez deploy das Edge Functions

---

## 📞 Resumo Rápido

**Apenas ver mudanças visuais:**
```bash
npm run dev
```

**Mudanças completas (IA + Visual):**
```bash
./supabase.exe link --project-ref SEU_REF
./supabase.exe functions deploy analyze-consultation-v3 --no-verify-jwt
npm run dev
```
