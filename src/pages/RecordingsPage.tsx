import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import {
  Mic,
  Plus,
  Play,
  Download,
  FileText,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  Trash2
} from 'lucide-react';
import type { Recording } from '../lib/types';
import { getTranscriptionDownloadUrl, deleteRecording } from '../lib/storage-service';
import { RecordingModal } from '../components/RecordingModal';
import { TranscriptionModal } from '../components/TranscriptionModal';
import { transcribeAudio, type TranscriptionProgress } from '../lib/transcription-service';
import { AnalysisUploadModal } from '../components/analysis/AnalysisUploadModal';

export default function RecordingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [filteredRecordings, setFilteredRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [transcribingId, setTranscribingId] = useState<string | null>(null);
  const [transcriptionProgress, setTranscriptionProgress] = useState<TranscriptionProgress | null>(null);
  const [viewingTranscription, setViewingTranscription] = useState<Recording | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Recording | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisTranscription, setAnalysisTranscription] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadRecordings();
    }
  }, [user]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = recordings.filter((r) =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.transcription_text?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRecordings(filtered);
    } else {
      setFilteredRecordings(recordings);
    }
  }, [searchTerm, recordings]);

  const loadRecordings = async () => {
    try {
      const { data, error } = await supabase
        .from('recordings')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecordings(data || []);
      setFilteredRecordings(data || []);
    } catch (error) {
      console.error('Erro ao carregar gravações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTranscription = (recording: Recording) => {
    if (!recording.transcription_url) return;

    const url = getTranscriptionDownloadUrl(recording.transcription_url);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${recording.name}-transcricao.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '--';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const handleTranscribe = async (recordingId: string) => {
    setTranscribingId(recordingId);
    setTranscriptionProgress(null);

    try {
      // Atualizar status para processing
      await supabase
        .from('recordings')
        .update({ status: 'processing' })
        .eq('id', recordingId);

      // Iniciar transcrição com callback de progresso
      await transcribeAudio(recordingId, (progress) => {
        setTranscriptionProgress(progress);
      });

      // Recarregar gravações para mostrar novo status
      await loadRecordings();

      alert('✅ Transcrição concluída com sucesso!');
    } catch (error: any) {
      console.error('Erro ao transcrever:', error);
      alert(`❌ Erro ao transcrever: ${error.message}`);
      await loadRecordings(); // Recarregar para mostrar status de erro
    } finally {
      setTranscribingId(null);
      setTranscriptionProgress(null);
    }
  };

  const handleDelete = async (recording: Recording) => {
    setDeletingId(recording.id);

    try {
      console.log('[RecordingsPage] Deleting recording:', recording.id);

      // 1. Deletar arquivos do Storage
      await deleteRecording(
        recording.audio_file_path,
        recording.transcription_url ? recording.audio_file_path.replace('.webm', '.txt') : undefined
      );

      console.log('[RecordingsPage] Files deleted from storage');

      // 2. Deletar registro do banco
      const { error: dbError } = await supabase
        .from('recordings')
        .delete()
        .eq('id', recording.id);

      if (dbError) throw dbError;

      console.log('[RecordingsPage] Recording deleted from database');

      // 3. Fechar modal de confirmação
      setConfirmDelete(null);

      // 4. Recarregar lista
      await loadRecordings();

      alert('✅ Gravação excluída com sucesso!');
    } catch (error: any) {
      console.error('[RecordingsPage] Error deleting recording:', error);
      alert(`❌ Erro ao excluir gravação: ${error.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: Recording['status']) => {
    switch (status) {
      case 'saved':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" />
            Salvo
          </div>
        );
      case 'processing':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
            <Loader2 className="w-3 h-3 animate-spin" />
            Transcrevendo
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" />
            Transcrito
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Falhou
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Gravações</h1>
          <p className="text-neutral-600 mt-1">
            Gerencie suas gravações e transcrições de consultas
          </p>
        </div>
        <button
          onClick={() => setShowRecordModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all font-medium shadow-lg shadow-primary-600/30"
        >
          <Plus className="w-5 h-5" />
          Nova Gravação
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou texto da transcrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Recordings Grid */}
      {filteredRecordings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
          <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mic className="w-10 h-10 text-neutral-400" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            {searchTerm ? 'Nenhuma gravação encontrada' : 'Nenhuma gravação ainda'}
          </h2>
          <p className="text-neutral-600 mb-6">
            {searchTerm
              ? 'Tente buscar com outros termos'
              : 'Crie sua primeira gravação para começar a transcrever consultas'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowRecordModal(true)}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
            >
              Criar Primeira Gravação
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecordings.map((recording) => (
            <div
              key={recording.id}
              className="bg-white rounded-xl shadow-sm border-2 border-neutral-200 hover:border-primary-400 hover:shadow-lg transition-all overflow-hidden group"
            >
              {/* Card Header */}
              <div className="relative p-6 pb-4 bg-gradient-to-br from-neutral-50 to-white">
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {getStatusBadge(recording.status)}
                </div>

                {/* Delete Button - Below Status Badge */}
                <button
                  onClick={() => setConfirmDelete(recording)}
                  className="absolute top-14 right-4 p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all opacity-0 group-hover:opacity-100 shadow-sm hover:shadow-md"
                  title="Excluir gravação"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Mic className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 pt-4">
                {/* Name */}
                <h3 className="text-lg font-bold text-neutral-900 mb-3 truncate">
                  {recording.name}
                </h3>

                {/* Info */}
                <div className="space-y-2 text-sm text-neutral-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-neutral-400" />
                    <span>
                      Duração: {formatDuration(recording.duration_seconds)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-neutral-400" />
                    <span>
                      Tamanho: {formatFileSize(recording.file_size_bytes)}
                    </span>
                  </div>

                  <div className="text-xs text-neutral-500">
                    {new Date(recording.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                {/* Error Message */}
                {recording.status === 'failed' && recording.error_message && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-600">{recording.error_message}</p>
                  </div>
                )}

                {/* Transcription Preview */}
                {recording.transcription_text && (
                  <div className="mb-4 p-3 bg-neutral-50 rounded-lg">
                    <p className="text-xs text-neutral-700 line-clamp-3">
                      {recording.transcription_text}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-neutral-100 flex flex-col gap-2">
                  <div className="flex gap-2">
                    {/* Play Audio */}
                    <button
                      onClick={() => setPlayingAudio(recording.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-lg text-sm font-medium transition-colors"
                      title="Ouvir gravação"
                    >
                      <Play className="w-4 h-4" />
                      Ouvir
                    </button>

                    {/* View Transcription - Only show when completed */}
                    {recording.status === 'completed' && recording.transcription_text && (
                      <button
                        onClick={() => setViewingTranscription(recording)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors"
                        title="Acessar transcrição"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </button>
                    )}
                  </div>

                  {/* Transcribe Button - Only show for saved recordings */}
                  {recording.status === 'saved' && (
                    <button
                      onClick={() => handleTranscribe(recording.id)}
                      disabled={transcribingId === recording.id}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shadow-lg shadow-blue-600/30"
                      title="Transcrever áudio com IA"
                    >
                      {transcribingId === recording.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {transcriptionProgress ? transcriptionProgress.message : 'Iniciando...'}
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          Transcrever com IA
                        </>
                      )}
                    </button>
                  )}

                  {/* Access Transcription Button - Show when completed */}
                  {recording.status === 'completed' && recording.transcription_text && (
                    <button
                      onClick={() => setViewingTranscription(recording)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-green-600/30"
                      title="Acessar transcrição completa"
                    >
                      <FileText className="w-4 h-4" />
                      Acessar Transcrição
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recording Modal */}
      {showRecordModal && (
        <RecordingModal
          onClose={() => setShowRecordModal(false)}
          onSuccess={() => {
            setShowRecordModal(false);
            loadRecordings();
          }}
        />
      )}

      {/* Audio Player Modal */}
      {playingAudio && (
        <AudioPlayerModal
          recording={recordings.find((r) => r.id === playingAudio)!}
          onClose={() => setPlayingAudio(null)}
        />
      )}

      {/* Transcription Modal */}
      {viewingTranscription && (
        <TranscriptionModal
          recording={viewingTranscription}
          onClose={() => setViewingTranscription(null)}
          onAnalyze={(transcriptionText) => {
            // Abrir modal de análise com a transcrição
            setAnalysisTranscription(transcriptionText);
            setViewingTranscription(null);
            setShowAnalysisModal(true);
          }}
        />
      )}

      {/* Analysis Modal */}
      <AnalysisUploadModal
        isOpen={showAnalysisModal}
        onClose={() => {
          setShowAnalysisModal(false);
          setAnalysisTranscription('');
        }}
        onSuccess={() => {
          setShowAnalysisModal(false);
          setAnalysisTranscription('');
          // Navegar para página de análises
          navigate('/analises');
        }}
        initialTranscription={analysisTranscription}
      />

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">
                  Excluir Gravação?
                </h2>
                <p className="text-sm text-neutral-600">
                  Esta ação não pode ser desfeita
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="mb-6">
              <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                <p className="font-semibold text-neutral-900 mb-1">
                  {confirmDelete.name}
                </p>
                <div className="text-sm text-neutral-600 space-y-1">
                  <p>Duração: {formatDuration(confirmDelete.duration_seconds)}</p>
                  <p>Criado em: {new Date(confirmDelete.created_at).toLocaleDateString('pt-BR')}</p>
                  {confirmDelete.transcription_text && (
                    <p className="text-amber-600 font-medium mt-2">
                      ⚠️ A transcrição também será excluída
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>⚠️ Atenção:</strong> O áudio, transcrição e todos os dados relacionados serão permanentemente excluídos.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deletingId === confirmDelete.id}
                className="flex-1 px-4 py-2.5 border-2 border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deletingId === confirmDelete.id}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-red-600/30 disabled:opacity-50"
              >
                {deletingId === confirmDelete.id ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Excluir Permanentemente
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Audio Player Modal com melhor UI
function AudioPlayerModal({
  recording,
  onClose
}: {
  recording: Recording;
  onClose: () => void;
}) {
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              {recording.name}
            </h2>
            <div className="flex items-center gap-4 text-sm text-neutral-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Duração: {formatDuration(recording.duration_seconds)}
              </div>
              <div className="text-xs text-neutral-500">
                {new Date(recording.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Audio Player */}
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center shadow-lg">
              <Play className="w-8 h-8 text-white" />
            </div>
          </div>
          <audio
            controls
            className="w-full"
            autoPlay
            style={{
              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
            }}
          >
            <source src={recording.audio_url} type="audio/webm" />
            Seu navegador não suporta o player de áudio.
          </audio>
        </div>

        {/* Transcription Preview */}
        {recording.transcription_text && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-neutral-700 mb-2">
              Transcrição:
            </h3>
            <div className="bg-neutral-50 rounded-lg p-4 max-h-60 overflow-y-auto">
              <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                {recording.transcription_text}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-900 text-white rounded-lg transition-colors font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
