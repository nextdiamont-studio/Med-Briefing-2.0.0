# 🤖 PLANO COMPLETO PARA IA CONFIGURAR SUPABASE

## 📋 VISÃO GERAL

Este documento fornece um plano passo a passo para que uma IA (como Claude, ChatGPT, Cursor, etc.) configure completamente o banco de dados Supabase do Med Briefing 2.0.

**ID do Projeto Supabase:** `pjbthsrnpytdaivchwqe`

---

## 🎯 OBJETIVO FINAL

Criar e configurar toda infraestrutura de banco de dados para suportar:
- ✅ Análises de Performance (Framework v3.0 com 15 etapas)
- ✅ Análises SPIN (briefings pré-consulta)
- ✅ Armazenamento de gravações de áudio
- ✅ Perfis comportamentais DISC
- ✅ Sistema de auditoria completo
- ✅ Row-Level Security (RLS) para todos os dados
- ✅ Políticas de acesso por usuário

---

## 📊 ARQUITETURA DO BANCO DE DADOS

### Estrutura de Tabelas (Hierarquia):

```
auth.users (Supabase Auth - já existe)
    ↓
analyses (tabela principal)
    ├── performance_analyses (análises de consultas)
    │   ├── analysis_phases (4 fases)
    │   │   └── analysis_steps (16 passos)
    │   ├── lost_sale_details (vendas perdidas)
    │   │   ├── critical_errors
    │   │   ├── correction_strategies
    │   │   └── behavioral_reports
    │   └── realized_sale_details (vendas realizadas)
    │       └── success_factors
    │
    └── spin_qualifications (briefings SPIN)
        ├── spin_situation_analysis
        ├── spin_problem_analysis
        ├── spin_implication_analysis
        └── spin_need_payoff_analysis

recordings (gravações de áudio)

analysis_frameworks (configs de frameworks versionados)
behavioral_profiles_config (perfis DISC)
prompt_audit_log (auditoria de prompts)
```

---

## 🚀 PASSO A PASSO PARA A IA

### FASE 1: PREPARAÇÃO (5 min)

#### 1.1 Verificar Acesso ao Supabase
```bash
# A IA deve executar:
supabase status

# Resultado esperado:
# - Supabase CLI conectado
# - Projeto: pjbthsrnpytdaivchwqe
```

#### 1.2 Verificar Migrations Existentes
```bash
supabase db diff

# Verificar quais migrations já foram aplicadas
```

---

### FASE 2: CRIAR ESTRUTURA DE TABELAS (20 min)

#### 2.1 Executar Migration: Tabelas de Análise
**Arquivo:** `supabase/migrations/20250107_create_analysis_tables.sql`

**O que faz:**
- Cria tipos ENUM (analysis_type, consultation_outcome, behavioral_profile, performance_rating)
- Cria tabela `analyses` (principal)
- Cria tabela `performance_analyses` (análises de consultas)
- Cria tabela `spin_qualifications` (briefings SPIN)
- Cria tabela `analysis_phases` (4 fases)
- Cria tabela `analysis_steps` (16 passos)
- Cria tabela `lost_sale_details` (detalhes de vendas perdidas)
- Cria tabela `critical_errors` (erros críticos)
- Cria tabela `correction_strategies` (estratégias de correção)
- Cria tabelas de SPIN (situation, problem, implication, need_payoff)

**Comando:**
```bash
supabase db push
```

**Verificação:**
```sql
-- A IA deve executar e verificar resultado:
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Resultado esperado: 15-20 tabelas criadas
```

---

#### 2.2 Executar Migration: Tabela de Gravações
**Arquivo:** `supabase/migrations/20250109_update_recordings_table.sql`

**O que faz:**
- Cria/atualiza tabela `recordings`
- Adiciona campos: user_id, patient_name, file_path, duration, etc.
- Configura relação com auth.users

**Comando:**
```bash
supabase db push
```

---

#### 2.3 Executar Migration: Sistema de Framework
**Arquivo:** `supabase/migrations/20250110_prompt_framework_system.sql`

**O que faz:**
- Cria tabela `analysis_frameworks` (armazena versões de frameworks)
- Cria tabela `behavioral_profiles_config` (perfis DISC)
- Cria tabela `prompt_audit_log` (auditoria de prompts)
- Insere dados iniciais dos frameworks

**Comando:**
```bash
supabase db push
```

**Verificação:**
```sql
-- Verificar frameworks criados
SELECT version, name, is_active
FROM analysis_frameworks
ORDER BY created_at DESC;

-- Resultado esperado: 2-3 frameworks (v1.0, v2.0, v3.0)
```

---

#### 2.4 Executar Migration: Framework v3.0 (15 Etapas)
**Arquivo:** `supabase/migrations/20250112_framework_v3_15_steps.sql`

**O que faz:**
- Desativa framework v2.0
- Ativa framework v3.0 com 15 etapas
- Atualiza perfis DISC com scripts completos
- Adiciona estratégias de venda por perfil

**Comando:**
```bash
supabase db push
```

**Verificação:**
```sql
-- Verificar framework ativo
SELECT version, name, is_active,
       jsonb_array_length(methodology_steps) as total_steps
FROM analysis_frameworks
WHERE is_active = true;

-- Resultado esperado: v3.0 ativo com 15 steps

-- Verificar perfis DISC
SELECT profile_type, display_name,
       jsonb_array_length(characteristics) as total_characteristics
FROM behavioral_profiles_config;

-- Resultado esperado: 4 perfis (Dominante, Influente, Estável, Analítico)
```

---

### FASE 3: CONFIGURAR POLÍTICAS DE SEGURANÇA (15 min)

#### 3.1 Habilitar RLS em Todas as Tabelas

**Script SQL a executar:**
```sql
-- ============================================================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Tabelas principais
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

-- Tabelas de detalhes
ALTER TABLE lost_sale_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE critical_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE correction_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavioral_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE identified_strengths ENABLE ROW LEVEL SECURITY;
ALTER TABLE errors_for_correction ENABLE ROW LEVEL SECURITY;
ALTER TABLE final_coaching_plans ENABLE ROW LEVEL SECURITY;

-- Tabelas SPIN
ALTER TABLE spin_situation_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_problem_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_implication_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_need_payoff_analysis ENABLE ROW LEVEL SECURITY;

-- Tabelas de controle crítico
ALTER TABLE critical_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE essential_control_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE fatal_errors ENABLE ROW LEVEL SECURITY;
```

**Comando:**
```bash
# Salvar script acima em arquivo temporário
echo "SCRIPT_ACIMA" > /tmp/enable_rls.sql

# Executar
supabase db execute -f /tmp/enable_rls.sql
```

---

#### 3.2 Criar Políticas de Acesso por Usuário

**Script SQL a executar:**
```sql
-- ============================================================================
-- POLÍTICAS RLS - ACESSO BASEADO EM USUÁRIO
-- ============================================================================

-- Política: Usuários só veem suas próprias análises
CREATE POLICY "Users can view own analyses"
    ON analyses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses"
    ON analyses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses"
    ON analyses FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses"
    ON analyses FOR DELETE
    USING (auth.uid() = user_id);

-- Política: Performance Analyses (cascade via analyses)
CREATE POLICY "Users can view own performance analyses"
    ON performance_analyses FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM analyses
        WHERE analyses.id = performance_analyses.id
        AND analyses.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert own performance analyses"
    ON performance_analyses FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM analyses
        WHERE analyses.id = performance_analyses.id
        AND analyses.user_id = auth.uid()
    ));

-- Política: Gravações
CREATE POLICY "Users can view own recordings"
    ON recordings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recordings"
    ON recordings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recordings"
    ON recordings FOR DELETE
    USING (auth.uid() = user_id);

-- Política: Tabelas de configuração (leitura pública para usuários autenticados)
CREATE POLICY "Authenticated users can view frameworks"
    ON analysis_frameworks FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can view behavioral profiles"
    ON behavioral_profiles_config FOR SELECT
    TO authenticated
    USING (true);

-- Política: Auditoria (só admins podem ler)
CREATE POLICY "Only admins can view audit logs"
    ON prompt_audit_log FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );
```

**Comando:**
```bash
# Salvar e executar
echo "SCRIPT_ACIMA" > /tmp/create_policies.sql
supabase db execute -f /tmp/create_policies.sql
```

**Verificação:**
```sql
-- Verificar políticas criadas
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Resultado esperado: 20+ políticas criadas
```

---

### FASE 4: CONFIGURAR STORAGE (10 min)

#### 4.1 Criar Bucket para Gravações

**Script SQL a executar:**
```sql
-- Criar bucket 'recordings' se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('recordings', 'recordings', false)
ON CONFLICT (id) DO NOTHING;

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

-- Política: Usuários podem deletar suas próprias gravações
CREATE POLICY "Users can delete own recordings"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'recordings' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );
```

**Comando:**
```bash
echo "SCRIPT_ACIMA" > /tmp/setup_storage.sql
supabase db execute -f /tmp/setup_storage.sql
```

---

#### 4.2 Criar Bucket para Imagens de Perfil

**Script SQL a executar:**
```sql
-- Criar bucket 'avatars' se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

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
```

**Comando:**
```bash
echo "SCRIPT_ACIMA" > /tmp/setup_avatars.sql
supabase db execute -f /tmp/setup_avatars.sql
```

---

### FASE 5: CRIAR ÍNDICES DE PERFORMANCE (5 min)

#### 5.1 Adicionar Índices

**Script SQL a executar:**
```sql
-- ============================================================================
-- ÍNDICES PARA MELHORAR PERFORMANCE
-- ============================================================================

-- Índices em analyses
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_type ON analyses(analysis_type);

-- Índices em performance_analyses
CREATE INDEX IF NOT EXISTS idx_performance_outcome ON performance_analyses(outcome);
CREATE INDEX IF NOT EXISTS idx_performance_rating ON performance_analyses(overall_rating);
CREATE INDEX IF NOT EXISTS idx_performance_profile ON performance_analyses(behavioral_profile);

-- Índices em recordings
CREATE INDEX IF NOT EXISTS idx_recordings_user_id ON recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_recordings_created_at ON recordings(created_at DESC);

-- Índices em analysis_phases
CREATE INDEX IF NOT EXISTS idx_phases_analysis_id ON analysis_phases(performance_analysis_id);
CREATE INDEX IF NOT EXISTS idx_phases_number ON analysis_phases(phase_number);

-- Índices em analysis_steps
CREATE INDEX IF NOT EXISTS idx_steps_phase_id ON analysis_steps(phase_id);
CREATE INDEX IF NOT EXISTS idx_steps_number ON analysis_steps(step_number);

-- Índice em prompt_audit_log para consultas por data
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON prompt_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON prompt_audit_log(user_id);
```

**Comando:**
```bash
echo "SCRIPT_ACIMA" > /tmp/create_indexes.sql
supabase db execute -f /tmp/create_indexes.sql
```

**Verificação:**
```sql
-- Verificar índices criados
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Resultado esperado: 10-15 índices
```

---

### FASE 6: INSERIR DADOS INICIAIS (5 min)

#### 6.1 Verificar Dados de Framework

**Script SQL a executar:**
```sql
-- Verificar se framework v3.0 está ativo
SELECT version, name, is_active,
       jsonb_array_length(methodology_steps) as total_steps
FROM analysis_frameworks
ORDER BY created_at DESC;

-- Se não existir, inserir manualmente
-- (o arquivo 20250112_framework_v3_15_steps.sql já faz isso)
```

---

#### 6.2 Verificar Perfis DISC

**Script SQL a executar:**
```sql
-- Verificar perfis DISC
SELECT profile_type, display_name,
       jsonb_array_length(characteristics) as total_chars,
       jsonb_array_length(keywords) as total_keywords
FROM behavioral_profiles_config
ORDER BY profile_type;

-- Resultado esperado: 4 perfis
-- - analytical
-- - dominant
-- - influential
-- - steady
```

---

### FASE 7: TESTES E VALIDAÇÃO (10 min)

#### 7.1 Testar Inserção de Dados

**Script SQL a executar:**
```sql
-- ============================================================================
-- SCRIPT DE TESTE - NÃO EXECUTAR EM PRODUÇÃO
-- ============================================================================

-- 1. Criar análise de teste (substitua USER_ID_AQUI pelo ID real)
DO $$
DECLARE
    test_user_id UUID := 'USER_ID_AQUI'; -- ← SUBSTITUIR
    test_analysis_id UUID;
BEGIN
    -- Inserir análise
    INSERT INTO analyses (user_id, analysis_type, patient_name, file_name)
    VALUES (test_user_id, 'performance', 'Paciente Teste', 'teste.mp3')
    RETURNING id INTO test_analysis_id;

    -- Inserir performance analysis
    INSERT INTO performance_analyses (
        id, outcome, is_low_quality_sale, ticket_value,
        overall_score, overall_rating, overall_summary,
        behavioral_profile, profile_justification
    )
    VALUES (
        test_analysis_id,
        'Venda Perdida',
        false,
        2500.00,
        75,
        'Moderado',
        'Teste de análise',
        'Dominante',
        'Perfil identificado pelos indicadores de objetividade'
    );

    RAISE NOTICE 'Teste concluído com sucesso! Analysis ID: %', test_analysis_id;
END $$;

-- 2. Verificar se foi criado
SELECT a.id, a.patient_name, pa.outcome, pa.overall_score
FROM analyses a
JOIN performance_analyses pa ON pa.id = a.id
WHERE a.patient_name = 'Paciente Teste';

-- 3. Deletar teste
DELETE FROM analyses WHERE patient_name = 'Paciente Teste';
```

**⚠️ ATENÇÃO:** A IA deve substituir `USER_ID_AQUI` por um UUID real antes de executar.

---

#### 7.2 Verificar RLS

**Script SQL a executar:**
```sql
-- Verificar se RLS está ativo em todas as tabelas
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true
ORDER BY tablename;

-- Resultado esperado: Todas as tabelas principais com RLS ativo
```

---

#### 7.3 Verificar Storage

**Consulta no Supabase Dashboard:**
```
1. Ir para Storage
2. Verificar buckets:
   - recordings (privado)
   - avatars (público)
3. Verificar políticas de acesso
```

---

### FASE 8: DEPLOY DE EDGE FUNCTIONS (10 min)

#### 8.1 Deploy de Todas as Functions

**Comandos:**
```bash
# Deploy analyze-consultation-v3 (função principal)
supabase functions deploy analyze-consultation-v3

# Deploy outras funções auxiliares
supabase functions deploy generate-briefing
supabase functions deploy generate-spin-briefing
supabase functions deploy transcribe-recording

# Verificar deploy
supabase functions list
```

---

#### 8.2 Configurar Secrets das Edge Functions

**Comandos:**
```bash
# Configurar Gemini API Key
supabase secrets set GEMINI_API_KEY=sua_chave_aqui

# Verificar secrets configurados
supabase secrets list
```

---

### FASE 9: VERIFICAÇÃO FINAL (5 min)

#### 9.1 Checklist Completo

**A IA deve executar e verificar:**

```sql
-- ============================================================================
-- CHECKLIST DE VERIFICAÇÃO FINAL
-- ============================================================================

-- 1. Verificar tabelas criadas (esperado: 15-20)
SELECT COUNT(*) as total_tables
FROM information_schema.tables
WHERE table_schema = 'public';

-- 2. Verificar RLS ativo (esperado: 15-20)
SELECT COUNT(*) as tables_with_rls
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = true;

-- 3. Verificar políticas criadas (esperado: 20+)
SELECT COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public';

-- 4. Verificar índices criados (esperado: 10-15)
SELECT COUNT(*) as total_indexes
FROM pg_indexes
WHERE schemaname = 'public';

-- 5. Verificar framework ativo
SELECT version, is_active,
       jsonb_array_length(methodology_steps) as steps
FROM analysis_frameworks
WHERE is_active = true;
-- Esperado: v3.0, true, 15

-- 6. Verificar perfis DISC
SELECT COUNT(*) as total_profiles
FROM behavioral_profiles_config;
-- Esperado: 4

-- 7. Verificar storage buckets
SELECT id, name, public
FROM storage.buckets
ORDER BY name;
-- Esperado: avatars (public=true), recordings (public=false)

-- 8. Verificar políticas de storage
SELECT COUNT(*) as storage_policies
FROM pg_policies
WHERE schemaname = 'storage';
-- Esperado: 6-8 políticas
```

---

#### 9.2 Relatório de Status

**A IA deve gerar um relatório assim:**

```markdown
# ✅ CONFIGURAÇÃO SUPABASE CONCLUÍDA

## Status Geral
- ✅ Tabelas criadas: 18/18
- ✅ RLS habilitado: 18/18
- ✅ Políticas criadas: 24/24
- ✅ Índices criados: 12/12
- ✅ Framework v3.0 ativo: Sim (15 etapas)
- ✅ Perfis DISC configurados: 4/4
- ✅ Storage configurado: 2 buckets
- ✅ Edge Functions deployed: 4/4

## Detalhes

### Tabelas Principais
- analyses
- performance_analyses
- spin_qualifications
- recordings
- analysis_frameworks
- behavioral_profiles_config
- prompt_audit_log

### Storage Buckets
- recordings (privado)
- avatars (público)

### Edge Functions
- analyze-consultation-v3
- generate-briefing
- generate-spin-briefing
- transcribe-recording

## Próximos Passos
1. Testar criação de análise via frontend
2. Verificar upload de gravações
3. Validar geração de relatórios
```

---

## 🔧 TROUBLESHOOTING PARA A IA

### Erro: "permission denied for table X"
**Solução:** Verificar se RLS está ativo e políticas foram criadas

```sql
-- Verificar RLS
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'nome_tabela';

-- Listar políticas
SELECT * FROM pg_policies WHERE tablename = 'nome_tabela';
```

### Erro: "relation X does not exist"
**Solução:** Executar migrations na ordem correta

```bash
supabase db reset  # Reset e re-executar todas
supabase db push   # Aplicar migrations
```

### Erro: "bucket already exists"
**Solução:** Usar INSERT ... ON CONFLICT DO NOTHING

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('nome', 'nome', false)
ON CONFLICT (id) DO NOTHING;
```

---

## 📝 SCRIPT COMPLETO DE SETUP (PARA IA EXECUTAR)

```bash
#!/bin/bash
# Script de setup completo para IA executar

set -e  # Parar em caso de erro

echo "🚀 Iniciando configuração do Supabase..."

# 1. Verificar conexão
echo "1️⃣ Verificando conexão..."
supabase status

# 2. Reset do banco (CUIDADO: apaga tudo!)
echo "2️⃣ Resetando banco de dados..."
read -p "Tem certeza? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    supabase db reset
fi

# 3. Aplicar migrations
echo "3️⃣ Aplicando migrations..."
supabase db push

# 4. Criar políticas de storage
echo "4️⃣ Configurando storage..."
supabase db execute -f supabase/migrations/storage_policies.sql

# 5. Deploy de Edge Functions
echo "5️⃣ Fazendo deploy das Edge Functions..."
supabase functions deploy analyze-consultation-v3
supabase functions deploy generate-briefing
supabase functions deploy generate-spin-briefing
supabase functions deploy transcribe-recording

# 6. Verificação final
echo "6️⃣ Verificando setup..."
supabase db execute -f supabase/migrations/VERIFY_SETUP.sql

echo "✅ Configuração concluída!"
```

---

## 🎓 INSTRUÇÕES PARA A IA

### Como usar este plano:

1. **Leia todo o documento primeiro** antes de executar qualquer comando
2. **Execute as fases em ordem** (1 → 2 → 3 → ... → 9)
3. **Verifique cada passo** antes de prosseguir para o próximo
4. **Salve os scripts SQL** em arquivos temporários antes de executar
5. **Documente erros** e soluções encontradas
6. **Gere relatório final** ao concluir

### Comandos que a IA pode executar:

✅ Permitidos:
- `supabase status`
- `supabase db push`
- `supabase db execute -f arquivo.sql`
- `supabase functions deploy nome-funcao`
- `supabase secrets set NOME=valor`
- SQL queries (SELECT, INSERT, UPDATE, CREATE)

⚠️ Cuidado:
- `supabase db reset` (apaga tudo!)
- `DROP TABLE` (perda de dados)
- `ALTER TABLE ... DROP COLUMN` (perda de dados)

❌ Nunca executar:
- Comandos que deletam produção
- Scripts sem verificação prévia

---

## 📞 SUPORTE

Se a IA encontrar problemas:
1. Verificar logs: `supabase logs`
2. Verificar status: `supabase status`
3. Ver migrations: `supabase migration list`
4. Consultar documentação: https://supabase.com/docs

---

**Última atualização:** 2025-01-12
**Versão do plano:** 1.0
**Framework alvo:** v3.0 (15 etapas)
