# Troubleshooting - Sistema de Gravações

## Erro: "Falha no upload: new row violates row-level security policy"

Este erro ocorre quando as políticas RLS da tabela `recordings` não estão configuradas corretamente.

### Solução Passo a Passo:

---

## PASSO 1: Verificar se a tabela existe

Execute no Supabase SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'recordings';
```

**Se retornar vazio:** Execute o arquivo `EXECUTE_THIS_SQL.sql` completo.

---

## PASSO 2: Verificar buckets de Storage

Vá em **Storage** no Supabase Dashboard e verifique se existem:

1. ✅ Bucket `recordings`
   - Public: **SIM**
   - Allowed MIME types: `audio/*`
   - File size limit: 100 MB

2. ✅ Bucket `transcriptions`
   - Public: **SIM**
   - Allowed MIME types: `text/plain`
   - File size limit: 10 MB

**Se não existirem:** Crie-os manualmente no Dashboard.

---

## PASSO 3: Configurar políticas de Storage

Execute o arquivo `SETUP_STORAGE_POLICIES.sql` no Supabase SQL Editor.

---

## PASSO 4: Testar permissões

Execute este teste no SQL Editor:

```sql
-- Testar se você está autenticado
SELECT auth.uid() as meu_user_id;

-- Se retornar NULL, você não está autenticado no SQL Editor
-- Isso é NORMAL. As políticas funcionarão quando você usar a aplicação.

-- Testar políticas da tabela recordings
SELECT
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'recordings'
ORDER BY policyname;

-- Deve retornar 4 políticas:
-- 1. Users can create own recordings (INSERT)
-- 2. Users can delete own recordings (DELETE)
-- 3. Users can update own recordings (UPDATE)
-- 4. Users can view own recordings (SELECT)
```

---

## PASSO 5: Verificar logs do navegador

Abra o **Console do navegador** (F12) e tente gravar novamente.

Procure por erros como:

```
[RecordingModal] Error: ...
[Storage] Upload error: ...
```

### Possíveis erros e soluções:

#### Erro: "new row violates row-level security policy"
**Causa:** Política INSERT está bloqueando
**Solução:** Reexecutar `EXECUTE_THIS_SQL.sql` (passos 4-6)

#### Erro: "Storage bucket not found"
**Causa:** Bucket `recordings` não existe
**Solução:** Criar bucket manualmente no Dashboard

#### Erro: "Policy check violation"
**Causa:** Usuário não autenticado ou user_id incorreto
**Solução:** Fazer logout e login novamente

#### Erro: "Permission denied for storage"
**Causa:** Políticas de Storage não configuradas
**Solução:** Executar `SETUP_STORAGE_POLICIES.sql`

---

## PASSO 6: Verificar autenticação

Execute no Console do navegador (F12):

```javascript
// Verificar se usuário está autenticado
const { data: { user } } = await supabase.auth.getUser();
console.log('Usuário atual:', user?.id);

// Deve retornar o ID do usuário
// Se retornar null, faça logout e login novamente
```

---

## Checklist Completo

Antes de gravar, confirme que:

- [ ] Tabela `recordings` existe e está configurada
- [ ] RLS está habilitado na tabela `recordings`
- [ ] 4 políticas RLS estão criadas (SELECT, INSERT, UPDATE, DELETE)
- [ ] Bucket `recordings` existe e é público
- [ ] Bucket `transcriptions` existe e é público
- [ ] Políticas de Storage estão configuradas
- [ ] Usuário está autenticado (verificar no Console)
- [ ] Navegador tem permissão para usar o microfone

---

## Script Completo de Setup

Se nada funcionar, execute TODOS os comandos abaixo em sequência:

```sql
-- 1. LIMPAR TUDO
DROP TABLE IF EXISTS recordings CASCADE;

-- 2. CRIAR TABELA
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
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. ÍNDICES
CREATE INDEX idx_recordings_user_id ON recordings(user_id);
CREATE INDEX idx_recordings_status ON recordings(status);
CREATE INDEX idx_recordings_created_at ON recordings(created_at DESC);

-- 4. HABILITAR RLS
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS RLS
CREATE POLICY "Users can view own recordings"
  ON recordings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own recordings"
  ON recordings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recordings"
  ON recordings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recordings"
  ON recordings FOR DELETE
  USING (auth.uid() = user_id);

-- 6. TRIGGER
CREATE OR REPLACE FUNCTION update_recordings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recordings_updated_at
  BEFORE UPDATE ON recordings
  FOR EACH ROW
  EXECUTE FUNCTION update_recordings_updated_at();

-- 7. POLÍTICAS DE STORAGE
CREATE POLICY "Users can upload own recordings"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'recordings' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public read access for recordings"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'recordings');

-- 8. VERIFICAR
SELECT 'Setup completo!' as status;
SELECT COUNT(*) as total_policies FROM pg_policies WHERE tablename = 'recordings';
```

---

## Ainda não funciona?

Se após todos os passos ainda der erro, compartilhe:

1. A mensagem completa do erro no Console (F12)
2. O resultado de: `SELECT * FROM pg_policies WHERE tablename = 'recordings';`
3. O resultado de: `SELECT bucket_id, name FROM storage.buckets;`
