-- ============================================================================
-- SISTEMA DE FRAMEWORK DE PROMPTS VERSIONADO
-- Permite atualização de metodologia sem redeploy
-- ============================================================================

-- Tabela de frameworks (metodologias de análise)
CREATE TABLE IF NOT EXISTS analysis_frameworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    methodology_steps JSONB NOT NULL, -- Array de objetos com {number, name, description, maxScore}
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de templates de prompts
CREATE TABLE IF NOT EXISTS prompt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    framework_id UUID NOT NULL REFERENCES analysis_frameworks(id) ON DELETE CASCADE,
    template_type TEXT NOT NULL CHECK (template_type IN ('lost_sale', 'completed_sale', 'spin_briefing', 'performance')),
    version TEXT NOT NULL,
    template_content TEXT NOT NULL, -- Template com placeholders {{patientName}}, etc.
    system_instructions TEXT, -- Instruções específicas para o modelo
    temperature DECIMAL(3,2) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 8192,
    response_schema JSONB, -- Schema Zod em JSON para validação
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(template_type, version)
);

-- Tabela de perfis comportamentais (DISC)
CREATE TABLE IF NOT EXISTS behavioral_profiles_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_type TEXT NOT NULL UNIQUE CHECK (profile_type IN ('dominant', 'influential', 'steady', 'analytical')),
    display_name TEXT NOT NULL,
    characteristics JSONB NOT NULL, -- Array de características
    keywords JSONB NOT NULL, -- Array de palavras-chave
    selling_strategy TEXT NOT NULL,
    communication_tips JSONB, -- Dicas de comunicação
    fatal_errors JSONB, -- Erros fatais com esse perfil
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de histórico de análises (auditoria)
CREATE TABLE IF NOT EXISTS analysis_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
    framework_version TEXT NOT NULL,
    template_version TEXT NOT NULL,
    prompt_used TEXT NOT NULL, -- Prompt exato usado
    response_raw JSONB NOT NULL, -- Resposta bruta da IA
    validation_status TEXT CHECK (validation_status IN ('valid', 'invalid', 'warning')),
    validation_errors JSONB, -- Erros de validação se houver
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_analysis_frameworks_active ON analysis_frameworks(is_active);
CREATE INDEX idx_prompt_templates_active ON prompt_templates(template_type, is_active);
CREATE INDEX idx_analysis_audit_log_analysis_id ON analysis_audit_log(analysis_id);
CREATE INDEX idx_analysis_audit_log_created_at ON analysis_audit_log(created_at DESC);

-- Enable RLS
ALTER TABLE analysis_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavioral_profiles_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas públicas de leitura (todos podem ver os frameworks ativos)
CREATE POLICY "Public read active frameworks" ON analysis_frameworks
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public read active templates" ON prompt_templates
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public read behavioral profiles" ON behavioral_profiles_config
    FOR SELECT USING (true);

-- Auditoria: usuários veem apenas seus logs
CREATE POLICY "Users can view own audit logs" ON analysis_audit_log
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM analyses WHERE analyses.id = analysis_audit_log.analysis_id AND analyses.user_id = auth.uid()
    ));

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_analysis_frameworks_updated_at
    BEFORE UPDATE ON analysis_frameworks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompt_templates_updated_at
    BEFORE UPDATE ON prompt_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED: FRAMEWORK OFICIAL V2.0 (16 ETAPAS)
-- ============================================================================

INSERT INTO analysis_frameworks (version, name, description, methodology_steps, is_active)
VALUES (
    '2.0',
    'Vendas Consultivas em Medicina Estética',
    'Metodologia oficial de 16 etapas para análise de consultas de medicina estética',
    '[
        {"number": 1, "name": "Conexão Genuína (Rapport Emocional)", "description": "Estabelecer confiança e conexão emocional autêntica", "maxScore": 10},
        {"number": 2, "name": "Quebra de Resistência Inicial", "description": "Reduzir barreiras e criar ambiente de abertura", "maxScore": 10},
        {"number": 3, "name": "Investigação de Dores Emocionais (SPIN Selling)", "description": "Descobrir dores emocionais profundas", "maxScore": 10},
        {"number": 4, "name": "Amplificação da Dor (Criação de Urgência)", "description": "Tornar a dor consciente e criar urgência genuína", "maxScore": 10},
        {"number": 5, "name": "Apresentação do Futuro Ideal", "description": "Pintar visão clara do resultado desejado", "maxScore": 10},
        {"number": 6, "name": "Diagnóstico Visual Profissional", "description": "Avaliação técnica e visual da condição", "maxScore": 10},
        {"number": 7, "name": "Educação sobre Causas (Authority Building)", "description": "Explicar causas estabelecendo autoridade", "maxScore": 10},
        {"number": 8, "name": "Introdução de Soluções (Protocolo)", "description": "Apresentar soluções técnicas adequadas", "maxScore": 10},
        {"number": 9, "name": "Explicação Técnica Detalhada", "description": "Detalhar procedimentos e tecnologias", "maxScore": 10},
        {"number": 10, "name": "Demonstração de Resultados (Provas)", "description": "Mostrar casos de sucesso e resultados reais", "maxScore": 10},
        {"number": 11, "name": "Ancoragem de Valor", "description": "Estabelecer percepção de valor antes do preço", "maxScore": 10},
        {"number": 12, "name": "Apresentação de Investimento", "description": "Apresentar preço de forma estratégica", "maxScore": 10},
        {"number": 13, "name": "Quebra de Objeções Antecipadas", "description": "Antecipar e neutralizar objeções", "maxScore": 10},
        {"number": 14, "name": "Criação de Escassez", "description": "Criar escassez genuína (não artificial)", "maxScore": 10},
        {"number": 15, "name": "Facilitação de Decisão", "description": "Facilitar processo de tomada de decisão", "maxScore": 10},
        {"number": 16, "name": "Fechamento Assumido", "description": "Fechar assumindo decisão tomada", "maxScore": 10}
    ]'::jsonb,
    true
) ON CONFLICT (version) DO UPDATE SET
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- ============================================================================
-- SEED: PERFIS COMPORTAMENTAIS (DISC)
-- ============================================================================

INSERT INTO behavioral_profiles_config (profile_type, display_name, characteristics, keywords, selling_strategy, communication_tips, fatal_errors)
VALUES
    (
        'dominant',
        'Dominante',
        '["Direto e objetivo", "Foca em resultados", "Toma decisões rápidas", "Valoriza eficiência"]'::jsonb,
        '["resultado", "rápido", "objetivo", "eficiente", "prático", "direto"]'::jsonb,
        'Seja direto, mostre resultados rápidos, evite enrolação e detalhes excessivos. Foque no "o que você vai ganhar".',
        '["Use frases curtas", "Mostre antes e depois rapidamente", "Evite história pessoal longa", "Vá direto ao ponto"]'::jsonb,
        '["Ser muito emotivo", "Enrolar antes de mostrar resultado", "Não apresentar timeline claro"]'::jsonb
    ),
    (
        'influential',
        'Influente',
        '["Sociável e expressivo", "Valoriza relacionamentos", "Busca aprovação social", "Entusiasmado"]'::jsonb,
        '["pessoas", "social", "opinião", "tendência", "experiência", "amigos"]'::jsonb,
        'Use prova social massiva, mostre transformações visuais impressionantes, crie entusiasmo e conexão emocional.',
        '["Mostre casos de sucesso de outras pessoas", "Seja caloroso e expressivo", "Use linguagem visual", "Destaque aspecto social"]'::jsonb,
        '["Ser frio ou técnico demais", "Não usar prova social", "Focar apenas em dados"]'::jsonb
    ),
    (
        'steady',
        'Estável',
        '["Paciente e leal", "Busca segurança", "Avesso a riscos", "Precisa de garantias"]'::jsonb,
        '["segurança", "garantia", "confiável", "tempo", "cuidado", "risco"]'::jsonb,
        'Transmita segurança, forneça garantias, não pressione. Construa confiança gradualmente.',
        '["Ofereça garantias explícitas", "Seja paciente", "Evite pressa", "Mostre estabilidade da clínica"]'::jsonb,
        '["Pressionar para decisão rápida", "Usar escassez artificial", "Ser agressivo"]'::jsonb
    ),
    (
        'analytical',
        'Analítico',
        '["Meticuloso e detalhista", "Busca informações técnicas", "Decisões baseadas em dados", "Questiona e investiga"]'::jsonb,
        '["técnica", "estudo", "comprovado", "detalhes", "dados", "pesquisa", "científico"]'::jsonb,
        'Forneça dados técnicos, estudos científicos, detalhes procedimentais. Seja preciso e factual.',
        '["Mostre estudos científicos", "Explique tecnicamente", "Seja preciso em números", "Responda todas as perguntas"]'::jsonb,
        '["Ser vago ou impreciso", "Não ter dados", "Usar apenas apelo emocional"]'::jsonb
    )
ON CONFLICT (profile_type) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    characteristics = EXCLUDED.characteristics,
    keywords = EXCLUDED.keywords,
    selling_strategy = EXCLUDED.selling_strategy,
    communication_tips = EXCLUDED.communication_tips,
    fatal_errors = EXCLUDED.fatal_errors,
    updated_at = now();

-- ============================================================================
-- FUNÇÕES HELPER
-- ============================================================================

-- Função para obter framework ativo
CREATE OR REPLACE FUNCTION get_active_framework()
RETURNS analysis_frameworks AS $$
DECLARE
    active_framework analysis_frameworks;
BEGIN
    SELECT * INTO active_framework
    FROM analysis_frameworks
    WHERE is_active = true
    ORDER BY created_at DESC
    LIMIT 1;

    RETURN active_framework;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter template ativo por tipo
CREATE OR REPLACE FUNCTION get_active_template(template_type_param TEXT)
RETURNS prompt_templates AS $$
DECLARE
    active_template prompt_templates;
BEGIN
    SELECT * INTO active_template
    FROM prompt_templates
    WHERE template_type = template_type_param
    AND is_active = true
    ORDER BY created_at DESC
    LIMIT 1;

    RETURN active_template;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários
COMMENT ON TABLE analysis_frameworks IS 'Frameworks de metodologia de análise (versionados)';
COMMENT ON TABLE prompt_templates IS 'Templates de prompts para IA (versionados)';
COMMENT ON TABLE behavioral_profiles_config IS 'Configuração de perfis comportamentais DISC';
COMMENT ON TABLE analysis_audit_log IS 'Log de auditoria de análises geradas';
