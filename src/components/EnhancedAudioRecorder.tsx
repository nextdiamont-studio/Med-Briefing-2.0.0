import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Pause, Play, Upload, Loader2, User, Search, Volume2, VolumeX } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { uploadConsultationRecording } from '../lib/storage-service'
import { useAuth } from '../hooks/useAuth'
import type { Patient } from '../lib/types'

interface EnhancedAudioRecorderProps {
  onRecordingComplete: (audioUrl: string, duration: number, fileSize: number, patientId: string, patientName: string) => void
  onCancel: () => void
}

export default function EnhancedAudioRecorder({ onRecordingComplete, onCancel }: EnhancedAudioRecorderProps) {
  const { user } = useAuth()
  
  // Estado de pacientes
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showPatientSelector, setShowPatientSelector] = useState(true)
  
  // Estado de gravação
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [estimatedSize, setEstimatedSize] = useState(0)
  
  // Preview em tempo real
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false)
  const [previewVolume, setPreviewVolume] = useState(1)
  const [previewMuted, setPreviewMuted] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedTimeRef = useRef<number>(0)
  const streamRef = useRef<MediaStream | null>(null)

  const MAX_DURATION = 5 * 60 * 60 // 5 horas
  const MIN_DURATION = 2.5 * 60 * 60 // 2h30

  // Carregar pacientes
  useEffect(() => {
    loadPatients()
  }, [user])

  const loadPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user?.id)
        .order('name')

      if (error) throw error
      setPatients(data || [])
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error)
    }
  }

  // Filtrar pacientes
  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Estimar tamanho
  useEffect(() => {
    if (isRecording && !isPaused) {
      const interval = setInterval(() => {
        const estimatedBytes = recordingTime * 8000
        setEstimatedSize(estimatedBytes)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isRecording, isPaused, recordingTime])

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setShowPatientSelector(false)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 44100,
          echoCancellation: true,
          noiseSuppression: true,
        },
      })

      streamRef.current = stream

      // Configurar preview em tempo real
      if (audioElementRef.current) {
        audioElementRef.current.srcObject = stream
        audioElementRef.current.volume = previewVolume
        audioElementRef.current.muted = previewMuted
      }

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 64000,
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
        
        // Parar preview
        if (audioElementRef.current) {
          audioElementRef.current.srcObject = null
        }
        
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start(1000)
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

      if (elapsed >= MAX_DURATION) {
        stopRecording()
      }
    }, 1000)
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      pausedTimeRef.current += Date.now() - startTimeRef.current
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      startTimeRef.current = Date.now()
      startTimer()
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const togglePreview = () => {
    if (audioElementRef.current) {
      if (isPreviewPlaying) {
        audioElementRef.current.pause()
      } else {
        audioElementRef.current.play()
      }
      setIsPreviewPlaying(!isPreviewPlaying)
    }
  }

  const handlePreviewVolumeChange = (value: number) => {
    setPreviewVolume(value)
    if (audioElementRef.current) {
      audioElementRef.current.volume = value
    }
  }

  const togglePreviewMute = () => {
    setPreviewMuted(!previewMuted)
    if (audioElementRef.current) {
      audioElementRef.current.muted = !previewMuted
    }
  }

  const handleUpload = async () => {
    if (!audioBlob || !selectedPatient || !user) {
      alert('Erro: áudio, paciente ou usuário não identificado')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      console.log('[EnhancedAudioRecorder] Starting upload for patient:', selectedPatient.name)

      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      // Upload usando storage-service centralizado
      const { audioUrl, filePath, fileSize } = await uploadConsultationRecording(
        user.id,
        selectedPatient.name,
        audioBlob
      )

      clearInterval(progressInterval)
      setUploadProgress(100)

      console.log('[EnhancedAudioRecorder] Upload successful:', {
        audioUrl,
        filePath,
        fileSize,
      })

      // Notificar componente pai
      onRecordingComplete(
        audioUrl,
        recordingTime,
        fileSize,
        selectedPatient.id,
        selectedPatient.name
      )
    } catch (error: any) {
      console.error('[EnhancedAudioRecorder] Upload error:', error)
      alert(`Erro ao fazer upload: ${error.message}`)
      setIsUploading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Seletor de Paciente
  if (showPatientSelector) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Selecionar Paciente</h2>
            <p className="text-neutral-600">Escolha o paciente para esta gravação</p>
          </div>

          {/* Busca */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              autoFocus
            />
          </div>

          {/* Lista de Pacientes */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredPatients.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-600">Nenhum paciente encontrado</p>
              </div>
            ) : (
              filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient)}
                  className="w-full flex items-center gap-4 p-4 border-2 border-neutral-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {patient.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-900">{patient.name}</p>
                    {patient.email && (
                      <p className="text-sm text-neutral-500">{patient.email}</p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Ações */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 border-2 border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Interface de Gravação
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8">
        {/* Header com Paciente */}
        <div className="mb-6 flex items-center gap-4 pb-6 border-b border-neutral-200">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {selectedPatient?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Gravação de Consulta</h2>
            <p className="text-neutral-600">Paciente: <span className="font-semibold">{selectedPatient?.name}</span></p>
          </div>
        </div>

        {/* Preview de áudio oculto */}
        <audio ref={audioElementRef} className="hidden" />

        {/* Área de Gravação */}
        {!audioBlob ? (
          <div className="space-y-6">
            {/* Timer e Status */}
            <div className="text-center">
              <div className="text-6xl font-mono font-bold text-neutral-900 mb-2">
                {formatTime(recordingTime)}
              </div>
              <div className="flex items-center justify-center gap-2">
                {isRecording && !isPaused && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-error-50 text-error-600 rounded-full">
                    <div className="w-3 h-3 bg-error-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Gravando</span>
                  </div>
                )}
                {isPaused && (
                  <div className="px-4 py-2 bg-warning-50 text-warning-600 rounded-full text-sm font-medium">
                    Pausado
                  </div>
                )}
              </div>
            </div>

            {/* Estimativa de Tamanho */}
            {isRecording && (
              <div className="text-center">
                <p className="text-sm text-neutral-600">
                  Tamanho estimado: <span className="font-semibold">{formatSize(estimatedSize)}</span>
                </p>
              </div>
            )}

            {/* Preview Controls (durante gravação) */}
            {isRecording && (
              <div className="bg-neutral-50 rounded-xl p-4">
                <p className="text-sm font-medium text-neutral-700 mb-3">Preview em Tempo Real</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={togglePreview}
                    className="p-2 bg-primary-100 text-primary-600 hover:bg-primary-200 rounded-lg transition-colors"
                  >
                    {isPreviewPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  
                  <div className="flex-1 flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-neutral-500" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={previewVolume}
                      onChange={(e) => handlePreviewVolumeChange(parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <button
                      onClick={togglePreviewMute}
                      className="p-2 hover:bg-neutral-200 rounded-lg transition-colors"
                    >
                      {previewMuted ? <VolumeX className="w-5 h-5 text-neutral-500" /> : <Volume2 className="w-5 h-5 text-neutral-500" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Controles de Gravação */}
            <div className="flex justify-center gap-4">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="flex items-center gap-3 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors shadow-lg shadow-primary-600/30 font-medium text-lg"
                >
                  <Mic className="w-6 h-6" />
                  Iniciar Gravação
                </button>
              ) : (
                <>
                  {!isPaused ? (
                    <button
                      onClick={pauseRecording}
                      className="flex items-center gap-2 px-6 py-3 bg-warning-500 hover:bg-warning-600 text-white rounded-xl transition-colors font-medium"
                    >
                      <Pause className="w-5 h-5" />
                      Pausar
                    </button>
                  ) : (
                    <button
                      onClick={resumeRecording}
                      className="flex items-center gap-2 px-6 py-3 bg-success-500 hover:bg-success-600 text-white rounded-xl transition-colors font-medium"
                    >
                      <Play className="w-5 h-5" />
                      Retomar
                    </button>
                  )}
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-6 py-3 bg-error-500 hover:bg-error-600 text-white rounded-xl transition-colors font-medium"
                  >
                    <Square className="w-5 h-5" />
                    Parar
                  </button>
                </>
              )}
            </div>

            {/* Botão Cancelar */}
            {!isRecording && (
              <div className="flex justify-center">
                <button
                  onClick={onCancel}
                  className="px-6 py-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        ) : (
          // Preview Pós-Gravação
          <div className="space-y-6">
            <div className="bg-success-50 border border-success-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-success-700 mb-2">
                <div className="w-2 h-2 bg-success-500 rounded-full" />
                <span className="font-semibold">Gravação Concluída</span>
              </div>
              <p className="text-sm text-success-600">
                Duração: {formatTime(recordingTime)} • Tamanho: {formatSize(audioBlob.size)}
              </p>
            </div>

            {/* Nome do Arquivo */}
            <div className="bg-neutral-50 rounded-xl p-4">
              <p className="text-sm font-medium text-neutral-700 mb-2">Nome do Arquivo:</p>
              <p className="text-sm text-neutral-900 font-mono bg-white px-3 py-2 rounded border border-neutral-200">
                {selectedPatient ? `consulta_${selectedPatient.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.webm` : 'Selecione um paciente'}
              </p>
            </div>

            {/* Player de Preview */}
            {audioUrl && (
              <div>
                <audio src={audioUrl} controls className="w-full" />
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div>
                <div className="flex justify-between text-sm text-neutral-600 mb-2">
                  <span>Fazendo upload...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setAudioBlob(null)
                  setAudioUrl(null)
                  setRecordingTime(0)
                }}
                className="flex-1 px-6 py-3 border-2 border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors font-medium"
                disabled={isUploading}
              >
                Regravar
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors font-medium shadow-lg shadow-primary-600/30 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Salvar Gravação
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
