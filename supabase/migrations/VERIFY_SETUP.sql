-- =====================================================
-- SCRIPT DE VERIFICAÇÃO
-- Execute este script após aplicar a migration
-- para verificar se tudo está correto
-- =====================================================

-- 1. Verificar estrutura da tabela recordings
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM
    information_schema.columns
WHERE
    table_schema = 'public'
    AND table_name = 'recordings'
ORDER BY
    ordinal_position;

-- 2. Verificar políticas RLS
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM
    pg_policies
WHERE
    tablename = 'recordings';

-- 3. Verificar índices
SELECT
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    tablename = 'recordings';

-- 4. Verificar se RLS está habilitado
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM
    pg_tables
WHERE
    tablename = 'recordings';

-- 5. Listar buckets de storage (se existirem)
SELECT
    id,
    name,
    public
FROM
    storage.buckets
WHERE
    name IN ('recordings', 'transcriptions');

-- =====================================================
-- RESULTADOS ESPERADOS:
-- =====================================================
-- 1. Tabela deve ter 12 colunas (id, user_id, name, audio_url, audio_file_path,
--    duration_seconds, file_size_bytes, transcription_url, transcription_text,
--    status, error_message, created_at, updated_at)
--
-- 2. Deve ter 4 políticas RLS (SELECT, INSERT, UPDATE, DELETE)
--
-- 3. Deve ter 3 índices
--
-- 4. RLS deve estar habilitado (rowsecurity = true)
--
-- 5. Deve listar 2 buckets: 'recordings' e 'transcriptions' (ambos public = true)
-- =====================================================
