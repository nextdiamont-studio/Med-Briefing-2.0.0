# Correção do Sistema de Gravação e Transcrição

## Problema Identificado

O sistema estava mostrando mensagens de erro falsas durante o salvamento de áudio, quando na verdade o salvamento estava sendo realizado com sucesso no Storage. Além disso, a transcrição estava sendo iniciada automaticamente, sem opção do usuário decidir quando transcrever.

## Mudanças Implementadas

### 1. Novo Status de Gravação: 'saved'

Foi adicionado um novo status `'saved'` para gravações que foram salvas mas ainda não foram transcritas.

**Arquivo modificado:** `src/lib/types.ts`
```typescript
export type RecordingStatus = 'saved' | 'processing' | 'completed' | 'failed';
```

**Estados do sistema:**
- `saved`: Áudio salvo no Storage, aguardando transcrição manual
- `processing`: Transcrição em andamento (Gemini API processando)
- `completed`: Transcrição concluída com sucesso
- `failed`: Erro durante a transcrição

### 2. Salvamento sem Transcrição Automática

**Arquivo modificado:** `src/components/RecordingModal.tsx`

- Status inicial alterado de `'processing'` para `'saved'`
- Mensagem de instrução atualizada para refletir o novo fluxo
- Removida a falsa expectativa de transcrição automática

```typescript
// Linha 104
status: 'saved', // Salvo, aguardando transcrição manual
```

### 3. Botão de Transcrição Manual

**Arquivo modificado:** `src/pages/RecordingsPage.tsx`

Adicionado botão "Transcrever" que aparece apenas para gravações com status `'saved'`:

```typescript
{recording.status === 'saved' && (
  <button onClick={() => handleTranscribe(recording.id)}>
    <FileText /> Transcrever
  </button>
)}
```

**Função handleTranscribe:**
- Atualiza o status da gravação para `'processing'`
- Isso dispara a Edge Function que realiza a transcrição
- Recarrega a lista para mostrar o novo status

### 4. Player de Áudio Melhorado

**Arquivo modificado:** `src/pages/RecordingsPage.tsx` (AudioPlayerModal)

Melhorias no player de áudio:
- UI mais moderna e intuitiva
- Reprodução direta do Storage via URL pública
- Exibição da transcrição (se disponível)
- Informações detalhadas da gravação

### 5. Edge Function Otimizada

**Arquivo modificado:** `supabase/functions/transcribe-recording/index.ts`

A Edge Function agora:
- **NÃO** processa eventos INSERT (quando gravação é criada)
- **APENAS** processa eventos UPDATE (quando status muda para 'processing')
- Valida se já existe transcrição antes de processar
- Pula processamento se status não for 'processing'

```typescript
// Ignorar INSERT - aguardar trigger manual
if (payload.type === 'INSERT') {
  return Response({ skipped: true, reason: 'INSERT event ignored' })
}

// Processar apenas UPDATE com status 'processing'
if (payload.type !== 'UPDATE' || recording.status !== 'processing') {
  return Response({ skipped: true })
}
```

### 6. Badges de Status Atualizados

**Arquivo modificado:** `src/pages/RecordingsPage.tsx`

Novos badges para melhor visualização:
- **Salvo** (cinza): Áudio salvo, aguardando transcrição
- **Transcrevendo** (azul): Transcrição em andamento
- **Transcrito** (verde): Transcrição concluída
- **Falhou** (vermelho): Erro na transcrição

## Banco de Dados

### Script SQL para Atualizar Schema

Execute o arquivo `UPDATE_RECORDING_STATUS.sql` no Supabase Dashboard:

```sql
-- 1. Remover constraint antiga
ALTER TABLE recordings DROP CONSTRAINT IF EXISTS recordings_status_check;

-- 2. Adicionar novo constraint
ALTER TABLE recordings
ADD CONSTRAINT recordings_status_check
CHECK (status IN ('saved', 'processing', 'completed', 'failed'));

-- 3. Migrar gravações existentes
UPDATE recordings
SET status = 'saved'
WHERE status = 'processing'
  AND transcription_url IS NULL;
```

## Webhook/Trigger Configuration

Certifique-se de que o webhook do Supabase está configurado para disparar em **UPDATE** events:

```sql
-- Verificar triggers existentes
SELECT * FROM pg_trigger WHERE tgname LIKE '%recording%';

-- Se necessário, recriar trigger
DROP TRIGGER IF EXISTS on_recording_update ON recordings;

CREATE TRIGGER on_recording_update
  AFTER UPDATE ON recordings
  FOR EACH ROW
  WHEN (NEW.status = 'processing' AND OLD.status != 'processing')
  EXECUTE FUNCTION supabase_functions.http_request(
    'https://pjbthsrnpytdaivchwqe.supabase.co/functions/v1/transcribe-recording',
    'POST',
    '{"Content-Type":"application/json"}',
    '{}',
    '1000'
  );
```

## Fluxo Completo Atualizado

### 1. Gravação de Áudio
```
Usuario clica "Nova Gravação"
  ↓
Usuario grava áudio
  ↓
Áudio é enviado para Storage
  ✓ Upload bem-sucedido
  ↓
Registro criado no banco com status='saved'
  ✓ NENHUMA transcrição automática
  ↓
Usuário vê gravação com badge "Salvo"
```

### 2. Reprodução de Áudio
```
Usuario clica "Ouvir"
  ↓
Modal abre com player de áudio
  ↓
Áudio é carregado do Storage via URL pública
  ↓
Usuário pode ouvir o áudio completo
```

### 3. Transcrição Manual
```
Usuario clica "Transcrever"
  ↓
Status atualizado para 'processing'
  ↓
Edge Function detecta UPDATE
  ↓
Áudio baixado do Storage
  ↓
Enviado para Gemini API
  ↓
Transcrição salva no Storage (TXT)
  ↓
Status atualizado para 'completed'
  ↓
Badge muda para "Transcrito"
  ↓
Botão "TXT" aparece para download
```

## Comandos para Deploy

### 1. Atualizar Banco de Dados
```bash
# No Supabase Dashboard > SQL Editor
# Executar: UPDATE_RECORDING_STATUS.sql
```

### 2. Deploy da Edge Function
```bash
cd supabase
supabase functions deploy transcribe-recording
```

### 3. Verificar Logs
```bash
# Acompanhar logs da função
supabase functions logs transcribe-recording --tail
```

## Testes Recomendados

### Teste 1: Salvamento de Áudio
1. Criar nova gravação
2. Gravar áudio de teste
3. Verificar que:
   - Upload é bem-sucedido (sem erros falsos)
   - Status inicial é 'saved'
   - Badge "Salvo" aparece
   - Botão "Transcrever" está visível

### Teste 2: Reprodução de Áudio
1. Clicar em "Ouvir" em uma gravação
2. Verificar que:
   - Modal abre corretamente
   - Player de áudio carrega
   - Áudio é reproduzido do Storage
   - Todas as informações são exibidas

### Teste 3: Transcrição Manual
1. Clicar em "Transcrever"
2. Verificar que:
   - Status muda para 'processing'
   - Badge muda para "Transcrevendo"
   - Edge Function é disparada
   - Após conclusão, status muda para 'completed'
   - Botão "TXT" aparece
   - Download da transcrição funciona

### Teste 4: Tratamento de Erros
1. Simular erro de API (desabilitar Gemini temporariamente)
2. Tentar transcrever
3. Verificar que:
   - Status muda para 'failed'
   - Mensagem de erro é salva
   - Badge "Falhou" aparece
   - Usuário pode tentar novamente

## Resolução de Problemas

### Problema: Transcrição não inicia
**Solução:**
1. Verificar logs da Edge Function
2. Confirmar que webhook está configurado para UPDATE
3. Verificar variáveis de ambiente (GEMINI_API_KEY)

### Problema: Áudio não reproduz
**Solução:**
1. Verificar se URL pública está acessível
2. Confirmar políticas de Storage (RLS)
3. Verificar tipo MIME do arquivo

### Problema: Badge não atualiza
**Solução:**
1. Verificar se componente recarrega dados após ação
2. Confirmar que `loadRecordings()` é chamado após `handleTranscribe()`

## Benefícios da Correção

✅ **Sem mensagens de erro falsas** - Upload funciona corretamente
✅ **Controle do usuário** - Decide quando transcrever
✅ **Economia de API** - Transcreve apenas quando necessário
✅ **Melhor UX** - Player de áudio intuitivo e funcional
✅ **Status claros** - Badges informativos para cada estado
✅ **Reprodução direta** - Áudio acessível diretamente do Storage

## Manutenção Futura

- Considerar adicionar opção de transcrição em lote
- Implementar cache de URLs de áudio
- Adicionar progresso visual durante transcrição
- Permitir cancelamento de transcrição em andamento
- Implementar retry automático para falhas temporárias

---

**Última atualização:** 2025-01-09
**Versão:** 2.0
