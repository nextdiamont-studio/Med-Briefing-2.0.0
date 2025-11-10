-- ====================================================
-- CONFIGURAÇÃO COMPLETA DE STORAGE BUCKETS
-- Execute este SQL no Supabase SQL Editor
-- ====================================================

-- ====================================================
-- 1. CRIAR BUCKETS
-- ====================================================

-- Criar bucket para gravações de áudio
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recordings',
  'recordings',
  true,
  52428800, -- 50MB em bytes
  ARRAY['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg'];

-- Criar bucket para transcrições
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'transcriptions',
  'transcriptions',
  true,
  10485760, -- 10MB em bytes
  ARRAY['text/plain']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['text/plain'];

-- ====================================================
-- 2. REMOVER POLÍTICAS ANTIGAS (SE EXISTIREM)
-- ====================================================

DROP POLICY IF EXISTS "Users can upload own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own recordings storage" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own recordings storage" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own transcriptions storage" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for transcriptions" ON storage.objects;
DROP POLICY IF EXISTS "Service role can manage transcriptions" ON storage.objects;

-- ====================================================
-- 3. POLÍTICAS PARA BUCKET 'recordings'
-- ====================================================

-- Permitir que usuários autenticados façam upload de seus próprios arquivos
CREATE POLICY "Users can upload own recordings"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'recordings' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir leitura pública de todos os recordings
CREATE POLICY "Public read access for recordings"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'recordings');

-- Permitir que usuários deletem seus próprios arquivos
CREATE POLICY "Users can delete own recordings storage"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'recordings' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir que usuários atualizem seus próprios arquivos
CREATE POLICY "Users can update own recordings"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'recordings' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ====================================================
-- 4. POLÍTICAS PARA BUCKET 'transcriptions'
-- ====================================================

-- Permitir leitura pública de todas as transcrições
CREATE POLICY "Public read access for transcriptions"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'transcriptions');

-- Permitir que service role (Edge Functions) faça upload de transcrições
CREATE POLICY "Service role can manage transcriptions"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'transcriptions');

-- Permitir que usuários deletem suas próprias transcrições
CREATE POLICY "Users can delete own transcriptions"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'transcriptions' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ====================================================
-- 5. VERIFICAÇÃO
-- ====================================================

-- Verificar buckets criados
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE id IN ('recordings', 'transcriptions')
ORDER BY id;

-- Verificar políticas criadas
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
  AND policyname LIKE '%recording%' OR policyname LIKE '%transcription%'
ORDER BY policyname;

-- ====================================================
-- 6. TESTE DE PERMISSÕES (OPCIONAL)
-- ====================================================

-- Testar se usuário autenticado pode fazer upload
-- Executar como usuário autenticado:
-- SELECT storage.foldername('{user_id}/test.webm');

COMMENT ON TABLE storage.buckets IS 'Buckets configurados para Med Briefing 2.0';
