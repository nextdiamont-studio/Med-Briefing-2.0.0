-- ============================================================================
-- STORAGE POLICIES - CONFIGURAÇÃO COMPLETA
-- ============================================================================

-- ============================================================================
-- BUCKET: RECORDINGS (Gravações de Áudio)
-- ============================================================================

-- Criar bucket 'recordings' se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'recordings',
    'recordings',
    false,
    52428800, -- 50MB
    ARRAY['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg']
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Política: Usuários podem fazer upload de suas próprias gravações
CREATE POLICY "Users can upload own recordings"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'recordings' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Política: Usuários podem ver suas próprias gravações
CREATE POLICY "Users can view own recordings"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'recordings' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Política: Usuários podem atualizar suas próprias gravações
CREATE POLICY "Users can update own recordings"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'recordings' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Política: Usuários podem deletar suas próprias gravações
CREATE POLICY "Users can delete own recordings"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'recordings' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- ============================================================================
-- BUCKET: AVATARS (Imagens de Perfil)
-- ============================================================================

-- Criar bucket 'avatars' se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Política: Usuários podem fazer upload de seu próprio avatar
CREATE POLICY "Users can upload own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Política: Avatars são públicos (qualquer um pode ver)
CREATE POLICY "Avatars are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

-- Política: Usuários podem atualizar seu próprio avatar
CREATE POLICY "Users can update own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Política: Usuários podem deletar seu próprio avatar
CREATE POLICY "Users can delete own avatar"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

-- Verificar buckets criados
SELECT id, name, public, file_size_limit
FROM storage.buckets
ORDER BY name;

-- Verificar políticas de storage
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'storage'
ORDER BY policyname;
