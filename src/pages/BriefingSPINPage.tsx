import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Upload,
  Sparkles,
  Brain,
  Target,
  Heart,
  AlertCircle,
  Loader2,
  Download,
  ArrowLeft,
} from 'lucide-react';
import { analyzeBriefingSPIN, BriefingSPINResult } from '../lib/briefing-spin-service';
import BriefingSPINResultView from '../components/BriefingSPINResult';

export default function BriefingSPINPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'manual' | 'txt'>('manual');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<BriefingSPINResult | null>(null);
  const [progressMessage, setProgressMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    mainComplaint: '',
    conversationText: '',
  });

  // File upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFileContent(content);
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setProgressMessage('Preparando análise...');

    try {
      const textToAnalyze = activeTab === 'manual'
        ? formData.conversationText
        : fileContent;

      const result = await analyzeBriefingSPIN(
        {
          patientName: formData.patientName,
          patientAge: formData.patientAge,
          mainComplaint: formData.mainComplaint,
          conversationText: textToAnalyze,
        },
        (message) => setProgressMessage(message)
      );

      setAnalysisResult(result);

    } catch (error) {
      console.error('Erro ao analisar:', error);
      alert('Erro ao realizar análise. Tente novamente.');
    } finally {
      setIsAnalyzing(false);
      setProgressMessage('');
    }
  };

  if (analysisResult) {
    return <BriefingSPINResultView result={analysisResult} onBack={() => setAnalysisResult(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/analises')}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-rose-500" />
              Briefing Inteligente SPIN
            </h1>
            <p className="text-neutral-600 mt-1">
              Análise completa de consulta com framework de vendas para estética
            </p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-purple-900 mb-2">
              O que é o Briefing SPIN?
            </h3>
            <p className="text-sm text-purple-800 leading-relaxed">
              Ferramenta de IA que analisa transcrições de consultas e gera um relatório completo com:
              perfil comportamental do paciente, gatilhos emocionais, estratégia de fechamento personalizada,
              scripts de vendas e plano guia completo da conversa.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <div className="border-b border-neutral-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
                activeTab === 'manual'
                  ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <FileText className="w-5 h-5 inline-block mr-2" />
              Entrada Manual
            </button>
            <button
              onClick={() => setActiveTab('txt')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
                activeTab === 'txt'
                  ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Upload className="w-5 h-5 inline-block mr-2" />
              Upload TXT
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Informações do Paciente */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Informações do Paciente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Nome do Paciente <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  placeholder="Ex: Maria Silva"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Idade
                </label>
                <input
                  type="number"
                  value={formData.patientAge}
                  onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  placeholder="Ex: 35"
                />
              </div>
            </div>
          </div>

          {activeTab === 'manual' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Queixa Principal
                </label>
                <input
                  type="text"
                  value={formData.mainComplaint}
                  onChange={(e) => setFormData({ ...formData, mainComplaint: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  placeholder="Ex: Rugas de expressão, flacidez facial..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Transcrição da Consulta <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.conversationText}
                  onChange={(e) => setFormData({ ...formData, conversationText: e.target.value })}
                  rows={15}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-mono text-sm"
                  placeholder="Cole aqui a transcrição completa da conversa com o paciente...

Médico: Boa tarde! Como está se sentindo hoje?
Paciente: Olá, doutora. Estou preocupada com as rugas..."
                />
                <p className="text-xs text-neutral-500 mt-2">
                  Cole a transcrição completa da consulta incluindo falas do médico e paciente
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  Upload de Arquivo TXT
                </label>
                <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center hover:border-rose-500 transition-colors">
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    {uploadedFile ? (
                      <div>
                        <p className="text-sm font-medium text-neutral-900 mb-1">
                          {uploadedFile.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Clique para trocar o arquivo
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-neutral-900 mb-1">
                          Clique para fazer upload
                        </p>
                        <p className="text-xs text-neutral-500">
                          Arquivos TXT até 10MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {fileContent && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Preview do Conteúdo
                  </label>
                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <pre className="text-xs text-neutral-700 whitespace-pre-wrap font-mono">
                      {fileContent.substring(0, 1000)}
                      {fileContent.length > 1000 && '...'}
                    </pre>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    Mostrando primeiros 1000 caracteres de {fileContent.length} total
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-neutral-200">
            <button
              onClick={() => navigate('/analises')}
              className="px-6 py-3 border-2 border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors font-semibold"
            >
              Cancelar
            </button>
            <button
              onClick={handleAnalyze}
              disabled={
                isAnalyzing ||
                !formData.patientName ||
                (activeTab === 'manual' ? !formData.conversationText : !fileContent)
              }
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-rose-600/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {progressMessage || 'Analisando com IA...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Gerar Briefing SPIN
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard
          icon={Target}
          title="Perfil Comportamental"
          description="Identifica se o paciente é Influente, Dominante, Estável ou Analítico"
          color="purple"
        />
        <FeatureCard
          icon={Heart}
          title="Gatilhos Emocionais"
          description="Mapeia motivações, medos e palavras-gatilho específicas"
          color="rose"
        />
        <FeatureCard
          icon={Sparkles}
          title="Scripts de Vendas"
          description="Gera scripts personalizados de fechamento e negociação"
          color="pink"
        />
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: any;
  title: string;
  description: string;
  color: 'purple' | 'rose' | 'pink';
}) {
  const colors = {
    purple: 'from-purple-500 to-purple-600',
    rose: 'from-rose-500 to-rose-600',
    pink: 'from-pink-500 to-pink-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 bg-gradient-to-br ${colors[color]} rounded-lg flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="font-semibold text-neutral-900 mb-2">{title}</h3>
      <p className="text-sm text-neutral-600">{description}</p>
    </div>
  );
}

