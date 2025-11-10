-- Create analysis tables for Med Briefing 2.0

-- Enum types
CREATE TYPE analysis_type AS ENUM ('performance', 'spin');
CREATE TYPE consultation_outcome AS ENUM ('Venda Realizada', 'Venda Perdida');
CREATE TYPE behavioral_profile AS ENUM ('Dominante', 'Influente', 'Estável', 'Analítico', 'Não Identificado');
CREATE TYPE performance_rating AS ENUM ('Crítico', 'Precisa Melhorar', 'Moderado', 'Bom', 'Excelente');

-- Main analysis table
CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    analysis_type analysis_type NOT NULL,
    patient_name TEXT NOT NULL,
    file_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Performance analysis (consultation analysis)
CREATE TABLE IF NOT EXISTS performance_analyses (
    id UUID PRIMARY KEY REFERENCES analyses(id) ON DELETE CASCADE,
    outcome consultation_outcome NOT NULL,
    is_low_quality_sale BOOLEAN DEFAULT false,
    ticket_value DECIMAL(10,2),

    -- Overall performance
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 160),
    overall_rating performance_rating NOT NULL,
    overall_summary TEXT,

    -- Behavioral profile
    behavioral_profile behavioral_profile NOT NULL,
    profile_justification TEXT,
    doctor_adaptation_analysis TEXT,
    communication_phrases TEXT[], -- Array of recommended phrases
    communication_keywords TEXT[], -- Array of keywords

    -- Indication baseline
    emotional_connection_extract TEXT,
    value_building_extract TEXT,
    social_proof_extract TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- SPIN qualification (pre-call briefing)
CREATE TABLE IF NOT EXISTS spin_qualifications (
    id UUID PRIMARY KEY REFERENCES analyses(id) ON DELETE CASCADE,
    patient_age INTEGER,
    patient_concern TEXT NOT NULL,

    -- Executive summary
    primary_concern TEXT,
    primary_pain TEXT,
    primary_desire TEXT,
    recommended_protocol TEXT,
    estimated_investment TEXT,
    expected_conversion_rate TEXT,
    total_consultation_time TEXT,

    -- Behavioral triggers
    trigger_keywords TEXT[],
    deep_motivations TEXT[],
    probable_fears TEXT[],

    -- Consultation goals
    consultation_goals TEXT[],

    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Phase analysis (for performance analysis)
CREATE TABLE IF NOT EXISTS analysis_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    performance_analysis_id UUID NOT NULL REFERENCES performance_analyses(id) ON DELETE CASCADE,
    phase_number INTEGER NOT NULL,
    phase_title TEXT NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(performance_analysis_id, phase_number)
);

-- Analysis steps (16-step methodology)
CREATE TABLE IF NOT EXISTS analysis_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase_id UUID NOT NULL REFERENCES analysis_phases(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    step_title TEXT NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
    rating TEXT NOT NULL,
    what_did_well TEXT[],
    improvement_points TEXT[],

    -- Coaching narrative (optional)
    what_was_said TEXT,
    what_should_have_been_said TEXT,
    crucial_differences TEXT[],

    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(phase_id, step_number)
);

-- Consultation phases (for SPIN qualification)
CREATE TABLE IF NOT EXISTS consultation_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spin_qualification_id UUID NOT NULL REFERENCES spin_qualifications(id) ON DELETE CASCADE,
    phase_number INTEGER NOT NULL,
    phase_title TEXT NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(spin_qualification_id, phase_number)
);

-- Consultation steps (detailed plan for SPIN)
CREATE TABLE IF NOT EXISTS consultation_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_phase_id UUID NOT NULL REFERENCES consultation_phases(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    step_title TEXT NOT NULL,

    -- Step details
    duration TEXT,
    objective TEXT,
    tone_of_voice TEXT,
    visual_contact TEXT,
    posture TEXT,
    script TEXT, -- Word-by-word script
    mandatory_questions TEXT[],
    fatal_errors TEXT[],
    validation_checklist TEXT[],
    transition_script TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(consultation_phase_id, step_number)
);

-- Lost sale details (deep analysis for lost/low-quality sales)
CREATE TABLE IF NOT EXISTS lost_sale_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    performance_analysis_id UUID NOT NULL UNIQUE REFERENCES performance_analyses(id) ON DELETE CASCADE,

    -- Error pattern
    excellent_steps INTEGER DEFAULT 0,
    good_steps INTEGER DEFAULT 0,
    deficient_steps INTEGER DEFAULT 0,
    critical_steps INTEGER DEFAULT 0,

    -- Analysis
    domino_effect TEXT,
    exact_moment TEXT,
    root_cause TEXT,

    -- Correction strategy
    immediate_focus_description TEXT,
    next_call_focus_description TEXT,
    lifesaver_script TEXT,

    -- Behavioral report
    how_doctor_sold TEXT,
    how_should_sell_to_profile TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Critical errors (2-3 most fatal errors)
CREATE TABLE IF NOT EXISTS critical_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lost_sale_detail_id UUID NOT NULL REFERENCES lost_sale_details(id) ON DELETE CASCADE,
    error_order INTEGER NOT NULL,
    error_title TEXT NOT NULL,
    what_happened TEXT,
    why_critical TEXT,
    coaching_narrative TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(lost_sale_detail_id, error_order)
);

-- Training scripts
CREATE TABLE IF NOT EXISTS training_scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lost_sale_detail_id UUID NOT NULL REFERENCES lost_sale_details(id) ON DELETE CASCADE,
    focus_type TEXT NOT NULL CHECK (focus_type IN ('immediate', 'next_call')),
    script_title TEXT NOT NULL,
    script_content TEXT NOT NULL,
    practice_recommendation TEXT DEFAULT '10x',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Identified strengths
CREATE TABLE IF NOT EXISTS identified_strengths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lost_sale_detail_id UUID NOT NULL REFERENCES lost_sale_details(id) ON DELETE CASCADE,
    strength_title TEXT NOT NULL,
    evidence TEXT NOT NULL,
    how_to_leverage TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Errors for correction
CREATE TABLE IF NOT EXISTS errors_for_correction (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lost_sale_detail_id UUID NOT NULL REFERENCES lost_sale_details(id) ON DELETE CASCADE,
    error_title TEXT NOT NULL,
    what_did TEXT,
    impact TEXT,
    correction TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Final coaching plan
CREATE TABLE IF NOT EXISTS final_coaching_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lost_sale_detail_id UUID NOT NULL UNIQUE REFERENCES lost_sale_details(id) ON DELETE CASCADE,

    pre_call_checklist TEXT[],
    during_call_checklist TEXT[],
    post_call_checklist TEXT[],

    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Critical observations
CREATE TABLE IF NOT EXISTS critical_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    performance_analysis_id UUID NOT NULL UNIQUE REFERENCES performance_analyses(id) ON DELETE CASCADE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Essential control points
CREATE TABLE IF NOT EXISTS essential_control_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    critical_observation_id UUID NOT NULL REFERENCES critical_observations(id) ON DELETE CASCADE,
    point_description TEXT NOT NULL,
    was_observed BOOLEAN NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Fatal errors checklist
CREATE TABLE IF NOT EXISTS fatal_errors_checklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    critical_observation_id UUID NOT NULL REFERENCES critical_observations(id) ON DELETE CASCADE,
    error_description TEXT NOT NULL,
    was_observed BOOLEAN NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Recordings table
CREATE TABLE IF NOT EXISTS recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    audio_url TEXT,
    transcription TEXT,
    duration_seconds INTEGER,
    analysis_id UUID REFERENCES analyses(id) ON DELETE SET NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Behavioral profile playbook (reference data)
CREATE TABLE IF NOT EXISTS behavioral_playbook (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile behavioral_profile NOT NULL UNIQUE,
    characteristics TEXT[],
    fears TEXT[],
    motivations TEXT[],
    selling_strategies TEXT[],
    keywords_to_use TEXT[],
    keywords_to_avoid TEXT[],

    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Knowledge base (dynamic content for AI prompts)
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_created_at ON analyses(created_at);
CREATE INDEX idx_analyses_type ON analyses(analysis_type);
CREATE INDEX idx_performance_analyses_outcome ON performance_analyses(outcome);
CREATE INDEX idx_recordings_user_id ON recordings(user_id);
CREATE INDEX idx_recordings_created_at ON recordings(created_at);

-- Enable Row Level Security
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_sale_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE critical_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE identified_strengths ENABLE ROW LEVEL SECURITY;
ALTER TABLE errors_for_correction ENABLE ROW LEVEL SECURITY;
ALTER TABLE final_coaching_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE critical_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE essential_control_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE fatal_errors_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analyses
CREATE POLICY "Users can view own analyses" ON analyses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses" ON analyses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses" ON analyses
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for performance_analyses
CREATE POLICY "Users can view own performance analyses" ON performance_analyses
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM analyses WHERE analyses.id = performance_analyses.id AND analyses.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert own performance analyses" ON performance_analyses
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM analyses WHERE analyses.id = performance_analyses.id AND analyses.user_id = auth.uid()
    ));

-- Similar policies for other tables (inheriting from analyses)
CREATE POLICY "Users can view own spin qualifications" ON spin_qualifications
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM analyses WHERE analyses.id = spin_qualifications.id AND analyses.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert own spin qualifications" ON spin_qualifications
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM analyses WHERE analyses.id = spin_qualifications.id AND analyses.user_id = auth.uid()
    ));

-- Policies for recordings
CREATE POLICY "Users can view own recordings" ON recordings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recordings" ON recordings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recordings" ON recordings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recordings" ON recordings
    FOR DELETE USING (auth.uid() = user_id);

-- Public read for reference tables
CREATE POLICY "Anyone can view behavioral playbook" ON behavioral_playbook
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view knowledge base" ON knowledge_base
    FOR SELECT USING (is_active = true);
