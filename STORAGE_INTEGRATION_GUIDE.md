# Guia de Integração - Supabase Storage

## 📋 Visão Geral

Este documento descreve a integração completa do **Med Briefing 2.0** com o **Supabase Storage** para armazenamento de gravações de áudio e transcrições.

## 🎯 Objetivo

Garantir que **todos os áudios gravados** na aplicação sejam armazenados de forma segura, padronizada e escalável no Supabase Storage, com integração automática para transcrição via Gemini API.

---

## 🏗️ Arquitetura

### Componentes Principais

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────┤
│  • EnhancedAudioRecorder.tsx (Consultas com pacientes)     │
│  • AudioRecorder.tsx (Gravações genéricas)                 │
│  • RecordingModal.tsx (Modal de gravação)                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              STORAGE SERVICE (Centralizado)                 │
├─────────────────────────────────────────────────────────────┤
│  • uploadRecording() - Upload de áudio                      │
│  • uploadConsultationRecording() - Upload de consulta       │
│  • downloadTranscription() - Download de transcrição        │
│  • deleteRecording() - Deletar arquivos                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  SUPABASE STORAGE                           │
├─────────────────────────────────────────────────────────────┤
│  Bucket: recordings/                                        │
│    └── {user_id}/                                           │
│        └── {timestamp}-{name}.webm                          │
│                                                              │
│  Bucket: transcriptions/                                    │
│    └── {user_id}/                                           │
│        └── {timestamp}-{name}.txt                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE (PostgreSQL)                      │
├─────────────────────────────────────────────────────────────┤
│  Tabela: recordings                                         │
│    • audio_url (URL pública)                                │
│    • audio_file_path (caminho no storage)                  │
│    • transcription_url (URL da transcrição)                │
│    • status (processing/completed/failed)                  │
│                                                              │
│  Tabela: consultations                                      │
│    • audio_url (URL pública)                                │
│    • audio_file_size (tamanho em bytes)                    │
│    • transcription (texto da transcrição)                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              EDGE FUNCTION (Webhook)                        │
├─────────────────────────────────────────────────────────────┤
│  transcribe-recording/                                      │
│    1. Detecta INSERT em recordings                          │
│    2. Download do áudio do Storage                          │
│    3. Envia para Gemini API                                 │
│    4. Upload da transcrição para Storage                    │
│    5. Atualiza status no banco                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Configuração Inicial

### 1. Criar Buckets no Supabase

Execute o SQL no **Supabase SQL Editor**:

```bash
# Arquivo: SETUP_STORAGE_BUCKETS.sql
```

Este script cria:
- ✅ Bucket `recordings` (50MB max, áudio)
- ✅ Bucket `transcriptions` (10MB max, texto)
- ✅ Políticas RLS de segurança

### 2. Verificar Variáveis de Ambiente

Arquivo `.env`:
```env
VITE_SUPABASE_URL=https://pjbthsrnpytdaivchwqe.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_GEMINI_API_KEY=AIzaSy...
```

### 3. Configurar Webhook (Opcional)

Se ainda não configurado, execute:

```bash
# Arquivo: SETUP_TRANSCRIPTION_WEBHOOK.sql
```

---

## 🔧 Uso do Storage Service

### Importação

```typescript
import { 
  uploadRecording, 
  uploadConsultationRecording,
  downloadTranscription,
  deleteRecording 
} from '../lib/storage-service'
```

### Upload de Gravação

```typescript
// Exemplo 1: Upload genérico
const { audioUrl, filePath, fileSize } = await uploadRecording(
  userId,           // ID do usuário autenticado
  'minha-gravacao', // Nome da gravação
  audioBlob         // Blob do áudio
)

// Exemplo 2: Upload de consulta
const { audioUrl, filePath, fileSize } = await uploadConsultationRecording(
  userId,
  'João Silva',     // Nome do paciente
  audioBlob
)
```

### Download de Transcrição

```typescript
const transcriptionText = await downloadTranscription(
  'user-id/1234567890-consulta-joao-silva.txt'
)
```

### Deletar Gravação

```typescript
await deleteRecording(
  'user-id/1234567890-consulta.webm',           // Áudio
  'user-id/1234567890-consulta.txt'             // Transcrição (opcional)
)
```

---

## 📝 Fluxo Completo de Gravação

### 1. Usuário Inicia Gravação

```typescript
// EnhancedAudioRecorder.tsx
const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'audio/webm;codecs=opus',
    audioBitsPerSecond: 64000
  })
  // ... configuração do recorder
}
```

### 2. Upload para Storage

```typescript
const handleUpload = async () => {
  // Upload centralizado via storage-service
  const { audioUrl, filePath, fileSize } = await uploadConsultationRecording(
    user.id,
    selectedPatient.name,
    audioBlob
  )
  
  // Retornar para componente pai
  onRecordingComplete(audioUrl, duration, fileSize, patientId, patientName)
}
```

### 3. Salvar no Banco de Dados

```typescript
// ConsultationsPage.tsx
const handleRecordingComplete = async (audioUrl, duration, fileSize, patientId) => {
  await supabase.from('consultations').insert({
    user_id: user.id,
    patient_id: patientId,
    audio_url: audioUrl,
    audio_file_size: fileSize,
    duration_minutes: Math.floor(duration / 60),
    transcription_status: 'pending',
    ai_processing_status: 'pending'
  })
}
```

### 4. Webhook Automático (Background)

A Edge Function `transcribe-recording` é acionada automaticamente:

1. **Trigger**: INSERT na tabela `recordings`
2. **Download**: Baixa o áudio do Storage
3. **Transcrição**: Envia para Gemini API
4. **Upload**: Salva transcrição no Storage
5. **Update**: Atualiza status no banco

---

## 🔒 Segurança e Políticas RLS

### Políticas Implementadas

#### Bucket `recordings`

```sql
-- Upload: Apenas usuários autenticados em suas pastas
CREATE POLICY "Users can upload own recordings"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'recordings' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Leitura: Pública (com autenticação)
CREATE POLICY "Public read access for recordings"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'recordings');

-- Deleção: Apenas próprios arquivos
CREATE POLICY "Users can delete own recordings storage"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'recordings' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

#### Bucket `transcriptions`

```sql
-- Service Role: Acesso total (Edge Functions)
CREATE POLICY "Service role can manage transcriptions"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'transcriptions');

-- Leitura: Pública
CREATE POLICY "Public read access for transcriptions"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'transcriptions');
```

---

## 📊 Estrutura de Arquivos

### Nomenclatura Padronizada

```
recordings/
├── {user_id}/
│   ├── 1699123456789-consulta-joao-silva.webm
│   ├── 1699123567890-consulta-maria-santos.webm
│   └── 1699123678901-gravacao-1699123678901.webm
│
transcriptions/
├── {user_id}/
│   ├── 1699123456789-consulta-joao-silva.txt
│   └── 1699123567890-consulta-maria-santos.txt
```

### Formato do Nome

```
{timestamp}-{sanitized_name}.{extension}

Onde:
- timestamp: Date.now() (13 dígitos)
- sanitized_name: lowercase, sem caracteres especiais
- extension: webm (áudio) ou txt (transcrição)
```

---

## ✅ Validações Implementadas

### Validação de Arquivo de Áudio

```typescript
function validateAudioFile(audioBlob: Blob): void {
  // 1. Tamanho máximo: 50MB
  if (audioBlob.size > 52428800) {
    throw new Error('Arquivo muito grande (max: 50MB)')
  }
  
  // 2. Tipo MIME permitido
  const allowedTypes = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg']
  if (!allowedTypes.includes(audioBlob.type)) {
    throw new Error('Tipo de arquivo não suportado')
  }
  
  // 3. Arquivo não vazio
  if (audioBlob.size === 0) {
    throw new Error('Arquivo de áudio vazio')
  }
}
```

### Validação de Nome de Arquivo

```typescript
function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')  // Apenas letras, números e hífens
    .replace(/-+/g, '-')          // Remover hífens duplicados
    .replace(/^-|-$/g, '')        // Remover hífens nas extremidades
    .substring(0, 100)            // Limitar tamanho
}
```

---

## 🐛 Tratamento de Erros

### Cenários Cobertos

| Erro | Tratamento |
|------|------------|
| Arquivo muito grande | Mensagem clara com limite |
| Tipo MIME inválido | Lista de tipos permitidos |
| Falha no upload | Retry automático (opcional) |
| Sem permissão de microfone | Alerta ao usuário |
| Falha na transcrição | Status 'failed' no banco |
| Timeout de rede | Feedback visual |

### Exemplo de Tratamento

```typescript
try {
  const result = await uploadRecording(userId, name, blob)
  console.log('Upload successful:', result)
} catch (error) {
  if (error.message.includes('muito grande')) {
    alert('Arquivo excede o limite de 50MB')
  } else if (error.message.includes('não suportado')) {
    alert('Formato de áudio inválido. Use WebM, WAV ou MP3')
  } else {
    alert('Erro ao fazer upload. Tente novamente.')
  }
  console.error('[Upload Error]:', error)
}
```

---

## 🧪 Testes

### Teste Manual - Upload de Áudio

1. Acesse a página de Consultas
2. Clique em "Nova Consulta"
3. Selecione um paciente
4. Grave um áudio de teste (mínimo 5 segundos)
5. Clique em "Fazer Upload"
6. Verifique no Supabase Dashboard:
   - Storage > recordings > {user_id}
   - Database > recordings (novo registro)

### Teste Manual - Transcrição Automática

1. Após upload bem-sucedido
2. Aguarde 10-30 segundos
3. Verifique:
   - Storage > transcriptions > {user_id}
   - Database > recordings (status = 'completed')
   - Campo `transcription_text` preenchido

### Verificação de Políticas RLS

```sql
-- Executar como usuário autenticado
SELECT * FROM storage.objects WHERE bucket_id = 'recordings';

-- Deve retornar apenas arquivos do usuário logado
```

---

## 📈 Monitoramento

### Logs Importantes

```typescript
// Frontend
console.log('[Storage] Starting upload process...')
console.log('[Storage] File size:', fileSize, 'MB')
console.log('[Storage] Upload successful:', publicUrl)

// Edge Function
console.log('[Transcribe] Processing recording:', recordingId)
console.log('[Transcribe] Transcription received, length:', length)
console.log('[Transcribe] Recording updated successfully')
```

### Métricas para Acompanhar

- Taxa de sucesso de uploads (%)
- Tempo médio de upload (segundos)
- Taxa de sucesso de transcrições (%)
- Tempo médio de transcrição (segundos)
- Tamanho médio de arquivos (MB)

---

## 🚀 Próximos Passos

### Melhorias Futuras

- [ ] Compressão de áudio antes do upload
- [ ] Upload em chunks para arquivos grandes
- [ ] Retry automático em caso de falha
- [ ] Progress bar real (não simulado)
- [ ] Suporte a múltiplos formatos de áudio
- [ ] Cache de transcrições no IndexedDB
- [ ] Sincronização offline

### Otimizações

- [ ] CDN para distribuição de áudios
- [ ] Conversão automática para formato otimizado
- [ ] Thumbnail/waveform de áudio
- [ ] Streaming de áudio direto do Storage

---

## 📚 Referências

### Documentação Oficial

- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Gemini API](https://ai.google.dev/docs)

### Arquivos do Projeto

- `src/lib/storage-service.ts` - Serviço centralizado
- `SETUP_STORAGE_BUCKETS.sql` - Configuração de buckets
- `SETUP_STORAGE_POLICIES.sql` - Políticas RLS (legacy)
- `supabase/functions/transcribe-recording/` - Edge Function

---

## ✅ Checklist de Implementação

- [x] Criar buckets no Supabase
- [x] Configurar políticas RLS
- [x] Implementar storage-service.ts
- [x] Refatorar EnhancedAudioRecorder.tsx
- [x] Refatorar AudioRecorder.tsx
- [x] Verificar RecordingModal.tsx
- [x] Confirmar Edge Function
- [x] Atualizar tipos TypeScript
- [x] Criar documentação
- [ ] Executar SQL no Supabase Dashboard
- [ ] Testar upload de áudio
- [ ] Testar transcrição automática
- [ ] Verificar permissões RLS
- [ ] Deploy em produção

---

## 🆘 Troubleshooting

### Erro: "Bucket not found"

**Solução**: Execute `SETUP_STORAGE_BUCKETS.sql` no Supabase SQL Editor

### Erro: "Permission denied"

**Solução**: Verifique se as políticas RLS foram criadas corretamente

### Erro: "File too large"

**Solução**: Reduza o tamanho do áudio ou aumente o limite no bucket

### Transcrição não acontece

**Solução**: 
1. Verifique se o webhook está configurado
2. Verifique logs da Edge Function
3. Confirme que `GEMINI_API_KEY` está configurada

---

**Última atualização**: Novembro 2025  
**Versão**: 1.0.0  
**Autor**: Med Briefing Team
