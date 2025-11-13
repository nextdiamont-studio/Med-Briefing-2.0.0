-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES - CONFIGURAÇÃO COMPLETA
-- ============================================================================

-- ============================================================================
-- PARTE 1: HABILITAR RLS EM TODAS AS TABELAS
-- ============================================================================

-- Tabelas principais
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

-- Tabelas de detalhes - Vendas Perdidas
ALTER TABLE lost_sale_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE critical_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE correction_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavioral_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE identified_strengths ENABLE ROW LEVEL SECURITY;
ALTER TABLE errors_for_correction ENABLE ROW LEVEL SECURITY;
ALTER TABLE final_coaching_plans ENABLE ROW LEVEL SECURITY;

-- Tabelas de detalhes - Vendas Realizadas
ALTER TABLE realized_sale_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_factors ENABLE ROW LEVEL SECURITY;

-- Tabelas SPIN
ALTER TABLE spin_situation_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_problem_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_implication_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_need_payoff_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_objection_handlers ENABLE ROW LEVEL SECURITY;

-- Tabelas de controle crítico
ALTER TABLE critical_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE essential_control_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE fatal_errors ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PARTE 2: POLÍTICAS PARA TABELA 'ANALYSES' (Tabela Principal)
-- ============================================================================

-- DROP políticas existentes para recriar
DROP POLICY IF EXISTS "Users can view own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can insert own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can update own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can delete own analyses" ON analyses;

-- SELECT: Usuários só veem suas próprias análises
CREATE POLICY "Users can view own analyses"
    ON analyses FOR SELECT
    USING (auth.uid() = user_id);

-- INSERT: Usuários só podem inserir análises para si mesmos
CREATE POLICY "Users can insert own analyses"
    ON analyses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- UPDATE: Usuários só podem atualizar suas próprias análises
CREATE POLICY "Users can update own analyses"
    ON analyses FOR UPDATE
    USING (auth.uid() = user_id);

-- DELETE: Usuários só podem deletar suas próprias análises
CREATE POLICY "Users can delete own analyses"
    ON analyses FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- PARTE 3: POLÍTICAS PARA 'PERFORMANCE_ANALYSES' (Análises de Performance)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own performance analyses" ON performance_analyses;
DROP POLICY IF EXISTS "Users can insert own performance analyses" ON performance_analyses;
DROP POLICY IF EXISTS "Users can update own performance analyses" ON performance_analyses;
DROP POLICY IF EXISTS "Users can delete own performance analyses" ON performance_analyses;

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

CREATE POLICY "Users can update own performance analyses"
    ON performance_analyses FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM analyses
        WHERE analyses.id = performance_analyses.id
        AND analyses.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete own performance analyses"
    ON performance_analyses FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM analyses
        WHERE analyses.id = performance_analyses.id
        AND analyses.user_id = auth.uid()
    ));

-- ============================================================================
-- PARTE 4: POLÍTICAS PARA 'SPIN_QUALIFICATIONS'
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own spin qualifications" ON spin_qualifications;
DROP POLICY IF EXISTS "Users can insert own spin qualifications" ON spin_qualifications;
DROP POLICY IF EXISTS "Users can update own spin qualifications" ON spin_qualifications;
DROP POLICY IF EXISTS "Users can delete own spin qualifications" ON spin_qualifications;

CREATE POLICY "Users can view own spin qualifications"
    ON spin_qualifications FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM analyses
        WHERE analyses.id = spin_qualifications.id
        AND analyses.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert own spin qualifications"
    ON spin_qualifications FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM analyses
        WHERE analyses.id = spin_qualifications.id
        AND analyses.user_id = auth.uid()
    ));

CREATE POLICY "Users can update own spin qualifications"
    ON spin_qualifications FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM analyses
        WHERE analyses.id = spin_qualifications.id
        AND analyses.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete own spin qualifications"
    ON spin_qualifications FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM analyses
        WHERE analyses.id = spin_qualifications.id
        AND analyses.user_id = auth.uid()
    ));

-- ============================================================================
-- PARTE 5: POLÍTICAS PARA 'RECORDINGS'
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own recordings" ON recordings;
DROP POLICY IF EXISTS "Users can insert own recordings" ON recordings;
DROP POLICY IF EXISTS "Users can update own recordings" ON recordings;
DROP POLICY IF EXISTS "Users can delete own recordings" ON recordings;

CREATE POLICY "Users can view own recordings"
    ON recordings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recordings"
    ON recordings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recordings"
    ON recordings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recordings"
    ON recordings FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- PARTE 6: POLÍTICAS PARA TABELAS DE CONFIGURAÇÃO (Leitura Pública)
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can view frameworks" ON analysis_frameworks;
DROP POLICY IF EXISTS "Authenticated users can view behavioral profiles" ON behavioral_profiles_config;

-- Frameworks: Todos usuários autenticados podem ler
CREATE POLICY "Authenticated users can view frameworks"
    ON analysis_frameworks FOR SELECT
    TO authenticated
    USING (true);

-- Perfis DISC: Todos usuários autenticados podem ler
CREATE POLICY "Authenticated users can view behavioral profiles"
    ON behavioral_profiles_config FOR SELECT
    TO authenticated
    USING (true);

-- ============================================================================
-- PARTE 7: POLÍTICAS PARA TABELAS DE AUDITORIA (Apenas Admins)
-- ============================================================================

DROP POLICY IF EXISTS "Only admins can view audit logs" ON prompt_audit_log;
DROP POLICY IF EXISTS "System can insert audit logs" ON prompt_audit_log;

-- Apenas admins podem ver logs de auditoria
CREATE POLICY "Only admins can view audit logs"
    ON prompt_audit_log FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Sistema pode inserir logs (service_role)
CREATE POLICY "System can insert audit logs"
    ON prompt_audit_log FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- PARTE 8: POLÍTICAS CASCADE PARA TABELAS RELACIONADAS
-- ============================================================================

-- Para todas as tabelas que dependem de performance_analyses
DO $$
DECLARE
    table_name text;
    tables text[] := ARRAY[
        'analysis_phases',
        'analysis_steps',
        'lost_sale_details',
        'critical_errors',
        'correction_strategies',
        'training_scripts',
        'behavioral_reports',
        'identified_strengths',
        'errors_for_correction',
        'final_coaching_plans',
        'realized_sale_details',
        'success_factors',
        'critical_observations',
        'essential_control_points',
        'fatal_errors'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables
    LOOP
        -- DROP políticas existentes
        EXECUTE format('DROP POLICY IF EXISTS "Users can view own %s" ON %I', table_name, table_name);
        EXECUTE format('DROP POLICY IF EXISTS "Users can insert own %s" ON %I', table_name, table_name);
        EXECUTE format('DROP POLICY IF EXISTS "Users can update own %s" ON %I', table_name, table_name);
        EXECUTE format('DROP POLICY IF EXISTS "Users can delete own %s" ON %I', table_name, table_name);

        -- CREATE novas políticas
        EXECUTE format('
            CREATE POLICY "Users can view own %s"
            ON %I FOR SELECT
            USING (EXISTS (
                SELECT 1 FROM analyses a
                JOIN performance_analyses pa ON pa.id = a.id
                WHERE a.user_id = auth.uid()
            ))
        ', table_name, table_name);

        EXECUTE format('
            CREATE POLICY "Users can insert own %s"
            ON %I FOR INSERT
            WITH CHECK (EXISTS (
                SELECT 1 FROM analyses a
                JOIN performance_analyses pa ON pa.id = a.id
                WHERE a.user_id = auth.uid()
            ))
        ', table_name, table_name);

        EXECUTE format('
            CREATE POLICY "Users can update own %s"
            ON %I FOR UPDATE
            USING (EXISTS (
                SELECT 1 FROM analyses a
                JOIN performance_analyses pa ON pa.id = a.id
                WHERE a.user_id = auth.uid()
            ))
        ', table_name, table_name);

        EXECUTE format('
            CREATE POLICY "Users can delete own %s"
            ON %I FOR DELETE
            USING (EXISTS (
                SELECT 1 FROM analyses a
                JOIN performance_analyses pa ON pa.id = a.id
                WHERE a.user_id = auth.uid()
            ))
        ', table_name, table_name);
    END LOOP;
END $$;

-- ============================================================================
-- PARTE 9: POLÍTICAS PARA TABELAS SPIN
-- ============================================================================

DO $$
DECLARE
    table_name text;
    spin_tables text[] := ARRAY[
        'spin_situation_analysis',
        'spin_problem_analysis',
        'spin_implication_analysis',
        'spin_need_payoff_analysis',
        'spin_scripts',
        'spin_objection_handlers'
    ];
BEGIN
    FOREACH table_name IN ARRAY spin_tables
    LOOP
        -- DROP políticas existentes
        EXECUTE format('DROP POLICY IF EXISTS "Users can view own %s" ON %I', table_name, table_name);
        EXECUTE format('DROP POLICY IF EXISTS "Users can insert own %s" ON %I', table_name, table_name);

        -- CREATE novas políticas
        EXECUTE format('
            CREATE POLICY "Users can view own %s"
            ON %I FOR SELECT
            USING (EXISTS (
                SELECT 1 FROM analyses a
                JOIN spin_qualifications sq ON sq.id = a.id
                WHERE a.user_id = auth.uid()
            ))
        ', table_name, table_name);

        EXECUTE format('
            CREATE POLICY "Users can insert own %s"
            ON %I FOR INSERT
            WITH CHECK (EXISTS (
                SELECT 1 FROM analyses a
                JOIN spin_qualifications sq ON sq.id = a.id
                WHERE a.user_id = auth.uid()
            ))
        ', table_name, table_name);
    END LOOP;
END $$;

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

-- Verificar RLS habilitado
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true
ORDER BY tablename;

-- Verificar políticas criadas
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Contar políticas por tabela
SELECT tablename, COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
