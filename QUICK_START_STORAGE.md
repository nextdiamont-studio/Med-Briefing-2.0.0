# Quick Start - Configuração do Supabase Storage

## 🚀 Guia Rápido de 5 Minutos

Este guia mostra como configurar o Supabase Storage para armazenar gravações de áudio no **Med Briefing 2.0**.

---

## Passo 1: Acessar o Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Faça login com sua conta
3. Selecione o projeto: **Med Briefing** (ID: `pjbthsrnpytdaivchwqe`)

---

## Passo 2: Executar SQL de Configuração

### 2.1 Abrir SQL Editor

1. No menu lateral, clique em **SQL Editor**
2. Clique em **New Query**

### 2.2 Executar Script de Buckets

Copie e cole o conteúdo do arquivo `SETUP_STORAGE_BUCKETS.sql`:

```sql
-- Criar buckets e políticas RLS
-- (Cole todo o conteúdo do arquivo aqui)
```

3. Clique em **Run** (ou pressione `Ctrl+Enter`)
4. Aguarde confirmação: ✅ Success

---

## Passo 3: Verificar Buckets Criados

### 3.1 Acessar Storage

1. No menu lateral, clique em **Storage**
2. Você deve ver 2 buckets:
   - ✅ `recordings` (50MB max)
   - ✅ `transcriptions` (10MB max)

### 3.2 Verificar Configurações

Clique em cada bucket e confirme:

**recordings:**
- Public: ✅ Sim
- File size limit: 50 MB
- Allowed MIME types: `audio/webm`, `audio/wav`, `audio/mp3`, `audio/mpeg`, `audio/ogg`

**transcriptions:**
- Public: ✅ Sim
- File size limit: 10 MB
- Allowed MIME types: `text/plain`

---

## Passo 4: Verificar Políticas RLS

### 4.1 Acessar Políticas

1. Clique em **Storage** > **Policies**
2. Você deve ver as seguintes políticas:

**Para bucket `recordings`:**
- ✅ Users can upload own recordings (INSERT)
- ✅ Public read access for recordings (SELECT)
- ✅ Users can delete own recordings storage (DELETE)
- ✅ Users can update own recordings (UPDATE)

**Para bucket `transcriptions`:**
- ✅ Public read access for transcriptions (SELECT)
- ✅ Service role can manage transcriptions (ALL)
- ✅ Users can delete own transcriptions (DELETE)

---

## Passo 5: Testar Upload

### 5.1 Testar Manualmente no Dashboard

1. Vá em **Storage** > **recordings**
2. Clique em **Upload file**
3. Crie uma pasta com seu `user_id` (copie do Authentication)
4. Faça upload de um arquivo de áudio de teste
5. Verifique se aparece na lista

### 5.2 Testar na Aplicação

1. Acesse a aplicação: http://localhost:5173
2. Faça login
3. Vá em **Consultas** > **Nova Consulta**
4. Selecione um paciente
5. Grave um áudio de teste (mínimo 5 segundos)
6. Clique em **Fazer Upload**
7. Aguarde confirmação de sucesso

### 5.3 Verificar no Dashboard

1. Volte ao Supabase Dashboard
2. **Storage** > **recordings** > `{seu_user_id}`
3. Você deve ver o arquivo recém-enviado
4. **Database** > **Table Editor** > **recordings**
5. Você deve ver um novo registro com:
   - `audio_url` preenchido
   - `audio_file_path` preenchido
   - `status` = 'processing'

---

## Passo 6: Verificar Transcrição (Opcional)

Se você configurou o webhook de transcrição:

1. Aguarde 10-30 segundos após o upload
2. Verifique **Storage** > **transcriptions** > `{seu_user_id}`
3. Deve aparecer um arquivo `.txt` com a transcrição
4. Verifique **Database** > **recordings**
5. O campo `status` deve estar como 'completed'
6. O campo `transcription_text` deve estar preenchido

---

## ✅ Checklist Final

Marque cada item conforme concluir:

- [ ] Executei `SETUP_STORAGE_BUCKETS.sql` no SQL Editor
- [ ] Verifiquei que os buckets `recordings` e `transcriptions` existem
- [ ] Confirmei que as políticas RLS foram criadas
- [ ] Testei upload manual no Dashboard
- [ ] Testei upload via aplicação
- [ ] Verifiquei que o arquivo aparece no Storage
- [ ] Verifiquei que o registro foi criado no banco
- [ ] (Opcional) Confirmei que a transcrição funciona

---

## 🐛 Problemas Comuns

### Erro: "Bucket already exists"

**Causa**: Os buckets já foram criados anteriormente.

**Solução**: Ignore este erro ou delete os buckets existentes antes de executar o SQL.

### Erro: "Permission denied" ao fazer upload

**Causa**: Políticas RLS não foram criadas ou estão incorretas.

**Solução**: 
1. Execute novamente `SETUP_STORAGE_BUCKETS.sql`
2. Verifique se você está autenticado na aplicação
3. Confirme que o `user_id` na pasta corresponde ao usuário logado

### Upload funciona mas transcrição não acontece

**Causa**: Webhook não configurado ou Edge Function com erro.

**Solução**:
1. Verifique se executou `SETUP_TRANSCRIPTION_WEBHOOK.sql`
2. Acesse **Database** > **Webhooks** e confirme que existe um webhook para `recordings`
3. Verifique logs da Edge Function em **Edge Functions** > **transcribe-recording** > **Logs**

### Arquivo não aparece no Storage

**Causa**: Erro no upload ou permissões incorretas.

**Solução**:
1. Abra o Console do navegador (F12)
2. Procure por erros em vermelho
3. Verifique se o `user_id` está correto
4. Confirme que o arquivo não excede 50MB

---

## 📞 Suporte

Se você encontrar problemas:

1. Verifique os logs do navegador (F12 > Console)
2. Verifique os logs do Supabase (Dashboard > Logs)
3. Consulte o guia completo: `STORAGE_INTEGRATION_GUIDE.md`
4. Verifique o troubleshooting: `TROUBLESHOOTING_RECORDINGS.md`

---

## 🎉 Próximos Passos

Após configurar o Storage:

1. ✅ Teste gravações em diferentes cenários
2. ✅ Verifique performance de upload
3. ✅ Configure alertas de erro (opcional)
4. ✅ Implemente backup automático (opcional)
5. ✅ Configure CDN para distribuição (produção)

---

**Tempo estimado**: 5-10 minutos  
**Dificuldade**: Fácil  
**Pré-requisitos**: Acesso ao Supabase Dashboard
