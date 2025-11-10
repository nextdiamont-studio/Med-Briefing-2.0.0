// Tipos do banco de dados
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
      }
      patients: {
        Row: Patient
        Insert: Omit<Patient, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Patient, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
      }
      consultations: {
        Row: Consultation
        Insert: Omit<Consultation, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Consultation, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
      }
      briefings: {
        Row: Briefing
        Insert: Omit<Briefing, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Briefing, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
      }
      user_settings: {
        Row: UserSettings
        Insert: Omit<UserSettings, 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserSettings, 'user_id' | 'created_at' | 'updated_at'>>
      }
      performance_metrics: {
        Row: PerformanceMetrics
        Insert: Omit<PerformanceMetrics, 'id' | 'created_at'>
        Update: Partial<Omit<PerformanceMetrics, 'id' | 'created_at'>>
      }
    }
  }
}

// Tipos das entidades
export interface Profile {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  specialty: string
  clinic_name: string | null
  phone: string | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  user_id: string
  name: string
  email: string | null
  phone: string | null
  age: number | null
  gender: 'Masculino' | 'Feminino' | 'Outro' | 'Prefiro não informar' | null
  behavioral_profile: 'Dominante' | 'Influente' | 'Estável' | 'Analítico' | null
  main_complaint: string | null
  medical_history: string | null
  created_at: string
  updated_at: string
  last_consultation_at: string | null
}

export interface Consultation {
  id: string
  user_id: string
  patient_id: string | null
  analysis_type: 'briefing' | 'diagnostico'
  consultation_date: string
  duration_minutes: number | null
  audio_url: string | null
  audio_file_size: number | null
  transcription: string | null
  transcription_status: 'pending' | 'processing' | 'completed' | 'failed'
  outcome: 'venda_realizada' | 'venda_perdida' | 'follow_up' | null
  outcome_quality: 'alta' | 'baixa' | null
  protocol_sold: string | null
  sale_value: number | null
  ai_analysis: any
  ai_processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  overall_score: number | null
  critical_errors: number
  created_at: string
  updated_at: string
}

export interface Briefing {
  id: string
  user_id: string
  patient_id: string | null
  patient_name: string
  patient_age: number | null
  main_complaint: string
  additional_notes: string | null
  ai_briefing: BriefingAIResponse
  consultation_id: string | null
  used_in_consultation: boolean
  consultation_occurred_at: string | null
  created_at: string
  updated_at: string
}

export interface UserSettings {
  user_id: string
  ai_model_preference: string
  language_preference: string
  email_notifications: boolean
  weekly_reports: boolean
  theme: 'light' | 'dark' | 'auto'
  created_at: string
  updated_at: string
}

export interface PerformanceMetrics {
  id: string
  user_id: string
  period_start: string
  period_end: string
  total_consultations: number
  total_sales: number
  total_lost_sales: number
  conversion_rate: number | null
  average_ticket: number | null
  avg_phase_scores: any
  created_at: string
}

// Tipos de respostas da IA
export interface BriefingAIResponse {
  executiveSummary: {
    patientProfile: string
    mainPainPoint: string
    recommendedProtocol: string
    estimatedInvestment: string
    conversionProbability: string
    estimatedConsultationTime: string
  }
  behavioralTriggers: {
    identifiedProfile: string
    keywords: string[]
    deepMotivations: string[]
    probableFears: string[]
  }
  consultationGoal: string[]
  phases: BriefingPhase[]
}

export interface BriefingPhase {
  phaseName: string
  steps: BriefingStep[]
}

export interface BriefingStep {
  stepNumber: number
  stepName: string
  duration: string
  objective: string
  script: string
  toneOfVoice: string
  mandatoryQuestions: string[]
  fatalErrors: string[]
  validationChecklist: string[]
  transitionScript: string
}

export interface DiagnosticAIResponse {
  overallPerformance: {
    score: number
    rating: string
    mainConclusion: string
  }
  errorPattern: {
    critical: number
    needsImprovement: number
    good: number
    excellent: number
  }
  criticalErrors: CriticalError[]
  dominoEffect: {
    sequence: string[]
    explanation: string
  }
  rootCause: string
  behavioralProfileAnalysis: {
    detectedProfile: string
    profileIndicators: string[]
    doctorAdaptationAnalysis: string
    howToSellToProfile: {
      whatToSay: string[]
      whatNotToSay: string[]
      exampleScript: string
    }
  }
  correctionStrategy: {
    immediateFocus: {
      criticalSteps: number[]
      trainingScripts: string[]
    }
    nextConsultationFocus: string[]
    lifeboatScript: string
  }
  phaseAnalysis: PhaseAnalysis[]
}

export interface CriticalError {
  errorName: string
  whyItWasFatal: string
  coachingNarrative: {
    whatWasSaid: string
    whatShouldHaveBeenSaid: string
    crucialDifference: string
  }
}

export interface PhaseAnalysis {
  stepNumber: number
  stepName: string
  score: number
  strengths: string[]
  improvements: string[]
}

// Tipos auxiliares
export interface DashboardMetrics {
  conversionRate: number
  averageTicket: number
  totalConsultations: number
  totalSales: number
  totalLostSales: number
}

// Recording types
export type RecordingStatus = 'saved' | 'processing' | 'completed' | 'failed';

export interface Recording {
  id: string
  user_id: string
  name: string
  audio_url: string
  audio_file_path: string
  duration_seconds: number | null
  file_size_bytes: number | null
  transcription_url: string | null
  transcription_text: string | null
  status: RecordingStatus
  error_message: string | null
  created_at: string
  updated_at: string
}
