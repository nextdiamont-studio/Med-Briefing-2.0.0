import {
  ArrowLeft,
  Download,
  User,
  Brain,
  Target,
  Heart,
  Zap,
  MessageSquare,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { BriefingSPINResult } from '../lib/briefing-spin-service';

interface BriefingSPINResultProps {
  result: BriefingSPINResult;
  onBack: () => void;
}

export default function BriefingSPINResultView({
  result,
  onBack,
}: BriefingSPINResultProps) {
  const handleDownloadPDF = () => {
    // TODO: Implement PDF generation
    alert('Funcionalidade de download PDF em desenvolvimento');
  };

  const profileColors = {
    Influente: 'from-yellow-500 to-orange-500',
    Dominante: 'from-red-500 to-rose-600',
    Estável: 'from-green-500 to-emerald-600',
    Analítico: 'from-blue-500 to-indigo-600',
  };

  const profileIcons = {
    Influente: '🌟',
    Dominante: '🎯',
    Estável: '🤝',
    Analítico: '📊',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Voltar</span>
        </button>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all shadow-lg shadow-rose-600/40 font-semibold"
        >
          <Download className="w-5 h-5" />
          Baixar PDF
        </button>
      </div>

      {/* Patient Info */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-purple-900 mb-2">
              {result.patientName}
            </h2>
            <div className="flex flex-wrap gap-4 text-sm text-purple-800">
              {result.patientAge && <span>Idade: {result.patientAge} anos</span>}
              {result.mainComplaint && (
                <span>Queixa: {result.mainComplaint}</span>
              )}
              <span>
                Análise: {new Date(result.createdAt!).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Behavioral Profile */}
      <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-neutral-900">
              Perfil Comportamental
            </h3>
            <p className="text-sm text-neutral-600">Análise DISC</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div
            className={`bg-gradient-to-br ${
              profileColors[result.behavioralProfile.primaryType]
            } rounded-xl p-6 text-white`}
          >
            <div className="text-4xl mb-2">
              {profileIcons[result.behavioralProfile.primaryType]}
            </div>
            <div className="text-sm font-semibold opacity-90 mb-1">
              Perfil Primário
            </div>
            <div className="text-2xl font-bold">
              {result.behavioralProfile.primaryType}
            </div>
          </div>

          {result.behavioralProfile.secondaryType && (
            <div
              className={`bg-gradient-to-br ${
                profileColors[result.behavioralProfile.secondaryType]
              } rounded-xl p-6 text-white opacity-80`}
            >
              <div className="text-4xl mb-2">
                {profileIcons[result.behavioralProfile.secondaryType]}
              </div>
              <div className="text-sm font-semibold opacity-90 mb-1">
                Perfil Secundário
              </div>
              <div className="text-2xl font-bold">
                {result.behavioralProfile.secondaryType}
              </div>
            </div>
          )}
        </div>

        <div className="bg-neutral-50 rounded-lg p-6 mb-4">
          <p className="text-neutral-700 leading-relaxed mb-4">
            {result.behavioralProfile.description}
          </p>
          <div className="space-y-2">
            {result.behavioralProfile.characteristics.map((char, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-neutral-700">{char}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SPIN Diagnosis */}
      <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-neutral-900">
              Diagnóstico SPIN
            </h3>
            <p className="text-sm text-neutral-600">
              Situação • Problema • Implicação • Necessidade
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SPINCard
            title="Situação"
            content={result.spinDiagnosis.situacao}
            color="blue"
            icon="📋"
          />
          <SPINCard
            title="Problema"
            content={result.spinDiagnosis.problema}
            color="orange"
            icon="⚠️"
          />
          <SPINCard
            title="Implicação"
            content={result.spinDiagnosis.implicacao}
            color="red"
            icon="💥"
          />
          <SPINCard
            title="Necessidade"
            content={result.spinDiagnosis.necessidade}
            color="green"
            icon="✨"
          />
        </div>
      </div>

      {/* Emotional Triggers */}
      <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-neutral-900">
              Gatilhos Emocionais
            </h3>
            <p className="text-sm text-neutral-600">
              Motivações, Medos e Palavras-Gatilho
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-600" />
              Motivações
            </h4>
            <div className="space-y-2">
              {result.emotionalTriggers.motivacoes.map((item, index) => (
                <div
                  key={index}
                  className="px-4 py-2 rounded-lg text-sm"
                  style={{ backgroundColor: `${item.color}20`, color: item.color }}
                >
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-red-600" />
              Medos
            </h4>
            <div className="space-y-2">
              {result.emotionalTriggers.medos.map((item, index) => (
                <div
                  key={index}
                  className="px-4 py-2 rounded-lg text-sm"
                  style={{ backgroundColor: `${item.color}20`, color: item.color }}
                >
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              Palavras-Gatilho
            </h4>
            <div className="space-y-2">
              {result.emotionalTriggers.palavrasGatilho.map((item, index) => (
                <div
                  key={index}
                  className="px-4 py-2 rounded-lg text-sm"
                  style={{ backgroundColor: `${item.color}20`, color: item.color }}
                >
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Closing Strategy */}
      <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-neutral-900">
              Estratégia de Fechamento
            </h3>
            <p className="text-sm text-neutral-600">Scripts Personalizados</p>
          </div>
        </div>

        <div className="space-y-4">
          <StrategyCard
            title="💎 Ancoragem de Valor"
            content={result.closingStrategy.ancoramentoValor}
          />
          <StrategyCard
            title="🎯 Oferta Principal"
            content={result.closingStrategy.ofertaPrincipal}
          />
          <StrategyCard
            title="✅ Garantia"
            content={result.closingStrategy.garantia}
          />
          <StrategyCard
            title="⏰ Urgência"
            content={result.closingStrategy.urgencia}
          />
        </div>
      </div>

      {/* Sales Scripts */}
      <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-neutral-900">
              Scripts de Venda
            </h3>
            <p className="text-sm text-neutral-600">
              Argumentos Prontos para Uso
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {result.salesScripts.map((script, index) => (
            <div
              key={index}
              className="border-2 border-neutral-200 rounded-xl p-6 hover:border-purple-300 transition-colors"
            >
              <h4 className="font-bold text-lg text-neutral-900 mb-3 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  {index + 1}
                </span>
                {script.titulo}
              </h4>
              <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
                {script.conteudo}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Conversation Guide */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg border-2 border-purple-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-purple-900">
              Plano Guia Completo
            </h3>
            <p className="text-sm text-purple-700">
              Passo a Passo da Consulta
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <GuideStep
            number={1}
            title="Conexão Emocional"
            content={result.conversationGuide.passo1_conexao}
            color="from-blue-500 to-blue-600"
          />
          <GuideStep
            number={2}
            title="Diagnóstico Aprofundado"
            content={result.conversationGuide.passo2_diagnostico}
            color="from-purple-500 to-purple-600"
          />
          <GuideStep
            number={3}
            title="Apresentação da Solução"
            content={result.conversationGuide.passo3_solucao}
            color="from-rose-500 to-pink-600"
          />
          <GuideStep
            number={4}
            title="Fechamento Consultivo"
            content={result.conversationGuide.passo4_fechamento}
            color="from-green-500 to-emerald-600"
          />
        </div>
      </div>
    </div>
  );
}

function SPINCard({
  title,
  content,
  color,
  icon,
}: {
  title: string;
  content: string;
  color: string;
  icon: string;
}) {
  const colors = {
    blue: 'from-blue-50 to-blue-100 border-blue-300 text-blue-900',
    orange: 'from-orange-50 to-orange-100 border-orange-300 text-orange-900',
    red: 'from-red-50 to-red-100 border-red-300 text-red-900',
    green: 'from-green-50 to-green-100 border-green-300 text-green-900',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border-2 rounded-xl p-6`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{icon}</span>
        <h4 className="font-bold text-lg">{title}</h4>
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  );
}

function StrategyCard({ title, content }: { title: string; content: string }) {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6">
      <h4 className="font-bold text-lg text-amber-900 mb-3">{title}</h4>
      <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">
        {content}
      </p>
    </div>
  );
}

function GuideStep({
  number,
  title,
  content,
  color,
}: {
  number: number;
  title: string;
  content: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-purple-200">
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`w-12 h-12 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-lg`}
        >
          {number}
        </div>
        <h4 className="font-bold text-xl text-neutral-900">{title}</h4>
      </div>
      <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap pl-16">
        {content}
      </p>
    </div>
  );
}
