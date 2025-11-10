import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Mic, Plus, Headphones } from 'lucide-react'
import type { Consultation } from '../lib/types'
import EnhancedAudioRecorder from '../components/EnhancedAudioRecorder'
import AudioPlayer from '../components/AudioPlayer'

export default function ConsultationsPage() {
  const { user } = useAuth()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showRecorder, setShowRecorder] = useState(false)
  const [playingConsultation, setPlayingConsultation] = useState<Consultation | null>(null)

  useEffect(() => {
    if (user) {
      loadConsultations()
    }
  }, [user])

  const loadConsultations = async () => {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('user_id', user?.id)
        .order('consultation_date', { ascending: false })

      if (error) throw error
      setConsultations(data || [])
    } catch (error) {
      console.error('Erro ao carregar consultas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecordingComplete = async (
    audioUrl: string, 
    duration: number, 
    fileSize: number, 
    patientId: string, 
    patientName: string
  ) => {
    try {
      // Criar nova consulta com a gravação
      const { error } = await supabase.from('consultations').insert({
        user_id: user?.id as string,
        patient_id: patientId,
        analysis_type: 'diagnostico' as const,
        consultation_date: new Date().toISOString(),
        duration_minutes: Math.floor(duration / 60),
        audio_url: audioUrl,
        audio_file_size: fileSize,
        transcription_status: 'pending' as const,
        ai_processing_status: 'pending' as const,
      } as any)

      if (error) throw error

      alert(`Consulta de ${patientName} gravada com sucesso! A transcrição e análise serão processadas em breve.`)
      setShowRecorder(false)
      loadConsultations()
    } catch (error) {
      console.error('Erro ao salvar consulta:', error)
      alert('Erro ao salvar consulta. Tente novamente.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Consultas</h1>
          <p className="text-neutral-600 mt-1">Gravações e análises de consultas com IA</p>
        </div>
        <button
          onClick={() => setShowRecorder(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Consulta
        </button>
      </div>

      {consultations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
          <Mic className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Nenhuma consulta registrada</h2>
          <p className="text-neutral-600 mb-6">
            Grave sua primeira consulta para análise completa com inteligência artificial
          </p>
          <button
            onClick={() => setShowRecorder(true)}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            Gravar Primeira Consulta
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Duração
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Resultado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {consultations.map((consultation) => (
                <tr key={consultation.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {new Date(consultation.consultation_date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {consultation.patient_id || 'Não identificado'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                    {consultation.duration_minutes} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        consultation.outcome === 'venda_realizada'
                          ? 'bg-green-100 text-green-800'
                          : consultation.outcome === 'venda_perdida'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {consultation.outcome === 'venda_realizada'
                        ? 'Venda Realizada'
                        : consultation.outcome === 'venda_perdida'
                        ? 'Venda Perdida'
                        : 'Follow-up'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {consultation.overall_score ? `${consultation.overall_score}/160` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {consultation.sale_value ? `R$ ${consultation.sale_value.toLocaleString('pt-BR')}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {consultation.audio_url ? (
                      <button
                        onClick={() => setPlayingConsultation(consultation)}
                        className="flex items-center gap-2 px-3 py-1.5 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Ouvir gravação"
                      >
                        <Headphones className="w-4 h-4" />
                        Ouvir
                      </button>
                    ) : (
                      <span className="text-neutral-400 text-xs">Sem áudio</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showRecorder && (
        <EnhancedAudioRecorder
          onRecordingComplete={handleRecordingComplete}
          onCancel={() => setShowRecorder(false)}
        />
      )}

      {playingConsultation && playingConsultation.audio_url && (
        <AudioPlayer
          audioUrl={playingConsultation.audio_url}
          consultationDate={playingConsultation.consultation_date}
          duration={playingConsultation.duration_minutes ? playingConsultation.duration_minutes * 60 : undefined}
          onClose={() => setPlayingConsultation(null)}
        />
      )}
    </div>
  )
}
