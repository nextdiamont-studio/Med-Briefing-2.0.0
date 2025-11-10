// Analysis Types for Med Briefing 2.0
// Adapted from RecursosMed1.0 with Supabase integration

export type AnalysisType = 'performance' | 'spin';

export type ConsultationOutcome = 'Venda Realizada' | 'Venda Perdida';

export type BehavioralProfileType =
  | 'Dominante'
  | 'Influente'
  | 'Estável'
  | 'Analítico'
  | 'Não Identificado';

export type PerformanceRating =
  | 'Crítico'
  | 'Precisa Melhorar'
  | 'Moderado'
  | 'Bom'
  | 'Excelente';

// ==================== CORE ANALYSIS ====================

export interface Analysis {
  id: string;
  user_id: string;
  analysis_type: AnalysisType;
  patient_name: string;
  file_name?: string;
  created_at: string;
  updated_at: string;
}

// ==================== PERFORMANCE ANALYSIS ====================

export interface PerformanceAnalysis extends Analysis {
  analysis_type: 'performance';
  performanceData: PerformanceAnalysisData;
}

export interface PerformanceAnalysisData {
  id: string;
  outcome: ConsultationOutcome;
  is_low_quality_sale: boolean;
  ticket_value?: number;

  // Overall performance
  overall_performance: {
    score: number; // 0-160
    rating: PerformanceRating;
    summary: string;
  };

  // Behavioral profile
  behavioral_profile_analysis: {
    profile: BehavioralProfileType;
    justification: string;
    doctor_adaptation_analysis: string;
    communication_recommendations: {
      phrases: string[];
      keywords: string[];
    };
    playbook_insights?: BehavioralPlaybook;
  };

  // Phase and step analysis
  phases: AnalysisPhase[];

  // Lost sale details (only for lost/low-quality sales)
  lost_sale_details?: LostSaleDetails;

  // Indication baseline
  indication_baseline?: IndicationBaseline;

  // Critical observations
  critical_observations: CriticalObservations;
}

export interface AnalysisPhase {
  id: string;
  phase_number: number;
  phase_title: string;
  steps: AnalysisStep[];
}

export interface AnalysisStep {
  id: string;
  step_number: number;
  step_title: string;
  score: number; // 0-10
  rating: string;
  what_did_well: string[];
  improvement_points: string[];
  coaching_narrative?: CoachingNarrative;
}

export interface CoachingNarrative {
  what_was_said: string;
  what_should_have_been_said: string;
  crucial_differences: string[];
}

export interface LostSaleDetails {
  id: string;

  // Error pattern
  error_pattern: {
    excellent: number;
    good: number;
    deficient: number;
    critical: number;
  };

  // Critical errors (2-3 most fatal)
  critical_errors: CriticalError[];

  // Analysis
  domino_effect: string;
  exact_moment: string;
  root_cause: string;

  // Correction strategy
  correction_strategy: {
    immediate_focus: {
      description: string;
      training_scripts: TrainingScript[];
    };
    next_call_focus: {
      description: string;
      training_scripts: TrainingScript[];
    };
    lifesaver_script: string;
  };

  // Behavioral report
  behavioral_report: {
    how_doctor_sold: string;
    how_should_sell_to_profile: string;
  };

  // Strengths and errors
  identified_strengths: IdentifiedStrength[];
  errors_for_correction: ErrorCorrection[];

  // Final coaching plan
  final_coaching_plan: FinalCoachingPlan;
}

export interface CriticalError {
  id: string;
  error_order: number;
  error_title: string;
  what_happened: string;
  why_critical: string;
  coaching_narrative: string;
}

export interface TrainingScript {
  id: string;
  focus_type: 'immediate' | 'next_call';
  script_title: string;
  script_content: string;
  practice_recommendation: string;
}

export interface IdentifiedStrength {
  id: string;
  strength_title: string;
  evidence: string;
  how_to_leverage: string;
}

export interface ErrorCorrection {
  id: string;
  error_title: string;
  what_did: string;
  impact: string;
  correction: string;
}

export interface FinalCoachingPlan {
  id: string;
  pre_call_checklist: string[];
  during_call_checklist: string[];
  post_call_checklist: string[];
}

export interface IndicationBaseline {
  emotional_connection_extract: string;
  value_building_extract: string;
  social_proof_extract: string;
}

export interface CriticalObservations {
  id: string;
  essential_control_points: ControlPoint[];
  fatal_errors: FatalError[];
}

export interface ControlPoint {
  id: string;
  point_description: string;
  was_observed: boolean;
}

export interface FatalError {
  id: string;
  error_description: string;
  was_observed: boolean;
}

// ==================== SPIN QUALIFICATION ====================

export interface SpinQualification extends Analysis {
  analysis_type: 'spin';
  spinData: SpinQualificationData;
}

export interface SpinQualificationData {
  id: string;
  patient_age?: number;
  patient_concern: string;

  // Executive summary
  executive_summary: {
    profile: BehavioralProfileType;
    primary_concern: string;
    primary_pain: string;
    primary_desire: string;
    recommended_protocol: string;
    estimated_investment: string;
    expected_conversion_rate: string;
    total_consultation_time: string;
  };

  // Behavioral triggers
  behavioral_triggers: {
    keywords: string[];
    deep_motivations: string[];
    probable_fears: string[];
  };

  // Consultation goals
  consultation_goals: string[];

  // Consultation phases
  phases: ConsultationPhase[];
}

export interface ConsultationPhase {
  id: string;
  phase_number: number;
  phase_title: string;
  steps: ConsultationStep[];
}

export interface ConsultationStep {
  id: string;
  step_number: number;
  step_title: string;
  details: {
    duration: string;
    objective: string;
    tone_of_voice: string;
    visual_contact: string;
    posture: string;
    script: string; // Word-by-word script
    mandatory_questions?: string[];
    fatal_errors: string[];
    validation_checklist: string[];
    transition_script?: string;
  };
}

// ==================== BEHAVIORAL PLAYBOOK ====================

export interface BehavioralPlaybook {
  id: string;
  profile: BehavioralProfileType;
  characteristics: string[];
  fears: string[];
  motivations: string[];
  selling_strategies: string[];
  keywords_to_use: string[];
  keywords_to_avoid: string[];
}

// ==================== RECORDINGS ====================

export interface Recording {
  id: string;
  user_id: string;
  patient_name: string;
  audio_url?: string;
  transcription?: string;
  duration_seconds?: number;
  analysis_id?: string;
  created_at: string;
  updated_at: string;
}

// ==================== KNOWLEDGE BASE ====================

export interface KnowledgeBase {
  id: string;
  key: string;
  title: string;
  content: string;
  category?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ==================== UTILITY TYPES ====================

export type AnalysisResult = PerformanceAnalysis | SpinQualification;

export interface AnalysisUploadData {
  analysis_type: AnalysisType;
  patient_name: string;
  file_name?: string;
  outcome?: ConsultationOutcome;
  ticket_value?: number;
  transcript?: string;
  patient_age?: number;
  patient_concern?: string;
}

export interface DashboardMetrics {
  total_analyses: number;
  performance_analyses: number;
  spin_qualifications: number;
  conversion_rate: number;
  total_revenue: number;
  average_ticket: number;
  most_frequent_profile: BehavioralProfileType;
  analyses_this_month: number;
  analyses_this_week: number;
}

// ==================== AI ANALYSIS RESPONSE ====================

export interface AIAnalysisResponse {
  success: boolean;
  data?: PerformanceAnalysisData | SpinQualificationData;
  error?: string;
}

// ==================== FORM DATA ====================

export interface PerformanceAnalysisFormData {
  patient_name: string;
  outcome: ConsultationOutcome;
  ticket_value?: number;
  transcript: string;
  file_name?: string;
}

export interface SpinQualificationFormData {
  patient_name: string;
  patient_age?: number;
  patient_concern: string;
  patient_pain_points?: string;
  patient_desires?: string;
  behavioral_triggers?: string;
}
