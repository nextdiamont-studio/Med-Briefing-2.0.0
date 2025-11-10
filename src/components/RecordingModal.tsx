import { useState } from 'react';
import { X, Mic, Square, Loader2, Pause, Play } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { uploadRecording } from '../lib/storage-service';

interface RecordingModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function RecordingModal({ onClose, onSuccess }: RecordingModalProps) {
  const { user } = useAuth();
  const [recordingName, setRecordingName] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [durationInterval, setDurationInterval] = useState<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    if (!recordingName.trim()) {
      setError('Digite um nome para a gravação');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await handleRecordingComplete(audioBlob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      setIsRecording(true);
      setError('');

      // Start duration counter
      const interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      setDurationInterval(interval);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Erro ao acessar microfone. Verifique as permissões.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
      setIsPaused(true);

      if (durationInterval) {
        clearInterval(durationInterval);
        setDurationInterval(null);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
      setIsPaused(false);

      // Retomar contador de duração
      const interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      setDurationInterval(interval);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      setIsPaused(false);

      if (durationInterval) {
        clearInterval(durationInterval);
        setDurationInterval(null);
      }
    }
  };

  const handleRecordingComplete = async (audioBlob: Blob) => {
    if (!user) return;

    setIsProcessing(true);
    setError('');

    try {
      console.log('[RecordingModal] Uploading audio...');

      // 1. Upload áudio para Storage
      const { audioUrl, filePath, fileSize } = await uploadRecording(
        user.id,
        recordingName,
        audioBlob
      );

      console.log('[RecordingModal] Audio uploaded:', audioUrl);

      // 2. Criar registro no banco com status 'saved' (salvo, aguardando transcrição manual)
      const { error: dbError } = await supabase.from('recordings').insert({
        user_id: user.id,
        name: recordingName,
        audio_url: audioUrl,
        audio_file_path: filePath,
        duration_seconds: recordingDuration,
        file_size_bytes: fileSize,
        status: 'saved', // Salvo, aguardando transcrição manual
      });

      if (dbError) throw dbError;

      console.log('[RecordingModal] Recording saved to database');

      // 3. Notificar sucesso
      onSuccess();
    } catch (err) {
      console.error('[RecordingModal] Error:', err);
      setError(
        err instanceof Error ? err.message : 'Erro ao salvar gravação'
      );
      setIsProcessing(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">
              Nova Gravação
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              Grave uma consulta para transcrição automática
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isRecording || isProcessing}
            className="text-neutral-400 hover:text-neutral-600 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
              {error}
            </div>
          )}

          {/* Name Input */}
          {!isRecording && !isProcessing && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Nome da Gravação <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={recordingName}
                onChange={(e) => setRecordingName(e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ex: Consulta Dr. João - 08/11/2025"
                autoFocus
              />
              <p className="text-xs text-neutral-500 mt-1">
                Digite um nome descritivo para identificar esta gravação
              </p>
            </div>
          )}

          {/* Recording Status */}
          {isRecording && (
            <div className={`p-6 bg-gradient-to-br ${
              isPaused
                ? 'from-yellow-50 to-yellow-100 border-2 border-yellow-300'
                : 'from-red-50 to-red-100 border-2 border-red-300'
            } rounded-xl`}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className={`w-4 h-4 ${
                  isPaused ? 'bg-yellow-600' : 'bg-red-600 animate-pulse'
                } rounded-full`}></div>
                <span className={`text-lg font-semibold ${
                  isPaused ? 'text-yellow-900' : 'text-red-900'
                }`}>
                  {isPaused ? 'PAUSADO' : 'GRAVANDO'}
                </span>
              </div>
              <div className="text-center">
                <p className={`text-3xl font-bold ${
                  isPaused ? 'text-yellow-900' : 'text-red-900'
                } mb-2`}>
                  {formatDuration(recordingDuration)}
                </p>
                <p className={`text-sm ${
                  isPaused ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  {recordingName}
                </p>
              </div>
            </div>
          )}

          {/* Processing Status */}
          {isProcessing && (
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Salvando gravação...
              </h3>
              <p className="text-sm text-blue-700">
                Fazendo upload do áudio para o servidor
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-neutral-200">
            {!isRecording && !isProcessing && (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border-2 border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={startRecording}
                  disabled={!recordingName.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-red-600/30"
                >
                  <Mic className="w-5 h-5" />
                  Iniciar Gravação
                </button>
              </>
            )}

            {isRecording && (
              <>
                {/* Botão Pausar/Retomar */}
                {!isPaused ? (
                  <button
                    onClick={pauseRecording}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-yellow-600/30"
                  >
                    <Pause className="w-5 h-5" />
                    Pausar
                  </button>
                ) : (
                  <button
                    onClick={resumeRecording}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-green-600/30"
                  >
                    <Play className="w-5 h-5" />
                    Retomar
                  </button>
                )}

                {/* Botão Parar */}
                <button
                  onClick={stopRecording}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-900 text-white rounded-lg transition-colors font-medium shadow-lg"
                >
                  <Square className="w-5 h-5" />
                  Parar
                </button>
              </>
            )}
          </div>

          {/* Instructions */}
          {!isRecording && !isProcessing && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Dica:</strong> Durante a gravação, você pode pausar e retomar quando quiser.
                Após parar, o áudio será salvo com segurança. Depois você pode transcrever
                clicando em "Transcrever com IA" na página de gravações.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
