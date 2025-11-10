import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { FileText, Plus, Calendar, User } from 'lucide-react'
import type { Briefing } from '../lib/types'

export default function BriefingsPage() {
  const { user } = useAuth()
  const [briefings, setBriefings] = useState<Briefing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    if (user) {
      loadBriefings()
    }
  }, [user])

  const loadBriefings = async () => {
    try {
      const { data, error } = await supabase
        .from('briefings')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBriefings(data || [])
    } catch (error) {
      console.error('Erro ao carregar briefings:', error)
    } finally {
      setIsLoading(false)
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
          <h1 className="text-2xl font-bold text-neutral-900">Briefings Inteligentes</h1>
          <p className="text-neutral-600 mt-1">Planejamento estratégico pré-consulta com IA</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Briefing
        </button>
      </div>

      {briefings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
          <FileText className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Nenhum briefing criado</h2>
          <p className="text-neutral-600 mb-6">
            Crie seu primeiro briefing para preparar sua consulta com inteligência artificial
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            Criar Primeiro Briefing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {briefings.map((briefing) => (
            <div
              key={briefing.id}
              className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-primary-50 text-primary-600 rounded-lg">
                  <FileText className="w-6 h-6" />
                </div>
                {briefing.used_in_consultation && (
                  <span className="px-2 py-1 bg-secondary-50 text-secondary-600 text-xs font-medium rounded-full">
                    Utilizado
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">{briefing.patient_name}</h3>
              <div className="space-y-2 text-sm text-neutral-600">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{briefing.patient_age} anos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(briefing.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-neutral-700 line-clamp-2">{briefing.main_complaint}</p>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && <CreateBriefingModal onClose={() => setShowCreateModal(false)} onSuccess={loadBriefings} />}
    </div>
  )
}

function CreateBriefingModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    mainComplaint: '',
    additionalNotes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Chamar Edge Function para gerar briefing com IA real
      const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-briefing', {
        body: {
          patientName: formData.patientName,
          patientAge: parseInt(formData.patientAge),
          mainComplaint: formData.mainComplaint,
          additionalNotes: formData.additionalNotes,
        },
      })

      if (functionError) throw functionError

      // Salvar briefing no banco de dados
      const { error: insertError } = await supabase.from('briefings').insert({
        user_id: user?.id as string,
        patient_name: formData.patientName,
        patient_age: parseInt(formData.patientAge),
        main_complaint: formData.mainComplaint,
        additional_notes: formData.additionalNotes,
        ai_briefing: functionData.data,
      } as any)

      if (insertError) throw insertError

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Erro ao criar briefing:', error)
      alert(`Erro ao criar briefing: ${error.message || 'Tente novamente.'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Criar Novo Briefing</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Nome do Paciente</label>
            <input
              type="text"
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Idade</label>
            <input
              type="number"
              value={formData.patientAge}
              onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Queixa Principal</label>
            <textarea
              value={formData.mainComplaint}
              onChange={(e) => setFormData({ ...formData, mainComplaint: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 h-24 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Observações Adicionais (Opcional)</label>
            <textarea
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 h-20 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Gerando...' : 'Gerar com IA'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
