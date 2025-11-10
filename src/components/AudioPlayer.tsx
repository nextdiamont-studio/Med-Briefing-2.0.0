import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, X, Loader2, SkipForward, SkipBack } from 'lucide-react'
import WaveSurfer from 'wavesurfer.js'

interface AudioPlayerProps {
  audioUrl: string
  consultationDate: string
  duration?: number
  onClose: () => void
}

export default function AudioPlayer({
  audioUrl,
  consultationDate,
  duration,
  onClose,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(duration || 0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const waveformRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)

  useEffect(() => {
    if (!waveformRef.current) return

    try {
      // Inicializar WaveSurfer com configurações profissionais
      const wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#e5e7eb', // Neutral-200
        progressColor: '#0891b2', // Primary-600 medicina estética
        cursorColor: '#0891b2',
        barWidth: 2,
        barRadius: 3,
        cursorWidth: 2,
        height: 120,
        barGap: 1,
        normalize: true,
      })

      wavesurferRef.current = wavesurfer

      // Eventos do WaveSurfer
      wavesurfer.on('ready', () => {
        setTotalDuration(wavesurfer.getDuration())
        setIsLoading(false)
      })

      wavesurfer.on('audioprocess', () => {
        setCurrentTime(wavesurfer.getCurrentTime())
      })

      wavesurfer.on('interaction', () => {
        setCurrentTime(wavesurfer.getCurrentTime())
      })

      wavesurfer.on('play', () => {
        setIsPlaying(true)
      })

      wavesurfer.on('pause', () => {
        setIsPlaying(false)
      })

      wavesurfer.on('finish', () => {
        setIsPlaying(false)
        setCurrentTime(0)
        wavesurfer.seekTo(0)
      })

      wavesurfer.on('error', (err) => {
        console.error('WaveSurfer error:', err)
        setError('Erro ao carregar áudio. Verifique se o arquivo existe.')
        setIsLoading(false)
      })

      wavesurfer.on('loading', (percent) => {
        if (percent < 100) {
          setIsLoading(true)
        }
      })

      // Carregar áudio
      wavesurfer.load(audioUrl)

      // Cleanup
      return () => {
        wavesurfer.destroy()
      }
    } catch (err) {
      console.error('Erro ao inicializar WaveSurfer:', err)
      setError('Erro ao inicializar player de áudio.')
      setIsLoading(false)
    }
  }, [audioUrl])

  const togglePlay = () => {
    if (!wavesurferRef.current) return
    wavesurferRef.current.playPause()
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!wavesurferRef.current) return

    const newVolume = parseFloat(e.target.value)
    wavesurferRef.current.setVolume(newVolume)
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    if (!wavesurferRef.current) return

    if (isMuted) {
      wavesurferRef.current.setVolume(volume)
      setIsMuted(false)
    } else {
      wavesurferRef.current.setVolume(0)
      setIsMuted(true)
    }
  }

  const skip = (seconds: number) => {
    if (!wavesurferRef.current) return

    const duration = wavesurferRef.current.getDuration()
    const currentTime = wavesurferRef.current.getCurrentTime()
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds))
    
    wavesurferRef.current.seekTo(newTime / duration)
  }

  const changePlaybackRate = () => {
    if (!wavesurferRef.current) return

    const rates = [1, 1.25, 1.5, 1.75, 2]
    const currentIndex = rates.indexOf(playbackRate)
    const nextRate = rates[(currentIndex + 1) % rates.length]
    
    wavesurferRef.current.setPlaybackRate(nextRate)
    setPlaybackRate(nextRate)
  }

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '00:00:00'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleClose = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.stop()
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Reprodução de Áudio</h2>
            <p className="text-sm text-neutral-600 mt-1">
              Consulta: {new Date(consultationDate).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !error && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-primary-600 mb-4" />
            <p className="text-neutral-600">Carregando waveform do áudio...</p>
            <p className="text-xs text-neutral-500 mt-2">
              Pode levar alguns segundos para áudios longos
            </p>
          </div>
        )}

        {/* Player Controls */}
        {!isLoading && !error && (
          <div className="space-y-6">
            {/* Waveform Visualization */}
            <div className="bg-gradient-to-b from-neutral-50 to-white rounded-xl p-4 border border-neutral-200">
              <div ref={waveformRef} className="w-full" />
              <p className="text-xs text-neutral-500 text-center mt-3">
                💡 Clique na forma de onda para navegar rapidamente • Zonas escuras = fala intensa • Zonas claras = silêncio/pausas
              </p>
            </div>

            {/* Time Display */}
            <div className="flex items-center justify-between px-2">
              <div className="text-center">
                <p className="text-xs text-neutral-500 mb-1">Tempo Atual</p>
                <p className="text-2xl font-mono font-bold text-primary-600">
                  {formatTime(currentTime)}
                </p>
              </div>
              <div className="text-center px-4">
                <div className="w-px h-12 bg-neutral-200 mx-auto" />
              </div>
              <div className="text-center">
                <p className="text-xs text-neutral-500 mb-1">Duração Total</p>
                <p className="text-2xl font-mono font-bold text-neutral-700">
                  {formatTime(totalDuration)}
                </p>
              </div>
            </div>

            {/* Main Controls */}
            <div className="flex items-center justify-center gap-4 pt-2">
              {/* Skip Back 15s */}
              <button
                onClick={() => skip(-15)}
                className="p-3 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors"
                title="Retroceder 15s"
              >
                <SkipBack className="w-6 h-6" />
              </button>

              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="p-5 bg-primary-600 hover:bg-primary-700 text-white rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {isPlaying ? (
                  <Pause className="w-10 h-10" />
                ) : (
                  <Play className="w-10 h-10 ml-1" />
                )}
              </button>

              {/* Skip Forward 15s */}
              <button
                onClick={() => skip(15)}
                className="p-3 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors"
                title="Avançar 15s"
              >
                <SkipForward className="w-6 h-6" />
              </button>
            </div>

            {/* Secondary Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
              {/* Volume Control */}
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleMute}
                  className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-32 h-2 bg-neutral-200 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${(isMuted ? 0 : volume) * 100}%, #e5e7eb ${(isMuted ? 0 : volume) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <span className="text-xs font-medium text-neutral-600 w-10">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>

              {/* Playback Speed */}
              <button
                onClick={changePlaybackRate}
                className="px-4 py-2 text-sm font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors border border-neutral-300"
                title="Ajustar velocidade de reprodução"
              >
                Velocidade: {playbackRate}x
              </button>
            </div>

            {/* Info */}
            <div className="text-xs text-neutral-500 text-center pt-2 space-y-1">
              <p>Formato: WebM • Qualidade: 64kbps • Player profissional com waveform</p>
              <p className="text-primary-600 font-medium">
                ⚡ Use a visualização de onda para identificar momentos importantes da consulta
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
