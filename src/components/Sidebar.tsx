import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Mic,
  Settings,
  Brain,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Navegação focada em Estética Médica
const mainNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
]

const clinicNavigation = [
  { name: 'Gravações', href: '/gravacoes', icon: Mic },
  { name: 'Análises', href: '/analises', icon: Brain },
]

export default function Sidebar() {
  const { user } = useAuth()
  const [userName, setUserName] = useState<string>('')
  const [userAvatar, setUserAvatar] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadUserProfile()
    }
  }, [user])

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user?.id)
        .single()

      if (error) throw error
      if (data) {
        setUserName((data as any).full_name || 'Usuário')
        setUserAvatar((data as any).avatar_url)
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
    }
  }

  return (
    <div className="w-64 bg-neutral-800 flex flex-col h-screen shadow-xl">
      {/* Logo e nome */}
      <div className="p-6 border-b border-neutral-700 bg-gradient-to-br from-neutral-800 to-neutral-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Med Briefing</h1>
            <p className="text-xs text-rose-300">Estética IA</p>
          </div>
        </div>
      </div>

      {/* Navegação principal */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* PRINCIPAL */}
        <div>
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 px-3">
            Principal
          </h3>
          <div className="space-y-1">
            {mainNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-600/50'
                      : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>

        {/* CLÍNICA */}
        <div>
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 px-3">
            Clínica
          </h3>
          <div className="space-y-1">
            {clinicNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-600/50'
                      : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Informações do usuário na parte inferior */}
      <div className="border-t border-neutral-700">
        {/* Configurações */}
        <div className="p-4">
          <NavLink
            to="/configuracoes"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/50'
                  : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
              }`
            }
          >
            <Settings className="w-5 h-5" />
            Configurações
          </NavLink>
        </div>

        {/* Perfil do usuário */}
        <div className="p-4 bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-aesthetic-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg overflow-hidden">
              {userAvatar ? (
                <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                userName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-xs text-neutral-400 truncate">Médico Estético</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
