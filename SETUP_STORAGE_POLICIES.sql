-- ====================================================
-- CONFIGURAR POLÍTICAS DE STORAGE
-- Execute este SQL após criar os buckets no Supabase
-- ====================================================

-- Remover políticas existentes de storage para recordings
DROP POLICY IF EXISTS "Users can upload own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own recordings storage" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own recordings storage" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for recordings" ON storage.objects;

-- Remover políticas existentes de storage para transcriptions
DROP POLICY IF EXISTS "Users can view own transcriptions storage" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for transcriptions" ON storage.objects;

-- ====================================================
-- POLÍTICAS PARA BUCKET 'recordings'
-- ====================================================

-- Permitir que usuários façam upload de seus próprios arquivos
CREATE POLICY "Users can upload own recordings"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'recordings' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir leitura pública de todos os recordings
CREATE POLICY "Public read access for recordings"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'recordings');

-- Permitir que usuários deletem seus próprios arquivos
CREATE POLICY "Users can delete own recordings storage"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'recordings' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ====================================================
-- POLÍTICAS PARA BUCKET 'transcriptions'
-- ====================================================

-- Permitir leitura pública de todas as transcrições
CREATE POLICY "Public read access for transcriptions"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'transcriptions');

-- ====================================================
-- VERIFICAÇÃO
-- ====================================================

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY policyname;
