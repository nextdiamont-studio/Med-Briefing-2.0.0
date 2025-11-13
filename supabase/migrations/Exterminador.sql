-- ============================================================================
-- EXTERMINADOR.SQL
-- Schema para deletar APENAS as tabelas de ANÁLISE
-- ============================================================================
-- ATENÇÃO: Este script irá DELETAR PERMANENTEMENTE todas as tabelas de análise
-- A tabela RECORDINGS será PRESERVADA (gravações e transcrições)
-- Execute apenas se tiver certeza do que está fazendo!
-- ============================================================================

BEGIN;

-- ============================================================================
-- PARTE 0: REMOVER FOREIGN KEY da tabela recordings para analyses
-- ============================================================================

-- Primeiro, remover a constraint de foreign key analysis_id da tabela recordings
ALTER TABLE IF EXISTS recordings DROP CONSTRAINT IF EXISTS recordings_analysis_id_fkey;

-- Opcional: manter a coluna analysis_id mas sem constraint (ou removê-la)
-- Se quiser remover a coluna completamente:
-- ALTER TABLE recordings DROP COLUMN IF EXISTS analysis_id;

-- ============================================================================
-- PARTE 1: DELETAR POLÍTICAS RLS (Row Level Security)
-- ============================================================================

-- Políticas para analyses
DROP POLICY IF EXISTS "Users can view own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can insert own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can update own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can delete own analyses" ON analyses;

-- Políticas para performance_analyses
DROP POLICY IF EXISTS "Users can view own performance analyses" ON performance_analyses;
DROP POLICY IF EXISTS "Users can insert own performance analyses" ON performance_analyses;

-- Políticas para spin_qualifications
DROP POLICY IF EXISTS "Users can view own spin qualifications" ON spin_qualifications;
DROP POLICY IF EXISTS "Users can insert own spin qualifications" ON spin_qualifications;

-- Políticas para behavioral_playbook
DROP POLICY IF EXISTS "Anyone can view behavioral playbook" ON behavioral_playbook;

-- Políticas para knowledge_base
DROP POLICY IF EXISTS "Anyone can view knowledge base" ON knowledge_base;

-- Políticas para briefing_spin_analyses
DROP POLICY IF EXISTS "Users can view their own briefing spin analyses" ON briefing_spin_analyses;
DROP POLICY IF EXISTS "Users can create their own briefing spin analyses" ON briefing_spin_analyses;
DROP POLICY IF EXISTS "Users can delete their own briefing spin analyses" ON briefing_spin_analyses;

-- Políticas para analysis_frameworks
DROP POLICY IF EXISTS "Public read active frameworks" ON analysis_frameworks;

-- Políticas para prompt_templates
DROP POLICY IF EXISTS "Public read active templates" ON prompt_templates;

-- Políticas para behavioral_profiles_config
DROP POLICY IF EXISTS "Public read behavioral profiles" ON behavioral_profiles_config;

-- Políticas para analysis_audit_log
DROP POLICY IF EXISTS "Users can view own audit logs" ON analysis_audit_log;

-- ============================================================================
-- PARTE 2: DELETAR TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS update_briefing_spin_analyses_updated_at ON briefing_spin_analyses;
DROP TRIGGER IF EXISTS update_analysis_frameworks_updated_at ON analysis_frameworks;
DROP TRIGGER IF EXISTS update_prompt_templates_updated_at ON prompt_templates;

-- ============================================================================
-- PARTE 3: DELETAR FUNÇÕES
-- ============================================================================

DROP FUNCTION IF EXISTS update_briefing_spin_updated_at();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS get_active_framework();
DROP FUNCTION IF EXISTS get_active_template(TEXT);

-- ============================================================================
-- PARTE 4: DELETAR ÍNDICES (EXCETO recordings)
-- ============================================================================

-- Índices de analyses
DROP INDEX IF EXISTS idx_analyses_user_id;
DROP INDEX IF EXISTS idx_analyses_created_at;
DROP INDEX IF EXISTS idx_analyses_type;
DROP INDEX IF EXISTS idx_performance_analyses_outcome;

-- NÃO DELETAR índices de recordings (preservar)
-- DROP INDEX IF EXISTS idx_recordings_user_id;
-- DROP INDEX IF EXISTS idx_recordings_created_at;

-- Índices de briefing_spin_analyses
DROP INDEX IF EXISTS idx_briefing_spin_user_id;
DROP INDEX IF EXISTS idx_briefing_spin_created_at;
DROP INDEX IF EXISTS idx_briefing_spin_patient_name;

-- Índices de frameworks
DROP INDEX IF EXISTS idx_analysis_frameworks_active;
DROP INDEX IF EXISTS idx_prompt_templates_active;
DROP INDEX IF EXISTS idx_analysis_audit_log_analysis_id;
DROP INDEX IF EXISTS idx_analysis_audit_log_created_at;

-- ============================================================================
-- PARTE 5: DELETAR TABELAS (ordem reversa de dependências)
-- ============================================================================

-- Tabelas dependentes de lost_sale_details
DROP TABLE IF EXISTS final_coaching_plans CASCADE;
DROP TABLE IF EXISTS errors_for_correction CASCADE;
DROP TABLE IF EXISTS identified_strengths CASCADE;
DROP TABLE IF EXISTS training_scripts CASCADE;
DROP TABLE IF EXISTS critical_errors CASCADE;

-- Tabelas dependentes de critical_observations
DROP TABLE IF EXISTS fatal_errors_checklist CASCADE;
DROP TABLE IF EXISTS essential_control_points CASCADE;

-- Tabela lost_sale_details e critical_observations
DROP TABLE IF EXISTS lost_sale_details CASCADE;
DROP TABLE IF EXISTS critical_observations CASCADE;

-- Tabelas dependentes de consultation_phases
DROP TABLE IF EXISTS consultation_steps CASCADE;

-- Tabela consultation_phases
DROP TABLE IF EXISTS consultation_phases CASCADE;

-- Tabelas dependentes de analysis_phases
DROP TABLE IF EXISTS analysis_steps CASCADE;

-- Tabela analysis_phases
DROP TABLE IF EXISTS analysis_phases CASCADE;

-- Tabelas dependentes de analyses
DROP TABLE IF EXISTS spin_qualifications CASCADE;
DROP TABLE IF EXISTS performance_analyses CASCADE;

-- Tabela principal analyses
DROP TABLE IF EXISTS analyses CASCADE;

-- NÃO DELETAR: Tabela recordings (PRESERVAR GRAVAÇÕES E TRANSCRIÇÕES)
-- DROP TABLE IF EXISTS recordings CASCADE;

-- Tabelas de referência
DROP TABLE IF EXISTS behavioral_playbook CASCADE;
DROP TABLE IF EXISTS knowledge_base CASCADE;

-- Tabela briefing_spin_analyses
DROP TABLE IF EXISTS briefing_spin_analyses CASCADE;

-- Tabelas do framework de prompts
DROP TABLE IF EXISTS analysis_audit_log CASCADE;
DROP TABLE IF EXISTS behavioral_profiles_config CASCADE;
DROP TABLE IF EXISTS prompt_templates CASCADE;
DROP TABLE IF EXISTS analysis_frameworks CASCADE;

-- ============================================================================
-- PARTE 6: DELETAR TIPOS ENUMERADOS (ENUMS)
-- ============================================================================

DROP TYPE IF EXISTS analysis_type CASCADE;
DROP TYPE IF EXISTS consultation_outcome CASCADE;
DROP TYPE IF EXISTS behavioral_profile CASCADE;
DROP TYPE IF EXISTS performance_rating CASCADE;

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================

COMMIT;

-- Mensagem de confirmação
DO $$
BEGIN
    RAISE NOTICE '✅ EXTERMINADOR.SQL EXECUTADO COM SUCESSO!';
    RAISE NOTICE '🔥 Todas as tabelas de análise foram DELETADAS permanentemente.';
    RAISE NOTICE '✅ Tabela RECORDINGS foi PRESERVADA (gravações e transcrições mantidas).';
    RAISE NOTICE '📊 Sistema limpo e pronto para novo começo.';
END $$;
