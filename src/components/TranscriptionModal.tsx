import { useState, useEffect } from 'react';
import { X, Download, FileText, Loader2, BarChart3, Copy, CheckCircle2 } from 'lucide-react';
import type { Recording } from '../lib/types';
import { downloadTranscription } from '../lib/transcription-service';

interface TranscriptionModalProps {
  recording: Recording;
  onClose: () => void;
  onAnalyze?: (transcriptionText: string) => void;
}

export function TranscriptionModal({ recording, onClose, onAnalyze }: TranscriptionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState(recording.transcription_text || '');
  const [copied, setCopied] = useState(false);

  // Carregar transcrição se não estiver em memória
  const loadTranscription = async () => {
    if (transcriptionText || !recording.transcription_url) return;

    setIsLoading(true);
    try {
      const text = await downloadTranscription(recording.audio_file_path.replace('.webm', '.txt'));
      setTranscriptionText(text);
    } catch (error) {
      console.error('Erro ao carregar transcrição:', error);
      alert('Erro ao carregar transcrição');
    } finally {
      setIsLoading(false);
    }
  };

  // Baixar transcrição como arquivo .txt
  const handleDownload = () => {
    if (!transcriptionText) return;

    const blob = new Blob([transcriptionText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${recording.name.replace(/[^a-z0-9]/gi, '-')}-transcricao.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copiar transcrição para clipboard
  const handleCopy = async () => {
    if (!transcriptionText) return;

    try {
      await navigator.clipboard.writeText(transcriptionText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
      alert('Erro ao copiar transcrição');
    }
  };

  // Iniciar análise direta
  const handleAnalyze = () => {
    if (transcriptionText && onAnalyze) {
      onAnalyze(transcriptionText);
    }
  };

  // Carregar ao abrir (useEffect correto)
  useEffect(() => {
    loadTranscription();
  }, []);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const wordCount = transcriptionText.split(/\s+/).filter(Boolean).length;
  const charCount = transcriptionText.length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-neutral-200">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                  Transcrição
                </h2>
                <p className="text-sm text-neutral-600">{recording.name}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-neutral-600 mt-3">
              <div className="flex items-center gap-1">
                <span className="font-medium">Duração:</span>
                <span>{formatDuration(recording.duration_seconds)}</span>
              </div>
              {transcriptionText && (
                <>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Palavras:</span>
                    <span>{wordCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Caracteres:</span>
                    <span>{charCount.toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
              <p className="text-neutral-600">Carregando transcrição...</p>
            </div>
          ) : transcriptionText ? (
            <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
              <pre className="whitespace-pre-wrap font-sans text-sm text-neutral-800 leading-relaxed">
                {transcriptionText}
              </pre>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <FileText className="w-16 h-16 text-neutral-300 mb-4" />
              <p className="text-neutral-600">Nenhuma transcrição disponível</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-neutral-200 p-6">
          <div className="flex flex-wrap gap-3">
            {/* Fechar */}
            <button
              onClick={onClose}
              className="px-4 py-2.5 border-2 border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
            >
              Fechar
            </button>

            {/* Copiar */}
            {transcriptionText && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors font-medium"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copiar
                  </>
                )}
              </button>
            )}

            {/* Download */}
            {transcriptionText && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-600/30"
              >
                <Download className="w-5 h-5" />
                Baixar TXT
              </button>
            )}

            {/* Análise Direta */}
            {transcriptionText && onAnalyze && (
              <button
                onClick={handleAnalyze}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg transition-all font-medium shadow-lg shadow-primary-600/30"
              >
                <BarChart3 className="w-5 h-5" />
                Fazer Análise Agora
              </button>
            )}
          </div>

          {/* Informação sobre análise */}
          {transcriptionText && onAnalyze && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Dica:</strong> Use "Fazer Análise Agora" para criar um briefing ou diagnóstico diretamente desta transcrição!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
