import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { 
  Users, 
  Plus, 
  Mail, 
  Phone, 
  Calendar,
  Activity,
  Search,
  MoreVertical,
  User2,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import type { Patient } from '../lib/types'

export default function PatientsPage() {
  const { user } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (user) {
      loadPatients()
    }
  }, [user])

  useEffect(() => {
    if (searchTerm) {
      const filtered = patients.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone?.includes(searchTerm)
      )
      setFilteredPatients(filtered)
    } else {
      setFilteredPatients(patients)
    }
  }, [searchTerm, patients])

  const loadPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Carregar consultas separadamente para cada paciente
      if (data && data.length > 0) {
        const patientsWithConsultations = await Promise.all(
          data.map(async (patient: any) => {
            const { data: consultations } = await supabase
              .from('consultations')
              .select('id, outcome, created_at')
              .eq('patient_id', patient.id)
              .order('created_at', { ascending: false })
              .limit(1)
            
            return {
              ...patient,
              consultations: consultations || []
            } as any
          })
        )
        
        setPatients(patientsWithConsultations)
        setFilteredPatients(patientsWithConsultations)
      } else {
        setPatients(data || [])
        setFilteredPatients(data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error)
      // Não quebrar a página, apenas mostrar estado vazio
      setPatients([])
      setFilteredPatients([])
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Pacientes</h1>
          <p className="text-neutral-600 mt-1">Gerencie seus pacientes</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all font-medium shadow-lg shadow-primary-600/30"
        >
          <Plus className="w-5 h-5" />
          Novo Paciente
        </button>
      </div>

      {/* Barra de busca */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Grid de Cards - Estilo OdontoFlow Produtos */}
      {filteredPatients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
          <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-neutral-400" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
          </h2>
          <p className="text-neutral-600 mb-6">
            {searchTerm
              ? 'Tente buscar com outros termos'
              : 'Adicione pacientes para gerenciar consultas e históricos no CRM'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
            >
              Adicionar Primeiro Paciente
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPatients.map((patient) => {
            const consultations = (patient as any).consultations || []
            const lastConsultation = consultations[0]
            const totalConsultations = consultations.length
            const hasRecentActivity = lastConsultation && new Date(lastConsultation.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

            // Determinar status
            let status: 'active' | 'inactive' | 'pending' = 'inactive'
            if (hasRecentActivity) {
              status = 'active'
            } else if (totalConsultations > 0) {
              status = 'pending'
            }

            return (
              <div
                key={patient.id}
                className="bg-white rounded-xl shadow-sm border-2 border-neutral-200 hover:border-primary-400 hover:shadow-lg transition-all cursor-pointer overflow-hidden group"
              >
                {/* Card Header com Badge de Status */}
                <div className="relative p-6 pb-4 bg-gradient-to-br from-neutral-50 to-white">
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    {status === 'active' ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-success-50 text-success-600 rounded-full text-xs font-medium">
                        <Activity className="w-3 h-3" />
                        Ativo
                      </div>
                    ) : status === 'pending' ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-warning-50 text-warning-500 rounded-full text-xs font-medium">
                        <Clock className="w-3 h-3" />
                        Follow-up
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-500 rounded-full text-xs font-medium">
                        <User2 className="w-3 h-3" />
                        Inativo
                      </div>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <span className="text-2xl font-bold text-white">
                      {patient.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 pt-4">
                  {/* Nome */}
                  <h3 className="text-lg font-bold text-neutral-900 mb-1 truncate">
                    {patient.name}
                  </h3>

                  {/* Perfil Comportamental */}
                  {patient.behavioral_profile && (
                    <div className="mb-3">
                      <span className="inline-block px-2.5 py-1 bg-aesthetic-100 text-aesthetic-700 text-xs font-medium rounded-full">
                        {patient.behavioral_profile}
                      </span>
                    </div>
                  )}

                  {/* Informações */}
                  <div className="space-y-2 text-sm text-neutral-600 mb-4">
                    {patient.age && patient.gender && (
                      <div className="flex items-center gap-2">
                        <User2 className="w-4 h-4 text-neutral-400" />
                        <span>
                          {patient.age} anos • {patient.gender}
                        </span>
                      </div>
                    )}

                    {patient.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-neutral-400" />
                        <span className="truncate">{patient.email}</span>
                      </div>
                    )}

                    {patient.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-neutral-400" />
                        <span>{patient.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Última Consulta */}
                  {lastConsultation && (
                    <div className="pt-4 border-t border-neutral-100">
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <Calendar className="w-3.5 h-3.5" />
                        Última consulta:{' '}
                        {new Date(lastConsultation.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </div>
                    </div>
                  )}

                  {/* Queixa Principal (se houver) */}
                  {patient.main_complaint && (
                    <p className="mt-3 text-sm text-neutral-700 line-clamp-2 border-t border-neutral-100 pt-3">
                      <span className="font-medium">Queixa:</span> {patient.main_complaint}
                    </p>
                  )}

                  {/* Ações */}
                  <div className="mt-4 pt-4 border-t border-neutral-100 flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-lg text-sm font-medium transition-colors">
                      Ver Detalhes
                    </button>
                    <button className="px-3 py-2 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showCreateModal && (
        <CreatePatientModal onClose={() => setShowCreateModal(false)} onSuccess={loadPatients} />
      )}
    </div>
  )
}

function CreatePatientModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    mainComplaint: '',
    behavioralProfile: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.from('patients').insert({
        user_id: user?.id as string,
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        age: formData.age ? parseInt(formData.age) : null,
        gender: (formData.gender as any) || null,
        main_complaint: formData.mainComplaint || null,
        behavioral_profile: (formData.behavioralProfile as any) || null,
      } as any)

      if (error) throw error

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Erro ao criar paciente:', error)
      alert('Erro ao criar paciente. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Adicionar Novo Paciente</h2>
            <p className="text-sm text-neutral-600 mt-1">Preencha as informações do paciente</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Nome Completo <span className="text-error-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Digite o nome completo"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="exemplo@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Telefone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Idade</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ex: 35"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Gênero</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Selecione</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
                <option value="Prefiro não informar">Prefiro não informar</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Perfil DISC</label>
              <select
                value={formData.behavioralProfile}
                onChange={(e) => setFormData({ ...formData, behavioralProfile: e.target.value })}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Selecione</option>
                <option value="Dominante">Dominante</option>
                <option value="Influente">Influente</option>
                <option value="Estável">Estável</option>
                <option value="Analítico">Analítico</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Queixa Principal</label>
            <textarea
              value={formData.mainComplaint}
              onChange={(e) => setFormData({ ...formData, mainComplaint: e.target.value })}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 h-24 resize-none"
              placeholder="Descreva a queixa principal do paciente..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border-2 border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium shadow-lg shadow-primary-600/30"
            >
              {isLoading ? 'Salvando...' : 'Salvar Paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
