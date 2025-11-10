-- ====================================================
-- ATUALIZAR STATUS DA TABELA RECORDINGS
-- ADICIONAR NOVO STATUS 'saved' PARA GRAVAÇÕES SEM TRANSCRIÇÃO
-- ====================================================

-- 1. Remover constraint antiga
ALTER TABLE recordings
DROP CONSTRAINT IF EXISTS recordings_status_check;

-- 2. Adicionar novo constraint com status 'saved'
ALTER TABLE recordings
ADD CONSTRAINT recordings_status_check
CHECK (status IN ('saved', 'processing', 'completed', 'failed'));

-- 3. Atualizar gravações existentes com status 'processing' sem transcrição para 'saved'
UPDATE recordings
SET status = 'saved'
WHERE status = 'processing'
  AND transcription_url IS NULL
  AND transcription_text IS NULL;

-- 4. Verificação
SELECT
  status,
  COUNT(*) as total,
  COUNT(transcription_url) as with_transcription
FROM recordings
GROUP BY status
ORDER BY status;

SELECT 'Atualização concluída com sucesso!' as message;
