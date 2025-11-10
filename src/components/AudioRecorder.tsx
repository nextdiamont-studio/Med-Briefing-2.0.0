import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Pause, Play, Upload, Loader2 } from 'lucide-react'
import { uploadRecording } from '../lib/storage-service'
import { useAuth } from '../hooks/useAuth'

interface AudioRecorderProps {
  onRecordingComplete: (audioUrl: string, duration: number, fileSize: number) => void
  onCancel: () => void
}

export default function AudioRecorder({ onRecordingComplete, onCancel }: AudioRecorderProps) {
  const { user } = useAuth()
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [estimatedSize, setEstimatedSize] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedTimeRef = useRef<number>(0)

  const MAX_DURATION = 5 * 60 * 60 // 5 horas em segundos
  const MIN_DURATION = 2.5 * 60 * 60 // 2h30 em segundos

  // Estima tamanho do arquivo em tempo real (MP3 ~64kbps = ~8KB/s)
  useEffect(() => {
    if (isRecording && !isPaused) {
      const interval = setInterval(() => {
        const estimatedBytes = recordingTime * 8000 // ~8KB por segundo
        setEstimatedSize(estimatedBytes)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isRecording, isPaused, recordingTime])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1, // Mono para reduzir tamanho
          sampleRate: 44100,
          echoCancellation: true,
          noiseSuppression: true,
        },
      })

      // Usar MP3 se suportado, senão WebM
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 64000, // 64kbps para boa qualidade com tamanho otimizado
      })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start(1000) // Coletar dados a cada 1 segundo
      setIsRecording(true)
      startTimeRef.current = Date.now()
      startTimer()
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error)
      alert('Erro ao acessar microfone. Verifique as permissões do navegador.')
    }
  }

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000)
      setRecordingTime(elapsed)

      // Parar automaticamente após 5 horas
      if (elapsed >= MAX_DURATION) {
        stopRecording()
      }
    }, 1000)
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      pausedTimeRef.current = Date.now()
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      pausedTimeRef.current = Date.now() - pausedTimeRef.current
      startTimer()
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const uploadAudio = async () => {
    if (!audioBlob || !user) {
      alert('Erro: áudio ou usuário não identificado')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      console.log('[AudioRecorder] Starting upload...')

      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      // Upload usando storage-service centralizado
      const { audioUrl, fileSize } = await uploadRecording(
        user.id,
        `gravacao-${Date.now()}`,
        audioBlob
      )

      clearInterval(progressInterval)
      setUploadProgress(100)

      console.log('[AudioRecorder] Upload successful:', audioUrl)

      // Retornar URL e metadados
      onRecordingComplete(audioUrl, recordingTime, fileSize)
    } catch (error: any) {
      console.error('[AudioRecorder] Upload error:', error)
      alert(`Erro ao fazer upload: ${error.message}`)
      setIsUploading(false)
    }
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Gravar Consulta</h2>

        {/* Status Visual */}
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-8 mb-6">
          <div className="flex items-center justify-center mb-4">
            {isRecording && !isPaused && (
              <div className="relative">
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                <div className="relative bg-red-500 rounded-full w-20 h-20 flex items-center justify-center">
                  <Mic className="w-10 h-10 text-white" />
                </div>
              </div>
            )}
            {isPaused && (
              <div className="bg-yellow-500 rounded-full w-20 h-20 flex items-center justify-center">
                <Pause className="w-10 h-10 text-white" />
              </div>
            )}
            {!isRecording && audioBlob && (
              <div className="bg-green-500 rounded-full w-20 h-20 flex items-center justify-center">
                <Square className="w-10 h-10 text-white" />
              </div>
            )}
            {!isRecording && !audioBlob && (
              <div className="bg-neutral-400 rounded-full w-20 h-20 flex items-center justify-center">
                <Mic className="w-10 h-10 text-white" />
              </div>
            )}
          </div>

          <div className="text-center">
            <div className="text-5xl font-mono font-bold text-neutral-900 mb-2">
              {formatTime(recordingTime)}
            </div>
            <div className="text-sm text-neutral-600">
              {isRecording && !isPaused && 'Gravando...'}
              {isPaused && 'Pausado'}
              {!isRecording && audioBlob && 'Gravação Concluída'}
              {!isRecording && !audioBlob && 'Pronto para gravar'}
            </div>
          </div>
        </div>

        {/* Informações */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-xs text-neutral-600 mb-1">Tamanho Estimado</p>
            <p className="text-lg font-semibold text-neutral-900">
              {formatFileSize(audioBlob?.size || estimatedSize)}
            </p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-xs text-neutral-600 mb-1">Duração Máxima</p>
            <p className="text-lg font-semibold text-neutral-900">{formatTime(MAX_DURATION)}</p>
          </div>
        </div>

        {/* Barra de Progresso de Upload */}
        {isUploading && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-neutral-700">Fazendo upload...</p>
              <p className="text-sm font-medium text-neutral-700">{uploadProgress}%</p>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Controles */}
        <div className="flex gap-3">
          {!isRecording && !audioBlob && (
            <>
              <button
                onClick={startRecording}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
              >
                <Mic className="w-5 h-5" />
                Iniciar Gravação
              </button>
              <button
                onClick={onCancel}
                className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Cancelar
              </button>
            </>
          )}

          {isRecording && !isPaused && (
            <>
              <button
                onClick={pauseRecording}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors font-medium"
              >
                <Pause className="w-5 h-5" />
                Pausar
              </button>
              <button
                onClick={stopRecording}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                <Square className="w-5 h-5" />
                Parar
              </button>
            </>
          )}

          {isPaused && (
            <>
              <button
                onClick={resumeRecording}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                <Play className="w-5 h-5" />
                Continuar
              </button>
              <button
                onClick={stopRecording}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                <Square className="w-5 h-5" />
                Finalizar
              </button>
            </>
          )}

          {!isRecording && audioBlob && (
            <>
              <button
                onClick={uploadAudio}
                disabled={isUploading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Enviar Gravação
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setAudioBlob(null)
                  setAudioUrl(null)
                  setRecordingTime(0)
                  setEstimatedSize(0)
                }}
                disabled={isUploading}
                className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
              >
                Regravar
              </button>
            </>
          )}
        </div>

        {/* Preview do áudio */}
        {audioUrl && (
          <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
            <p className="text-sm font-medium text-neutral-700 mb-2">Preview do Áudio</p>
            <audio src={audioUrl} controls className="w-full" />
          </div>
        )}

        {/* Avisos */}
        <div className="mt-6 space-y-2 text-xs text-neutral-600">
          <p>✓ Duração mínima recomendada: {formatTime(MIN_DURATION)}</p>
          <p>✓ Duração máxima: {formatTime(MAX_DURATION)}</p>
          <p>✓ Formato otimizado: WebM (equivalente a MP3 em qualidade)</p>
          <p>✓ Tamanho máximo: 500MB</p>
        </div>
      </div>
    </div>
  )
}
