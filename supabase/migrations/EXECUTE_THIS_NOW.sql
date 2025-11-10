-- =====================================================
-- MIGRATION COMPLETA: Corrigir Tabela Recordings
-- Execute este arquivo no SQL Editor do Supabase
-- =====================================================

-- 1. Remover tabela antiga se existir
DROP TABLE IF EXISTS recordings CASCADE;

-- 2. Criar nova tabela com estrutura correta
CREATE TABLE recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    audio_url TEXT NOT NULL,
    audio_file_path TEXT NOT NULL,
    duration_seconds INTEGER,
    file_size_bytes BIGINT,
    transcription_url TEXT,
    transcription_text TEXT,
    status TEXT NOT NULL DEFAULT 'saved' CHECK (status IN ('saved', 'processing', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Criar índices para performance
CREATE INDEX idx_recordings_user_id ON recordings(user_id);
CREATE INDEX idx_recordings_created_at ON recordings(created_at DESC);
CREATE INDEX idx_recordings_status ON recordings(status);

-- 4. Habilitar Row Level Security
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS para a tabela recordings
CREATE POLICY "Users can view own recordings" ON recordings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recordings" ON recordings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recordings" ON recordings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recordings" ON recordings
    FOR DELETE USING (auth.uid() = user_id);

-- 6. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Criar trigger para updated_at
CREATE TRIGGER update_recordings_updated_at
    BEFORE UPDATE ON recordings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SUCESSO! Tabela recordings criada com sucesso
-- =====================================================

-- Agora você precisa criar os BUCKETS manualmente:
-- 1. Vá para Storage > New Bucket
-- 2. Crie bucket "recordings" (público)
-- 3. Crie bucket "transcriptions" (público)
