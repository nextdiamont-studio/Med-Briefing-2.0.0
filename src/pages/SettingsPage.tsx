import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Settings, Save, User, Bell, Palette } from 'lucide-react'
import type { UserSettings } from '../lib/types'
import ProfileImageUpload from '../components/ProfileImageUpload'

export default function SettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadSettings()
    }
  }, [user])

  const loadSettings = async () => {
    try {
      // Carregar configurações
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle()

      if (settingsError) throw settingsError
      setSettings(settingsData)

      // Carregar dados do perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (profileError) throw profileError
      if (profileData) {
        setProfileData(profileData)
        setAvatarUrl((profileData as any).avatar_url || null)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUploadComplete = (newAvatarUrl: string) => {
    setAvatarUrl(newAvatarUrl)
    alert('Foto de perfil atualizada com sucesso!')
  }

  const handleSaveSettings = async () => {
    if (!settings) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('user_settings')
        // @ts-expect-error - Supabase type inference issue
        .update({
          email_notifications: settings.email_notifications,
          weekly_reports: settings.weekly_reports,
          theme: settings.theme,
          language_preference: settings.language_preference,
        })
        .eq('user_id', user?.id as string)

      if (error) throw error
      alert('Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      alert('Erro ao salvar configurações. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!profileData) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        // @ts-expect-error - Supabase type inference issue
        .update({
          full_name: profileData.full_name,
          clinic_name: profileData.clinic_name,
          phone: profileData.phone,
          specialty: profileData.specialty,
        })
        .eq('id', user?.id as string)

      if (error) throw error
      alert('Perfil atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      alert('Erro ao atualizar perfil. Tente novamente.')
    } finally {
      setIsSaving(false)
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
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Configurações</h1>
        <p className="text-neutral-600 mt-1">Gerencie suas preferências e informações pessoais</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Foto de Perfil - Full Width no topo */}
        <div className="lg:col-span-3">
          <ProfileImageUpload
            currentAvatarUrl={avatarUrl}
            onUploadComplete={handleAvatarUploadComplete}
          />
        </div>

        {/* Informações Pessoais */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Informações Pessoais</h2>
              <p className="text-sm text-neutral-600">Atualize seus dados profissionais</p>
            </div>
          </div>

          {profileData && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Nome Completo</label>
                <input
                  type="text"
                  value={profileData.full_name || ''}
                  onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
                <input
                  type="email"
                  value={profileData.email || ''}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-500"
                  disabled
                  title="Email não pode ser alterado"
                />
                <p className="text-xs text-neutral-500 mt-1">O email não pode ser alterado</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Especialidade</label>
                  <input
                    type="text"
                    value={profileData.specialty || ''}
                    onChange={(e) => setProfileData({ ...profileData, specialty: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ex: Medicina Estética"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Telefone</label>
                  <input
                    type="tel"
                    value={profileData.phone || ''}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Nome da Clínica</label>
                <input
                  type="text"
                  value={profileData.clinic_name || ''}
                  onChange={(e) => setProfileData({ ...profileData, clinic_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Nome da sua clínica"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium shadow-lg shadow-primary-600/30"
              >
                <Save className="w-5 h-5" />
                {isSaving ? 'Salvando...' : 'Salvar Informações'}
              </button>
            </div>
          )}
        </div>

        {/* Preferências */}
        <div className="lg:col-span-1 space-y-6">
          {/* Notificações */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-aesthetic-100 text-aesthetic-600 rounded-lg">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Notificações</h2>
                <p className="text-sm text-neutral-600">Gerencie alertas</p>
              </div>
            </div>

            {settings && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Email</p>
                    <p className="text-xs text-neutral-500">Alertas importantes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.email_notifications}
                      onChange={(e) =>
                        setSettings({ ...settings, email_notifications: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Relatórios</p>
                    <p className="text-xs text-neutral-500">Resumo semanal</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.weekly_reports}
                      onChange={(e) => setSettings({ ...settings, weekly_reports: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Aparência */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-success-50 text-success-600 rounded-lg">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Aparência</h2>
                <p className="text-sm text-neutral-600">Tema do sistema</p>
              </div>
            </div>

            {settings && (
              <div>
                <select
                  value={settings.theme}
                  onChange={(e) =>
                    setSettings({ ...settings, theme: e.target.value as 'light' | 'dark' | 'auto' })
                  }
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                  <option value="auto">Automático</option>
                </select>
              </div>
            )}
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium shadow-lg shadow-primary-600/30"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Salvando...' : 'Salvar Preferências'}
          </button>
        </div>
      </div>

    </div>
  )
}
