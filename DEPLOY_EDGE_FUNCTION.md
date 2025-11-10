# 🚀 Deploy da Edge Function de Transcrição

Este guia explica como fazer o deploy da Edge Function `transcribe-recording` no Supabase.

---

## 📋 PRÉ-REQUISITOS

1. ✅ Supabase CLI instalado
2. ✅ Gemini API Key obtida
3. ✅ Tabela `recordings` criada no banco
4. ✅ Buckets `recordings` e `transcriptions` criados no Storage

---

## 🔧 PASSO 1: INSTALAR SUPABASE CLI

### Windows (PowerShell):
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### macOS/Linux:
```bash
brew install supabase/tap/supabase
```

### Verificar instalação:
```bash
supabase --version
```

---

## 🔑 PASSO 2: OBTER GEMINI API KEY

1. Acessar: https://aistudio.google.com/apikey
2. Fazer login com conta Google
3. Clicar em "Get API Key"
4. Copiar a chave gerada
5. Guardar em local seguro (será usada no Passo 4)

---

## 🔐 PASSO 3: LOGIN NO SUPABASE

```bash
supabase login
```

Isso abrirá o navegador para autenticação.

---

## 🌐 PASSO 4: CONFIGURAR VARIÁVEIS DE AMBIENTE

### Via Dashboard (Recomendado):

1. Acessar: https://pjbthsrnpytdaivchwqe.supabase.co/project/_/settings/functions
2. Clicar em "Add secret"
3. Adicionar as seguintes variáveis:

| Name | Value |
|------|-------|
| `GEMINI_API_KEY` | [sua-gemini-api-key] |

**Nota:** As variáveis `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` são automaticamente injetadas pelo Supabase.

---

## 📤 PASSO 5: DEPLOY DA EDGE FUNCTION

### Navegar até a raiz do projeto:
```bash
cd "C:\Users\fclpa\Downloads\Med Briefing 2.0\med-briefing"
```

### Linkar ao projeto Supabase:
```bash
supabase link --project-ref pjbthsrnpytdaivchwqe
```

### Fazer deploy da função:
```bash
supabase functions deploy transcribe-recording
```

**Output esperado:**
```
Deploying transcribe-recording...
✓ Function deployed successfully
Function URL: https://pjbthsrnpytdaivchwqe.supabase.co/functions/v1/transcribe-recording
```

---

## 🔗 PASSO 6: CONFIGURAR WEBHOOK

### Via Dashboard (Recomendado):

1. Acessar: https://pjbthsrnpytdaivchwqe.supabase.co/project/_/database/webhooks
2. Clicar em "Create a new webhook"
3. Preencher:
   - **Name:** `transcribe-recording`
   - **Table:** `recordings`
   - **Events:** Marcar apenas `INSERT`
   - **Type:** `HTTP Request`
   - **Method:** `POST`
   - **URL:** `https://pjbthsrnpytdaivchwqe.supabase.co/functions/v1/transcribe-recording`
   - **HTTP Headers:**
     ```
     Authorization: Bearer [SUPABASE_SERVICE_ROLE_KEY]
     Content-Type: application/json
     ```
     ⚠️ **IMPORTANTE:** Substituir `[SUPABASE_SERVICE_ROLE_KEY]` pela chave real (encontrada em Project Settings > API)

4. Clicar em "Create webhook"

### Via CLI (Alternativo):
```bash
supabase db webhook create transcribe-recording \
  --event INSERT \
  --table recordings \
  --hook-url https://pjbthsrnpytdaivchwqe.supabase.co/functions/v1/transcribe-recording \
  --http-header "Authorization=Bearer [SERVICE-ROLE-KEY]" \
  --http-header "Content-Type=application/json"
```

---

## ✅ PASSO 7: TESTAR FUNCIONAMENTO

### 1. Via aplicação (End-to-End):
```
1. Acessar: http://localhost:5740/gravacoes
2. Clicar em "Nova Gravação"
3. Nomear gravação: "Teste de Transcrição"
4. Gravar 10-15 segundos de áudio
5. Parar gravação
6. Aguardar 30-60 segundos
7. Recarregar página
8. Status deve mudar de "Processando" para "Concluída"
9. Botão "TXT" deve aparecer para download
```

### 2. Verificar logs da Edge Function:
```bash
supabase functions logs transcribe-recording --follow
```

### 3. Verificar banco de dados:
```sql
SELECT
  id,
  name,
  status,
  error_message,
  LENGTH(transcription_text) as transcription_length,
  created_at,
  updated_at
FROM recordings
ORDER BY created_at DESC
LIMIT 5;
```

---

## 🐛 TROUBLESHOOTING

### ❌ Erro: "Function not found"
**Solução:** Verificar se o deploy foi bem-sucedido:
```bash
supabase functions list
```

### ❌ Erro: "Gemini API error: 400"
**Causa:** API Key inválida ou não configurada
**Solução:** Verificar variável `GEMINI_API_KEY` no Dashboard

### ❌ Status fica em "processing" indefinidamente
**Causa:** Webhook não configurado ou Edge Function com erro
**Solução:**
1. Verificar logs: `supabase functions logs transcribe-recording`
2. Verificar webhook no Dashboard
3. Testar manualmente via curl

### ❌ Erro: "Failed to download audio"
**Causa:** Bucket 'recordings' não público ou não existe
**Solução:** Criar bucket público via Dashboard (Storage)

---

## 🔄 ATUALIZAR EDGE FUNCTION

Se fizer alterações no código da função:

```bash
supabase functions deploy transcribe-recording
```

Não é necessário recriar o webhook.

---

## 🧪 TESTE MANUAL VIA CURL

```bash
curl -X POST https://pjbthsrnpytdaivchwqe.supabase.co/functions/v1/transcribe-recording \
  -H "Authorization: Bearer [SERVICE-ROLE-KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "INSERT",
    "table": "recordings",
    "record": {
      "id": "[recording-id]",
      "user_id": "[user-id]",
      "name": "Test",
      "audio_url": "[audio-url]",
      "audio_file_path": "[file-path]",
      "status": "processing"
    },
    "schema": "public",
    "old_record": null
  }'
```

---

## 📊 MONITORAMENTO

### Ver logs em tempo real:
```bash
supabase functions logs transcribe-recording --follow
```

### Ver métricas no Dashboard:
https://pjbthsrnpytdaivchwqe.supabase.co/project/_/functions/transcribe-recording

---

## 💰 CUSTOS ESTIMADOS

### Gemini API (Flash 1.5):
- **Input:** Free até 15 RPM
- **Após limite:** $0.075 / 1M tokens de áudio
- **Média:** ~$0.001 por transcrição de 5 minutos

### Supabase Edge Functions:
- **Free tier:** 500k invocações/mês
- **Após limite:** $2.00 / 1M invocações

---

## ✅ CHECKLIST DE DEPLOYMENT

- [ ] Supabase CLI instalado
- [ ] Gemini API Key obtida
- [ ] Login no Supabase CLI realizado
- [ ] Variável `GEMINI_API_KEY` configurada
- [ ] Edge Function deployada com sucesso
- [ ] Webhook criado e ativo
- [ ] Teste end-to-end realizado
- [ ] Logs verificados sem erros
- [ ] Transcrição gerada com sucesso

---

**Status:** Pronto para produção após completar todos os passos ✅
