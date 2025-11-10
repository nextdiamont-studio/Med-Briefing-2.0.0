-- ============================================================
-- SETUP WEBHOOK PARA TRANSCRIÇÃO AUTOMÁTICA
-- ============================================================
-- Este script configura um webhook que chama a Edge Function
-- automaticamente quando uma nova gravação é inserida
-- ============================================================

-- 1. CRIAR WEBHOOK PARA TRANSCRIÇÃO
-- Execute este comando no Supabase Dashboard (Database > Webhooks)
-- OU use a Supabase CLI:
--
-- supabase db webhook create transcribe-recording \
--   --event INSERT \
--   --table recordings \
--   --hook-url https://[PROJECT-REF].supabase.co/functions/v1/transcribe-recording \
--   --http-header "Authorization=Bearer [SERVICE-ROLE-KEY]"

-- ============================================================
-- CONFIGURAÇÃO MANUAL VIA DASHBOARD
-- ============================================================
-- 1. Acessar: https://pjbthsrnpytdaivchwqe.supabase.co/project/_/database/webhooks
-- 2. Clicar em "Create a new webhook"
-- 3. Preencher:
--    - Name: transcribe-recording
--    - Table: recordings
--    - Events: INSERT
--    - Type: HTTP Request
--    - Method: POST
--    - URL: https://pjbthsrnpytdaivchwqe.supabase.co/functions/v1/transcribe-recording
--    - HTTP Headers:
--      * Authorization: Bearer [SUPABASE_SERVICE_ROLE_KEY]
--      * Content-Type: application/json
-- 4. Clicar em "Create webhook"

-- ============================================================
-- VARIÁVEIS DE AMBIENTE NECESSÁRIAS
-- ============================================================
-- Configure estas variáveis na Edge Function (Project Settings > Edge Functions):
--
-- SUPABASE_URL=https://pjbthsrnpytdaivchwqe.supabase.co
-- SUPABASE_SERVICE_ROLE_KEY=[sua-service-role-key]
-- GEMINI_API_KEY=[sua-gemini-api-key]

-- ============================================================
-- COMO OBTER A GEMINI API KEY
-- ============================================================
-- 1. Acessar: https://aistudio.google.com/apikey
-- 2. Fazer login com conta Google
-- 3. Clicar em "Get API Key"
-- 4. Criar nova API Key ou usar existente
-- 5. Copiar a chave e adicionar nas variáveis de ambiente

-- ============================================================
-- VERIFICAÇÃO DE FUNCIONAMENTO
-- ============================================================
-- Para testar se o webhook está funcionando:

-- 1. Verificar logs da Edge Function:
SELECT * FROM edge_functions_logs
WHERE function_name = 'transcribe-recording'
ORDER BY created_at DESC
LIMIT 10;

-- 2. Verificar gravações processadas:
SELECT
  id,
  name,
  status,
  error_message,
  transcription_text IS NOT NULL as has_transcription,
  created_at,
  updated_at
FROM recordings
ORDER BY created_at DESC
LIMIT 10;

-- 3. Testar manualmente chamando a função:
-- POST https://pjbthsrnpytdaivchwqe.supabase.co/functions/v1/transcribe-recording
-- Headers:
--   Authorization: Bearer [SERVICE_ROLE_KEY]
--   Content-Type: application/json
-- Body:
-- {
--   "type": "INSERT",
--   "table": "recordings",
--   "record": {
--     "id": "[recording-id]",
--     "user_id": "[user-id]",
--     "name": "Test Recording",
--     "audio_url": "[audio-url]",
--     "audio_file_path": "[file-path]",
--     "status": "processing"
--   },
--   "schema": "public",
--   "old_record": null
-- }

-- ============================================================
-- TROUBLESHOOTING
-- ============================================================

-- Se o webhook não estiver disparando:
-- 1. Verificar se a Edge Function está deployada
-- 2. Verificar se as variáveis de ambiente estão configuradas
-- 3. Verificar logs do webhook no Dashboard
-- 4. Testar manualmente via curl/Postman

-- Se a transcrição falhar:
-- 1. Verificar se o bucket 'transcriptions' existe
-- 2. Verificar se a Gemini API Key é válida
-- 3. Verificar tamanho do arquivo de áudio (limite Gemini: ~20MB)
-- 4. Verificar logs da Edge Function

-- ============================================================
-- COMANDOS ÚTEIS SUPABASE CLI
-- ============================================================
-- Deployar Edge Function:
-- supabase functions deploy transcribe-recording

-- Ver logs em tempo real:
-- supabase functions logs transcribe-recording --follow

-- Testar localmente:
-- supabase functions serve transcribe-recording

-- Invocar manualmente:
-- supabase functions invoke transcribe-recording \
--   --body '{"type":"INSERT","table":"recordings","record":{"id":"..."}}'
