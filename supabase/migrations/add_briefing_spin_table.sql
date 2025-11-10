-- Criação da tabela para armazenar análises Briefing SPIN
CREATE TABLE IF NOT EXISTS briefing_spin_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    patient_age TEXT,
    main_complaint TEXT,
    conversation_text TEXT NOT NULL,
    analysis_result JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para melhor performance
CREATE INDEX idx_briefing_spin_user_id ON briefing_spin_analyses(user_id);
CREATE INDEX idx_briefing_spin_created_at ON briefing_spin_analyses(created_at DESC);
CREATE INDEX idx_briefing_spin_patient_name ON briefing_spin_analyses(patient_name);

-- RLS (Row Level Security)
ALTER TABLE briefing_spin_analyses ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas suas próprias análises
CREATE POLICY "Users can view their own briefing spin analyses"
    ON briefing_spin_analyses
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política: Usuários podem criar suas próprias análises
CREATE POLICY "Users can create their own briefing spin analyses"
    ON briefing_spin_analyses
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem deletar suas próprias análises
CREATE POLICY "Users can delete their own briefing spin analyses"
    ON briefing_spin_analyses
    FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_briefing_spin_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_briefing_spin_analyses_updated_at
    BEFORE UPDATE ON briefing_spin_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_briefing_spin_updated_at();

-- Comentários para documentação
COMMENT ON TABLE briefing_spin_analyses IS 'Armazena análises de Briefing SPIN (vendas consultivas) para consultas de estética médica';
COMMENT ON COLUMN briefing_spin_analyses.analysis_result IS 'JSON contendo perfil comportamental, diagnóstico SPIN, gatilhos emocionais, estratégias de fechamento e scripts';
