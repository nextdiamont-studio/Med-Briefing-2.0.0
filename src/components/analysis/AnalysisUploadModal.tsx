// Analysis Upload Modal - Multi-step wizard for uploading and creating analyses

import { useState, useEffect } from 'react';
import { X, Upload, FileText, Users, TrendingDown, TrendingUp, Loader2, Brain } from 'lucide-react';
import type { AnalysisType, ConsultationOutcome } from '@/lib/analysis-types';
import { analyzeConsultationPerformance, generateIntelligentBriefing } from '@/lib/analysis-service';
import { savePerformanceAnalysis, saveSpinQualification } from '@/lib/analysis-db';
import { useAuth } from '@/hooks/useAuth';
import { extractTextFromFile, isValidFileType, getFileTypeDisplay } from '@/lib/pdf-utils';

interface AnalysisUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialTranscription?: string;
}

type UploadStep = 'type' | 'source' | 'performance-details' | 'briefing-details' | 'processing' | 'success';

export function AnalysisUploadModal({ isOpen, onClose, onSuccess, initialTranscription }: AnalysisUploadModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<UploadStep>(initialTranscription ? 'type' : 'type');
  const [analysisType, setAnalysisType] = useState<AnalysisType | 'briefing' | null>(null);
  const [sourceType, setSourceType] = useState<'upload' | 'manual' | null>(initialTranscription ? 'manual' : null);

  // Performance analysis fields
  const [patientName, setPatientName] = useState('');
  const [outcome, setOutcome] = useState<ConsultationOutcome | null>(null);
  const [ticketValue, setTicketValue] = useState('');
  const [transcript, setTranscript] = useState(initialTranscription || '');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Briefing fields
  const [patientAge, setPatientAge] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Atualizar transcrição quando initialTranscription mudar
  useEffect(() => {
    if (initialTranscription && initialTranscription !== transcript) {
      setTranscript(initialTranscription);
      setSourceType('manual');
    }
  }, [initialTranscription]);

  if (!isOpen) return null;

  const resetModal = () => {
    setStep('type');
    setAnalysisType(null);
    setSourceType(null);
    setPatientName('');
    setOutcome(null);
    setTicketValue('');
    setTranscript('');
    setUploadedFile(null);
    setPatientAge('');
    setError('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!isValidFileType(file)) {
      setError('Formato de arquivo não suportado. Use apenas arquivos PDF ou TXT.');
      return;
    }

    setUploadedFile(file);
    setError('');

    try {
      // Extract text from file (handles both PDF and TXT)
      const content = await extractTextFromFile(file);
      setTranscript(content);
    } catch (err) {
      console.error('Error reading file:', err);
      setError(err instanceof Error ? err.message : 'Erro ao ler arquivo');
      setUploadedFile(null);
      setTranscript('');
    }
  };

  const handleProcessAnalysis = async () => {
    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    setIsProcessing(true);
    setError('');
    setStep('processing');

    try {
      if (analysisType === 'performance') {
        // Validate performance fields
        if (!patientName || !outcome || !transcript) {
          throw new Error('Preencha todos os campos obrigatórios');
        }

        // Analyze with Gemini
        const result = await analyzeConsultationPerformance({
          patient_name: patientName,
          outcome,
          ticket_value: ticketValue ? parseFloat(ticketValue) : undefined,
          transcript,
          file_name: uploadedFile?.name,
        });

        if (!result.success || !result.data) {
          throw new Error(result.error || 'Falha na análise');
        }

        // Save to Supabase
        await savePerformanceAnalysis(
          user.id,
          {
            analysis_type: 'performance',
            patient_name: patientName,
            file_name: uploadedFile?.name,
            outcome,
            ticket_value: ticketValue ? parseFloat(ticketValue) : undefined,
          },
          result.data
        );

        setStep('success');
      } else if (analysisType === 'briefing') {
        // Validate Briefing fields
        if (!patientName || !transcript) {
          throw new Error('Preencha todos os campos obrigatórios');
        }

        // Generate Intelligent Briefing with Gemini
        const result = await generateIntelligentBriefing(
          patientName,
          patientAge,
          undefined, // mainComplaint will be extracted from transcript
          transcript
        );

        if (!result.success || !result.data) {
          throw new Error(result.error || 'Falha na geração do briefing inteligente');
        }

        // Save to Supabase as 'spin' type (same structure)
        await saveSpinQualification(
          user.id,
          {
            analysis_type: 'spin',
            patient_name: patientName,
            patient_age: patientAge ? parseInt(patientAge) : undefined,
            patient_concern: result.data.patient_concern || 'Briefing Inteligente',
          },
          result.data
        );

        setStep('success');
      }
    } catch (err) {
      console.error('Error processing analysis:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar análise');
      const errorStep = analysisType === 'performance' ? 'performance-details' : 'briefing-details';
      setStep(errorStep);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Nova Análise
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Choose Analysis Type */}
          {step === 'type' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Escolha o tipo de análise
              </h3>

              <button
                onClick={() => {
                  setAnalysisType('performance');
                  // Se tem transcrição inicial, pula a escolha de fonte e vai direto para detalhes
                  setStep(initialTranscription ? 'performance-details' : 'source');
                }}
                className="w-full p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors text-left"
              >
                <div className="flex items-start gap-4">
                  <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                      Análise de Performance
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Analise uma consulta já realizada para identificar pontos fortes, erros e
                      estratégias de correção. Ideal para vendas perdidas ou realizadas.
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setAnalysisType('briefing');
                  // Se tem transcrição inicial, pula a escolha de fonte e vai direto para detalhes
                  setStep(initialTranscription ? 'briefing-details' : 'source');
                }}
                className="w-full p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-pink-500 dark:hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950 transition-colors text-left"
              >
                <div className="flex items-start gap-4">
                  <Brain className="w-8 h-8 text-pink-600 dark:text-pink-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                      Briefing Inteligente
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Analise uma transcrição de consulta para gerar um briefing estratégico completo com scripts e perfil comportamental.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Step 2: Choose Source (Performance and Briefing) */}
          {step === 'source' && (analysisType === 'performance' || analysisType === 'briefing') && (
            <div className="space-y-4">
              <button
                onClick={() => setStep('type')}
                className="text-blue-600 dark:text-blue-400 hover:underline mb-4"
              >
                ← Voltar
              </button>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Como você quer fornecer a transcrição?
              </h3>

              <button
                onClick={() => {
                  setSourceType('upload');
                  setStep(analysisType === 'performance' ? 'performance-details' : 'briefing-details');
                }}
                className="w-full p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950 transition-colors text-left"
              >
                <div className="flex items-start gap-4">
                  <Upload className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                      Upload de Arquivo
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Envie um arquivo TXT ou PDF com a transcrição da consulta
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setSourceType('manual');
                  setStep(analysisType === 'performance' ? 'performance-details' : 'briefing-details');
                }}
                className="w-full p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950 transition-colors text-left"
              >
                <div className="flex items-start gap-4">
                  <FileText className="w-8 h-8 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                      Entrada Manual
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Cole ou digite a transcrição diretamente
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Step 3: Performance Details */}
          {step === 'performance-details' && (
            <div className="space-y-4">
              {!initialTranscription && (
                <button
                  onClick={() => setStep('source')}
                  className="text-blue-600 dark:text-blue-400 hover:underline mb-4"
                >
                  ← Voltar
                </button>
              )}

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Detalhes da Consulta
              </h3>

              {error && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome do Paciente *
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="João da Silva"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Resultado da Consulta *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setOutcome('Venda Realizada')}
                    className={`p-4 border-2 rounded-lg transition-colors ${
                      outcome === 'Venda Realizada'
                        ? 'border-green-500 bg-green-50 dark:bg-green-950'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
                    <div className="font-semibold text-gray-900 dark:text-white">Venda Realizada</div>
                  </button>
                  <button
                    onClick={() => setOutcome('Venda Perdida')}
                    className={`p-4 border-2 rounded-lg transition-colors ${
                      outcome === 'Venda Perdida'
                        ? 'border-red-500 bg-red-50 dark:bg-red-950'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <TrendingDown className="w-6 h-6 mx-auto mb-2 text-red-600 dark:text-red-400" />
                    <div className="font-semibold text-gray-900 dark:text-white">Venda Perdida</div>
                  </button>
                </div>
              </div>

              {outcome === 'Venda Realizada' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valor do Ticket (R$)
                  </label>
                  <input
                    type="number"
                    value={ticketValue}
                    onChange={(e) => setTicketValue(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="5000.00"
                    step="0.01"
                  />
                </div>
              )}

              {initialTranscription ? (
                <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                    ✓ Transcrição carregada da gravação ({transcript.length} caracteres)
                  </p>
                </div>
              ) : sourceType === 'upload' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Arquivo de Transcrição * (TXT ou PDF)
                  </label>
                  <input
                    type="file"
                    accept=".txt,.pdf"
                    onChange={handleFileUpload}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {uploadedFile && (
                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-sm text-green-600 dark:text-green-400">
                        ✓ {uploadedFile.name} ({getFileTypeDisplay(uploadedFile)}) - {transcript.length} caracteres extraídos
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Transcrição da Consulta *
                  </label>
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    rows={10}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                    placeholder="Cole ou digite a transcrição da consulta aqui..."
                  />
                </div>
              )}

              <button
                onClick={handleProcessAnalysis}
                disabled={isProcessing || !patientName || !outcome || !transcript}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
              >
                Analisar Consulta
              </button>
            </div>
          )}

          {/* Step 4: Briefing Inteligente Details */}
          {step === 'briefing-details' && (
            <div className="space-y-4">
              {!initialTranscription && (
                <button
                  onClick={() => setStep('source')}
                  className="text-blue-600 dark:text-blue-400 hover:underline mb-4"
                >
                  ← Voltar
                </button>
              )}

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Detalhes do Briefing Inteligente
              </h3>

              {error && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome do Paciente *
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Maria Santos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Idade (opcional)
                </label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="35"
                />
              </div>

              {initialTranscription ? (
                <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                    ✓ Transcrição carregada da gravação ({transcript.length} caracteres)
                  </p>
                </div>
              ) : sourceType === 'upload' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Arquivo de Transcrição * (TXT ou PDF)
                  </label>
                  <input
                    type="file"
                    accept=".txt,.pdf"
                    onChange={handleFileUpload}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {uploadedFile && (
                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-sm text-green-600 dark:text-green-400">
                        ✓ {uploadedFile.name} ({getFileTypeDisplay(uploadedFile)}) - {transcript.length} caracteres extraídos
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Transcrição da Consulta *
                  </label>
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    rows={10}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                    placeholder="Cole ou digite a transcrição da consulta aqui..."
                  />
                </div>
              )}

              <button
                onClick={handleProcessAnalysis}
                disabled={isProcessing || !patientName || !transcript}
                className="w-full py-3 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
              >
                Gerar Briefing Inteligente
              </button>
            </div>
          )}

          {/* Processing */}
          {step === 'processing' && (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Processando análise...
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                A IA está analisando os dados. Isso pode levar alguns instantes.
              </p>
            </div>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Análise concluída com sucesso!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Sua {analysisType === 'performance' ? 'análise de performance' : 'briefing inteligente'} foi gerada e salva.
              </p>
              <button
                onClick={() => {
                  handleClose();
                  onSuccess();
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Ver Análise
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
