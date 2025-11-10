// Analysis Database Service - Supabase integration
// Handles saving and retrieving analysis data

import { supabase } from './supabase';
import type {
  Analysis,
  PerformanceAnalysis,
  PerformanceAnalysisData,
  SpinQualification,
  SpinQualificationData,
  AnalysisUploadData,
  DashboardMetrics,
  Recording,
  BehavioralPlaybook,
} from './analysis-types';

/**
 * Save performance analysis to Supabase
 * Uses a transactional approach by relying on database CASCADE on delete
 * If any step fails, we delete the main record which cascades to all related data
 */
export async function savePerformanceAnalysis(
  userId: string,
  uploadData: AnalysisUploadData,
  analysisData: PerformanceAnalysisData
): Promise<PerformanceAnalysis | null> {
  let analysisId: string | null = null;

  try {
    // 1. Create main analysis record
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .insert({
        user_id: userId,
        analysis_type: 'performance',
        patient_name: uploadData.patient_name,
        file_name: uploadData.file_name,
      })
      .select()
      .single();

    if (analysisError || !analysis) {
      console.error('Error creating analysis record:', analysisError);
      throw new Error(`Falha ao criar registro de análise: ${analysisError?.message || 'Erro desconhecido'}`);
    }

    analysisId = analysis.id; // Store for rollback if needed

    // 2. Create performance analysis record
    const { error: performanceError } = await supabase
      .from('performance_analyses')
      .insert({
        id: analysis.id,
        outcome: analysisData.outcome,
        is_low_quality_sale: analysisData.is_low_quality_sale,
        ticket_value: analysisData.ticket_value,
        overall_score: analysisData.overall_performance.score,
        overall_rating: analysisData.overall_performance.rating,
        overall_summary: analysisData.overall_performance.summary,
        behavioral_profile: analysisData.behavioral_profile_analysis.profile,
        profile_justification: analysisData.behavioral_profile_analysis.justification,
        doctor_adaptation_analysis: analysisData.behavioral_profile_analysis.doctor_adaptation_analysis,
        communication_phrases: analysisData.behavioral_profile_analysis.communication_recommendations.phrases,
        communication_keywords: analysisData.behavioral_profile_analysis.communication_recommendations.keywords,
        emotional_connection_extract: analysisData.indication_baseline?.emotional_connection_extract,
        value_building_extract: analysisData.indication_baseline?.value_building_extract,
        social_proof_extract: analysisData.indication_baseline?.social_proof_extract,
      });

    if (performanceError) {
      throw performanceError;
    }

    // 3. Create phases and steps
    for (const phase of analysisData.phases) {
      const { data: phaseRecord, error: phaseError } = await supabase
        .from('analysis_phases')
        .insert({
          performance_analysis_id: analysis.id,
          phase_number: phase.phase_number,
          phase_title: phase.phase_title,
        })
        .select()
        .single();

      if (phaseError || !phaseRecord) {
        throw phaseError || new Error('Failed to create phase');
      }

      // Insert steps for this phase
      for (const step of phase.steps) {
        const { error: stepError } = await supabase
          .from('analysis_steps')
          .insert({
            phase_id: phaseRecord.id,
            step_number: step.step_number,
            step_title: step.step_title,
            score: step.score,
            rating: step.rating,
            what_did_well: step.what_did_well,
            improvement_points: step.improvement_points,
            what_was_said: step.coaching_narrative?.what_was_said,
            what_should_have_been_said: step.coaching_narrative?.what_should_have_been_said,
            crucial_differences: step.coaching_narrative?.crucial_differences,
          });

        if (stepError) {
          throw stepError;
        }
      }
    }

    // 4. Create critical observations
    const { data: criticalObs, error: criticalObsError } = await supabase
      .from('critical_observations')
      .insert({
        performance_analysis_id: analysis.id,
      })
      .select()
      .single();

    if (criticalObsError || !criticalObs) {
      throw criticalObsError || new Error('Failed to create critical observations');
    }

    // Insert control points
    for (const point of analysisData.critical_observations.essential_control_points) {
      await supabase.from('essential_control_points').insert({
        critical_observation_id: criticalObs.id,
        point_description: point.point_description,
        was_observed: point.was_observed,
      });
    }

    // Insert fatal errors
    for (const error of analysisData.critical_observations.fatal_errors) {
      await supabase.from('fatal_errors_checklist').insert({
        critical_observation_id: criticalObs.id,
        error_description: error.error_description,
        was_observed: error.was_observed,
      });
    }

    // 5. Create lost sale details if applicable
    if (analysisData.lost_sale_details) {
      const lsd = analysisData.lost_sale_details;

      const { data: lostSale, error: lostSaleError } = await supabase
        .from('lost_sale_details')
        .insert({
          performance_analysis_id: analysis.id,
          excellent_steps: lsd.error_pattern.excellent,
          good_steps: lsd.error_pattern.good,
          deficient_steps: lsd.error_pattern.deficient,
          critical_steps: lsd.error_pattern.critical,
          domino_effect: lsd.domino_effect,
          exact_moment: lsd.exact_moment,
          root_cause: lsd.root_cause,
          immediate_focus_description: lsd.correction_strategy.immediate_focus.description,
          next_call_focus_description: lsd.correction_strategy.next_call_focus.description,
          lifesaver_script: lsd.correction_strategy.lifesaver_script,
          how_doctor_sold: lsd.behavioral_report.how_doctor_sold,
          how_should_sell_to_profile: lsd.behavioral_report.how_should_sell_to_profile,
        })
        .select()
        .single();

      if (lostSaleError || !lostSale) {
        throw lostSaleError || new Error('Failed to create lost sale details');
      }

      // Insert critical errors
      for (const critError of lsd.critical_errors) {
        await supabase.from('critical_errors').insert({
          lost_sale_detail_id: lostSale.id,
          error_order: critError.error_order,
          error_title: critError.error_title,
          what_happened: critError.what_happened,
          why_critical: critError.why_critical,
          coaching_narrative: critError.coaching_narrative,
        });
      }

      // Insert training scripts
      for (const script of lsd.correction_strategy.immediate_focus.training_scripts) {
        await supabase.from('training_scripts').insert({
          lost_sale_detail_id: lostSale.id,
          focus_type: 'immediate',
          script_title: script.script_title,
          script_content: script.script_content,
          practice_recommendation: script.practice_recommendation,
        });
      }

      for (const script of lsd.correction_strategy.next_call_focus.training_scripts) {
        await supabase.from('training_scripts').insert({
          lost_sale_detail_id: lostSale.id,
          focus_type: 'next_call',
          script_title: script.script_title,
          script_content: script.script_content,
          practice_recommendation: script.practice_recommendation,
        });
      }

      // Insert strengths
      for (const strength of lsd.identified_strengths) {
        await supabase.from('identified_strengths').insert({
          lost_sale_detail_id: lostSale.id,
          strength_title: strength.strength_title,
          evidence: strength.evidence,
          how_to_leverage: strength.how_to_leverage,
        });
      }

      // Insert errors for correction
      for (const errorCorr of lsd.errors_for_correction) {
        await supabase.from('errors_for_correction').insert({
          lost_sale_detail_id: lostSale.id,
          error_title: errorCorr.error_title,
          what_did: errorCorr.what_did,
          impact: errorCorr.impact,
          correction: errorCorr.correction,
        });
      }

      // Insert final coaching plan
      await supabase.from('final_coaching_plans').insert({
        lost_sale_detail_id: lostSale.id,
        pre_call_checklist: lsd.final_coaching_plan.pre_call_checklist,
        during_call_checklist: lsd.final_coaching_plan.during_call_checklist,
        post_call_checklist: lsd.final_coaching_plan.post_call_checklist,
      });
    }

    // Return complete analysis
    return {
      ...analysis,
      analysis_type: 'performance',
      performanceData: analysisData,
    } as PerformanceAnalysis;
  } catch (error) {
    console.error('Error saving performance analysis:', error);

    // Rollback: Delete the main analysis record if it was created
    // This will CASCADE delete all related records automatically
    if (analysisId) {
      console.log('Rolling back transaction by deleting analysis:', analysisId);
      await supabase
        .from('analyses')
        .delete()
        .eq('id', analysisId);
    }

    // Re-throw with user-friendly message
    if (error instanceof Error) {
      throw new Error(`Erro ao salvar análise: ${error.message}`);
    }
    throw new Error('Erro desconhecido ao salvar análise');
  }
}

/**
 * Save SPIN qualification to Supabase
 * Uses a transactional approach by relying on database CASCADE on delete
 * If any step fails, we delete the main record which cascades to all related data
 */
export async function saveSpinQualification(
  userId: string,
  uploadData: AnalysisUploadData,
  spinData: SpinQualificationData
): Promise<SpinQualification | null> {
  let analysisId: string | null = null;

  try {
    // 1. Create main analysis record
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .insert({
        user_id: userId,
        analysis_type: 'spin',
        patient_name: uploadData.patient_name,
        file_name: uploadData.file_name,
      })
      .select()
      .single();

    if (analysisError || !analysis) {
      console.error('Error creating analysis record:', analysisError);
      throw new Error(`Falha ao criar registro de análise SPIN: ${analysisError?.message || 'Erro desconhecido'}`);
    }

    analysisId = analysis.id; // Store for rollback if needed

    // 2. Create SPIN qualification record
    const { error: spinError } = await supabase
      .from('spin_qualifications')
      .insert({
        id: analysis.id,
        patient_age: spinData.patient_age,
        patient_concern: spinData.patient_concern,
        primary_concern: spinData.executive_summary.primary_concern,
        primary_pain: spinData.executive_summary.primary_pain,
        primary_desire: spinData.executive_summary.primary_desire,
        recommended_protocol: spinData.executive_summary.recommended_protocol,
        estimated_investment: spinData.executive_summary.estimated_investment,
        expected_conversion_rate: spinData.executive_summary.expected_conversion_rate,
        total_consultation_time: spinData.executive_summary.total_consultation_time,
        trigger_keywords: spinData.behavioral_triggers.keywords,
        deep_motivations: spinData.behavioral_triggers.deep_motivations,
        probable_fears: spinData.behavioral_triggers.probable_fears,
        consultation_goals: spinData.consultation_goals,
      });

    if (spinError) {
      throw spinError;
    }

    // 3. Create consultation phases and steps
    for (const phase of spinData.phases) {
      const { data: phaseRecord, error: phaseError } = await supabase
        .from('consultation_phases')
        .insert({
          spin_qualification_id: analysis.id,
          phase_number: phase.phase_number,
          phase_title: phase.phase_title,
        })
        .select()
        .single();

      if (phaseError || !phaseRecord) {
        throw phaseError || new Error('Failed to create consultation phase');
      }

      // Insert steps for this phase
      for (const step of phase.steps) {
        const { error: stepError } = await supabase
          .from('consultation_steps')
          .insert({
            consultation_phase_id: phaseRecord.id,
            step_number: step.step_number,
            step_title: step.step_title,
            duration: step.details.duration,
            objective: step.details.objective,
            tone_of_voice: step.details.tone_of_voice,
            visual_contact: step.details.visual_contact,
            posture: step.details.posture,
            script: step.details.script,
            mandatory_questions: step.details.mandatory_questions,
            fatal_errors: step.details.fatal_errors,
            validation_checklist: step.details.validation_checklist,
            transition_script: step.details.transition_script,
          });

        if (stepError) {
          throw stepError;
        }
      }
    }

    // Return complete qualification
    return {
      ...analysis,
      analysis_type: 'spin',
      spinData,
    } as SpinQualification;
  } catch (error) {
    console.error('Error saving SPIN qualification:', error);

    // Rollback: Delete the main analysis record if it was created
    // This will CASCADE delete all related records automatically
    if (analysisId) {
      console.log('Rolling back transaction by deleting analysis:', analysisId);
      await supabase
        .from('analyses')
        .delete()
        .eq('id', analysisId);
    }

    // Re-throw with user-friendly message
    if (error instanceof Error) {
      throw new Error(`Erro ao salvar briefing SPIN: ${error.message}`);
    }
    throw new Error('Erro desconhecido ao salvar briefing SPIN');
  }
}

/**
 * Get all analyses for a user
 */
export async function getUserAnalyses(userId: string): Promise<Analysis[]> {
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching analyses:', error);
    return [];
  }

  return data || [];
}

/**
 * Get performance analysis by ID (with all related data)
 */
export async function getPerformanceAnalysisById(
  analysisId: string
): Promise<PerformanceAnalysis | null> {
  try {
    // 1. Get main analysis record
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (analysisError || !analysis) {
      console.error('Error fetching analysis:', analysisError);
      return null;
    }

    // 2. Get performance analysis data
    const { data: perfData, error: perfError } = await supabase
      .from('performance_analyses')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (perfError || !perfData) {
      console.error('Error fetching performance data:', perfError);
      return null;
    }

    // 3. Get phases with steps
    const { data: phases, error: phasesError } = await supabase
      .from('analysis_phases')
      .select('*')
      .eq('performance_analysis_id', analysisId)
      .order('phase_number');

    if (phasesError) {
      console.error('Error fetching phases:', phasesError);
      return null;
    }

    // 4. Get steps for all phases
    const phasesWithSteps = await Promise.all(
      (phases || []).map(async (phase) => {
        const { data: steps, error: stepsError } = await supabase
          .from('analysis_steps')
          .select('*')
          .eq('phase_id', phase.id)
          .order('step_number');

        if (stepsError) {
          console.error('Error fetching steps:', stepsError);
          return { ...phase, steps: [] };
        }

        return {
          id: phase.id,
          phase_number: phase.phase_number,
          phase_title: phase.phase_title,
          steps: (steps || []).map((step) => ({
            id: step.id,
            step_number: step.step_number,
            step_title: step.step_title,
            score: step.score,
            rating: step.rating,
            what_did_well: step.what_did_well || [],
            improvement_points: step.improvement_points || [],
            coaching_narrative: step.what_was_said
              ? {
                  what_was_said: step.what_was_said,
                  what_should_have_been_said: step.what_should_have_been_said || '',
                  crucial_differences: step.crucial_differences || [],
                }
              : undefined,
          })),
        };
      })
    );

    // 5. Get critical observations
    const { data: criticalObs } = await supabase
      .from('critical_observations')
      .select('*')
      .eq('performance_analysis_id', analysisId)
      .single();

    let critical_observations = null;
    if (criticalObs) {
      const { data: controlPoints } = await supabase
        .from('essential_control_points')
        .select('*')
        .eq('critical_observation_id', criticalObs.id);

      const { data: fatalErrors } = await supabase
        .from('fatal_errors_checklist')
        .select('*')
        .eq('critical_observation_id', criticalObs.id);

      critical_observations = {
        essential_control_points: (controlPoints || []).map((cp) => ({
          id: cp.id,
          point_description: cp.point_description,
          was_observed: cp.was_observed,
        })),
        fatal_errors: (fatalErrors || []).map((fe) => ({
          id: fe.id,
          error_description: fe.error_description,
          was_observed: fe.was_observed,
        })),
      };
    }

    // 6. Get lost sale details if applicable
    const { data: lostSale } = await supabase
      .from('lost_sale_details')
      .select('*')
      .eq('performance_analysis_id', analysisId)
      .maybeSingle();

    let lost_sale_details = null;
    if (lostSale) {
      // Get critical errors
      const { data: critErrors } = await supabase
        .from('critical_errors')
        .select('*')
        .eq('lost_sale_detail_id', lostSale.id)
        .order('error_order');

      // Get training scripts
      const { data: scripts } = await supabase
        .from('training_scripts')
        .select('*')
        .eq('lost_sale_detail_id', lostSale.id);

      // Get strengths
      const { data: strengths } = await supabase
        .from('identified_strengths')
        .select('*')
        .eq('lost_sale_detail_id', lostSale.id);

      // Get errors for correction
      const { data: errors } = await supabase
        .from('errors_for_correction')
        .select('*')
        .eq('lost_sale_detail_id', lostSale.id);

      // Get coaching plan
      const { data: coachingPlan } = await supabase
        .from('final_coaching_plans')
        .select('*')
        .eq('lost_sale_detail_id', lostSale.id)
        .maybeSingle();

      lost_sale_details = {
        error_pattern: {
          excellent: lostSale.excellent_steps || 0,
          good: lostSale.good_steps || 0,
          deficient: lostSale.deficient_steps || 0,
          critical: lostSale.critical_steps || 0,
        },
        critical_errors: (critErrors || []).map((ce) => ({
          error_order: ce.error_order,
          error_title: ce.error_title,
          what_happened: ce.what_happened || '',
          why_critical: ce.why_critical || '',
          coaching_narrative: ce.coaching_narrative || '',
        })),
        domino_effect: lostSale.domino_effect || '',
        exact_moment: lostSale.exact_moment || '',
        root_cause: lostSale.root_cause || '',
        correction_strategy: {
          immediate_focus: {
            description: lostSale.immediate_focus_description || '',
            training_scripts: (scripts || [])
              .filter((s) => s.focus_type === 'immediate')
              .map((s) => ({
                id: s.id,
                script_title: s.script_title,
                script_content: s.script_content,
                practice_recommendation: s.practice_recommendation || '10x',
              })),
          },
          next_call_focus: {
            description: lostSale.next_call_focus_description || '',
            training_scripts: (scripts || [])
              .filter((s) => s.focus_type === 'next_call')
              .map((s) => ({
                id: s.id,
                script_title: s.script_title,
                script_content: s.script_content,
                practice_recommendation: s.practice_recommendation || '10x',
              })),
          },
          lifesaver_script: lostSale.lifesaver_script || '',
        },
        behavioral_report: {
          how_doctor_sold: lostSale.how_doctor_sold || '',
          how_should_sell_to_profile: lostSale.how_should_sell_to_profile || '',
        },
        identified_strengths: (strengths || []).map((s) => ({
          strength_title: s.strength_title,
          evidence: s.evidence,
          how_to_leverage: s.how_to_leverage || '',
        })),
        errors_for_correction: (errors || []).map((e) => ({
          error_title: e.error_title,
          what_did: e.what_did || '',
          impact: e.impact || '',
          correction: e.correction || '',
        })),
        final_coaching_plan: coachingPlan
          ? {
              pre_call_checklist: coachingPlan.pre_call_checklist || [],
              during_call_checklist: coachingPlan.during_call_checklist || [],
              post_call_checklist: coachingPlan.post_call_checklist || [],
            }
          : {
              pre_call_checklist: [],
              during_call_checklist: [],
              post_call_checklist: [],
            },
      };
    }

    // 7. Build complete performance analysis data
    const performanceData: PerformanceAnalysisData = {
      outcome: perfData.outcome,
      is_low_quality_sale: perfData.is_low_quality_sale || false,
      ticket_value: perfData.ticket_value ? Number(perfData.ticket_value) : undefined,
      overall_performance: {
        score: perfData.overall_score,
        rating: perfData.overall_rating,
        summary: perfData.overall_summary || '',
      },
      behavioral_profile_analysis: {
        profile: perfData.behavioral_profile,
        justification: perfData.profile_justification || '',
        doctor_adaptation_analysis: perfData.doctor_adaptation_analysis || '',
        communication_recommendations: {
          phrases: perfData.communication_phrases || [],
          keywords: perfData.communication_keywords || [],
        },
      },
      indication_baseline: perfData.emotional_connection_extract
        ? {
            emotional_connection_extract: perfData.emotional_connection_extract,
            value_building_extract: perfData.value_building_extract || '',
            social_proof_extract: perfData.social_proof_extract || '',
          }
        : undefined,
      phases: phasesWithSteps,
      critical_observations: critical_observations || {
        essential_control_points: [],
        fatal_errors: [],
      },
      lost_sale_details: lost_sale_details || undefined,
    };

    return {
      ...analysis,
      analysis_type: 'performance',
      performanceData,
    } as PerformanceAnalysis;
  } catch (error) {
    console.error('Error fetching performance analysis:', error);
    return null;
  }
}

/**
 * Get SPIN qualification by ID (with all related data)
 */
export async function getSpinQualificationById(
  analysisId: string
): Promise<SpinQualification | null> {
  try {
    // 1. Get main analysis record
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (analysisError || !analysis) {
      console.error('Error fetching analysis:', analysisError);
      return null;
    }

    // 2. Get SPIN qualification data
    const { data: spinData, error: spinError } = await supabase
      .from('spin_qualifications')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (spinError || !spinData) {
      console.error('Error fetching SPIN data:', spinError);
      return null;
    }

    // 3. Get consultation phases with steps
    const { data: phases, error: phasesError } = await supabase
      .from('consultation_phases')
      .select('*')
      .eq('spin_qualification_id', analysisId)
      .order('phase_number');

    if (phasesError) {
      console.error('Error fetching consultation phases:', phasesError);
      return null;
    }

    // 4. Get steps for all phases
    const phasesWithSteps = await Promise.all(
      (phases || []).map(async (phase) => {
        const { data: steps, error: stepsError } = await supabase
          .from('consultation_steps')
          .select('*')
          .eq('consultation_phase_id', phase.id)
          .order('step_number');

        if (stepsError) {
          console.error('Error fetching consultation steps:', stepsError);
          return { ...phase, steps: [] };
        }

        return {
          id: phase.id,
          phase_number: phase.phase_number,
          phase_title: phase.phase_title,
          steps: (steps || []).map((step) => ({
            id: step.id,
            step_number: step.step_number,
            step_title: step.step_title,
            details: {
              duration: step.duration || '',
              objective: step.objective || '',
              tone_of_voice: step.tone_of_voice || '',
              visual_contact: step.visual_contact || '',
              posture: step.posture || '',
              script: step.script || '',
              mandatory_questions: step.mandatory_questions || [],
              fatal_errors: step.fatal_errors || [],
              validation_checklist: step.validation_checklist || [],
              transition_script: step.transition_script || '',
            },
          })),
        };
      })
    );

    // 5. Build complete SPIN qualification data
    const qualificationData: SpinQualificationData = {
      patient_age: spinData.patient_age || 0,
      patient_concern: spinData.patient_concern,
      executive_summary: {
        primary_concern: spinData.primary_concern || '',
        primary_pain: spinData.primary_pain || '',
        primary_desire: spinData.primary_desire || '',
        recommended_protocol: spinData.recommended_protocol || '',
        estimated_investment: spinData.estimated_investment || '',
        expected_conversion_rate: spinData.expected_conversion_rate || '',
        total_consultation_time: spinData.total_consultation_time || '',
      },
      behavioral_triggers: {
        keywords: spinData.trigger_keywords || [],
        deep_motivations: spinData.deep_motivations || [],
        probable_fears: spinData.probable_fears || [],
      },
      consultation_goals: spinData.consultation_goals || [],
      phases: phasesWithSteps,
    };

    return {
      ...analysis,
      analysis_type: 'spin',
      spinData: qualificationData,
    } as SpinQualification;
  } catch (error) {
    console.error('Error fetching SPIN qualification:', error);
    return null;
  }
}

/**
 * Get dashboard metrics for a user
 */
export async function getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
  try {
    // Get all analyses
    const { data: analyses } = await supabase
      .from('analyses')
      .select('id, analysis_type, created_at')
      .eq('user_id', userId);

    const total_analyses = analyses?.length || 0;
    const performance_analyses =
      analyses?.filter((a) => a.analysis_type === 'performance').length || 0;
    const spin_qualifications =
      analyses?.filter((a) => a.analysis_type === 'spin').length || 0;

    // Get performance data
    const { data: perfData } = await supabase
      .from('performance_analyses')
      .select('outcome, ticket_value, behavioral_profile')
      .in(
        'id',
        analyses?.map((a) => a.id) || []
      );

    const realized_sales = perfData?.filter((p) => p.outcome === 'Venda Realizada').length || 0;
    const total_revenue =
      perfData?.reduce((sum, p) => sum + (p.ticket_value || 0), 0) || 0;

    // Calculate metrics
    const conversion_rate =
      performance_analyses > 0 ? (realized_sales / performance_analyses) * 100 : 0;
    const average_ticket = realized_sales > 0 ? total_revenue / realized_sales : 0;

    // Most frequent profile
    const profileCounts: Record<string, number> = {};
    perfData?.forEach((p) => {
      if (p.behavioral_profile) {
        profileCounts[p.behavioral_profile] = (profileCounts[p.behavioral_profile] || 0) + 1;
      }
    });
    const most_frequent_profile =
      Object.keys(profileCounts).length > 0
        ? (Object.keys(profileCounts).reduce((a, b) =>
            profileCounts[a] > profileCounts[b] ? a : b
          ) as any)
        : 'Não Identificado';

    // Time-based metrics
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const analyses_this_month =
      analyses?.filter((a) => new Date(a.created_at) >= monthAgo).length || 0;
    const analyses_this_week =
      analyses?.filter((a) => new Date(a.created_at) >= weekAgo).length || 0;

    return {
      total_analyses,
      performance_analyses,
      spin_qualifications,
      conversion_rate,
      total_revenue,
      average_ticket,
      most_frequent_profile,
      analyses_this_month,
      analyses_this_week,
    };
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return {
      total_analyses: 0,
      performance_analyses: 0,
      spin_qualifications: 0,
      conversion_rate: 0,
      total_revenue: 0,
      average_ticket: 0,
      most_frequent_profile: 'Não Identificado',
      analyses_this_month: 0,
      analyses_this_week: 0,
    };
  }
}

/**
 * Save recording
 */
export async function saveRecording(
  userId: string,
  recording: Omit<Recording, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Recording | null> {
  const { data, error } = await supabase
    .from('recordings')
    .insert({
      user_id: userId,
      ...recording,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving recording:', error);
    return null;
  }

  return data;
}

/**
 * Get user recordings
 */
export async function getUserRecordings(userId: string): Promise<Recording[]> {
  const { data, error } = await supabase
    .from('recordings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching recordings:', error);
    return [];
  }

  return data || [];
}

/**
 * Update recording transcription
 */
export async function updateRecordingTranscription(
  recordingId: string,
  transcription: string
): Promise<boolean> {
  const { error } = await supabase
    .from('recordings')
    .update({ transcription, updated_at: new Date().toISOString() })
    .eq('id', recordingId);

  if (error) {
    console.error('Error updating transcription:', error);
    return false;
  }

  return true;
}

/**
 * Get behavioral playbook
 */
export async function getBehavioralPlaybook(): Promise<BehavioralPlaybook[]> {
  const { data, error } = await supabase.from('behavioral_playbook').select('*');

  if (error) {
    console.error('Error fetching behavioral playbook:', error);
    return [];
  }

  return data || [];
}

/**
 * Delete an analysis by ID
 */
export async function deleteAnalysis(analysisId: string): Promise<void> {
  const { error } = await supabase
    .from('analyses')
    .delete()
    .eq('id', analysisId);

  if (error) {
    console.error('Error deleting analysis:', error);
    throw new Error(`Erro ao deletar análise: ${error.message}`);
  }
}
