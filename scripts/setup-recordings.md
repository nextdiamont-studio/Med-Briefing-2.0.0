# Setup de Gravações - Med Briefing

## Problema Identificado

A tabela `recordings` no banco de dados tinha uma estrutura diferente da esperada pelo código TypeScript, causando erros ao salvar gravações.

## Solução

### 1. Aplicar a Migration

Execute a migration SQL no Supabase Dashboard:

1. Acesse: https://pjbthsrnpytdaivchwqe.supabase.co
2. Vá para **SQL Editor**
3. Copie e cole o conteúdo do arquivo: `supabase/migrations/20250109_update_recordings_table.sql`
4. Clique em **Run** para executar

### 2. Criar os Buckets de Storage

Os buckets de storage precisam ser criados manualmente no Supabase:

1. Acesse: https://pjbthsrnpytdaivchwqe.supabase.co
2. Vá para **Storage** no menu lateral
3. Clique em **New Bucket**

#### Bucket: recordings
- **Name**: `recordings`
- **Public bucket**: ✅ SIM (marcar como público)
- **File size limit**: 50 MB
- **Allowed MIME types**: `audio/webm, audio/wav, audio/mp3, audio/mpeg, audio/ogg`

#### Bucket: transcriptions
- **Name**: `transcriptions`
- **Public bucket**: ✅ SIM (marcar como público)
- **File size limit**: 10 MB
- **Allowed MIME types**: `text/plain`

### 3. Configurar Políticas de Storage (RLS)

Para cada bucket, configure as políticas de acesso:

#### Para o bucket `recordings`:

```sql
-- Policy: Users can upload their own recordings
CREATE POLICY "Users can upload recordings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'recordings' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy: Users can read their own recordings
CREATE POLICY "Users can read own recordings"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'recordings' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy: Users can delete their own recordings
CREATE POLICY "Users can delete own recordings"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'recordings' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy: Public read access
CREATE POLICY "Public can read recordings"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'recordings');
```

#### Para o bucket `transcriptions`:

```sql
-- Policy: Users can upload their own transcriptions
CREATE POLICY "Users can upload transcriptions"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'transcriptions' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy: Users can read their own transcriptions
CREATE POLICY "Users can read own transcriptions"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'transcriptions' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy: Public read access
CREATE POLICY "Public can read transcriptions"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'transcriptions');
```

### 4. Verificar a Configuração

Após aplicar as mudanças, teste o salvamento de gravações:

1. Abra o aplicativo: http://localhost:5173
2. Faça login
3. Vá para **Gravações**
4. Clique em **Nova Gravação**
5. Digite um nome e grave alguns segundos
6. Pare a gravação e clique em **Salvar Gravação**

### 5. Verificar os Logs

Abra o DevTools (F12) e verifique:
- Console: deve mostrar logs de upload bem-sucedido
- Network: deve mostrar requisições para Supabase com status 200

## Estrutura da Tabela Atualizada

```sql
recordings (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    audio_url TEXT NOT NULL,
    audio_file_path TEXT NOT NULL,
    duration_seconds INTEGER,
    file_size_bytes BIGINT,
    transcription_url TEXT,
    transcription_text TEXT,
    status TEXT NOT NULL DEFAULT 'saved',
    error_message TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

## Problemas Comuns

### Erro: "Bucket não encontrado"
- **Solução**: Criar os buckets `recordings` e `transcriptions` no Supabase Dashboard

### Erro: "Permissão negada"
- **Solução**: Verificar se as políticas RLS estão configuradas corretamente

### Erro: "Column does not exist"
- **Solução**: Executar a migration `20250109_update_recordings_table.sql`

## Teste Final

Execute este SQL para verificar se a tabela está correta:

```sql
SELECT
    column_name,
    data_type,
    is_nullable
FROM
    information_schema.columns
WHERE
    table_name = 'recordings'
ORDER BY
    ordinal_position;
```

Deve retornar todas as colunas listadas na estrutura acima.
