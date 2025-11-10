import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../contexts/ThemeContext'
import { LogOut, User, Search, Sun, Moon, Monitor } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const { profile, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const [showThemeMenu, setShowThemeMenu] = useState(false)

  const themeIcons = {
    light: Sun,
    dark: Moon,
    auto: Monitor,
  }
  const ThemeIcon = themeIcons[theme]

  return (
    <header className="h-20 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between px-8 shadow-sm transition-colors">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500" />
          <input
            type="text"
            placeholder="Buscar pacientes, consultas..."
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white dark:focus:bg-neutral-600 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-400 transition-all"
          />
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        {/* Toggle de Tema */}
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="p-2.5 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
            title="Alterar tema"
          >
            <ThemeIcon className="w-5 h-5" />
          </button>
          {showThemeMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg py-1 z-50">
              <button
                onClick={() => { setTheme('light'); setShowThemeMenu(false) }}
                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors ${
                  theme === 'light' ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <Sun className="w-4 h-4" />
                Claro
              </button>
              <button
                onClick={() => { setTheme('dark'); setShowThemeMenu(false) }}
                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors ${
                  theme === 'dark' ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <Moon className="w-4 h-4" />
                Escuro
              </button>
              <button
                onClick={() => { setTheme('auto'); setShowThemeMenu(false) }}
                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors ${
                  theme === 'auto' ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <Monitor className="w-4 h-4" />
                Automático
              </button>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg overflow-hidden">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="text-sm">
            <p className="font-semibold text-neutral-900 dark:text-white">
              {profile?.full_name || 'Usuário'}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {profile?.specialty || 'Médico Estético'}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={signOut}
          className="p-2.5 text-neutral-600 dark:text-neutral-300 hover:text-error-500 dark:hover:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg transition-colors"
          title="Sair"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
