import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, PlusCircle,
  Bell, LogOut, ChevronDown, Menu, X, CheckCircle2, HardHat, AlertCircle,
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { notifApi } from '@/lib/apiCalls'

// Color primario del portal arquitecto: ámbar/dorado
const ARQCOLOR = '#D97706'

const navItems = [
  { to: '/arquitecto', icon: LayoutDashboard, label: 'Inicio', end: true },
  { to: '/arquitecto/tramites', icon: FileText, label: 'Mis Trámites', end: true },
  { to: '/arquitecto/tramites/nuevo', icon: PlusCircle, label: 'Nuevo Trámite', end: true },
]

export function ArquitectoLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const esHabilitado = (user as any)?.habilitado === true

  useEffect(() => {
    notifApi.contador().then(({ data }) => setNotifCount(data.count)).catch(() => {})
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }
  const initials = `${user?.nombre?.[0] ?? ''}${user?.apellido?.[0] ?? ''}`

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-blue-950">

      {/* ── TOPBAR CLARO ── */}
      <header className="sticky top-0 z-50 px-4 md:px-8 h-20 flex items-center justify-between bg-white border-b border-slate-200 shadow-sm transition-all">

        {/* LEFT: Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${ARQCOLOR} 0%, #B45309 100%)`, boxShadow: `0 2px 10px rgba(217,119,6,0.2)` }}>
            <HardHat size={20} className="text-white" />
          </div>
          <div>
            <p className="font-heading font-black text-blue-600 text-sm tracking-wide">GAD CAÑAR</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: ARQCOLOR }} />
              <p className="text-slate-500" style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em' }}>
                PORTAL PROFESIONAL
              </p>
            </div>
          </div>
        </div>

        {/* CENTER: Navigation (Desktop) */}
        <nav className="hidden lg:flex items-center gap-2 p-1 rounded-full"
          style={{ background: `rgba(217,119,6,0.03)`, border: `1px solid rgba(217,119,6,0.08)` }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `
                flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300
                ${isActive ? 'text-white' : 'text-slate-600 hover:text-amber-600 hover:bg-slate-50'}
              `}
              style={({ isActive }) => isActive ? {
                background: `linear-gradient(135deg, ${ARQCOLOR} 0%, #B45309 100%)`,
                boxShadow: `0 4px 12px rgba(217,119,6,0.2)`
              } : {}}
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-4">

          {/* Not-habilitado warning */}
          {!esHabilitado && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#D97706' }}>
              <AlertCircle size={12} />
              Pendiente habilitación
            </div>
          )}

          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl transition-all hidden sm:block text-slate-600 hover:text-amber-600 hover:bg-slate-50">
            <Bell size={20} />
            {notifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 text-white font-bold animate-pulse"
                style={{ background: '#CC2229', borderRadius: '50%', width: 16, height: 16, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {notifCount > 9 ? '9+' : notifCount}
              </span>
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-full transition-all border border-slate-200"
              style={{
                background: dropdownOpen ? `rgba(217,119,6,0.05)` : `rgba(217,119,6,0.01)`,
              }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ background: `linear-gradient(135deg, ${ARQCOLOR} 0%, #B45309 100%)`, color: 'white', boxShadow: `0 2px 8px rgba(217,119,6,0.2)` }}>
                {initials || <HardHat size={14} />}
              </div>
              <span className="text-slate-700 text-sm font-semibold hidden sm:block">
                {user?.nombre?.split(' ')[0]}
              </span>
              <ChevronDown size={14} className={`transition-transform duration-300 text-slate-400 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-72 rounded-2xl overflow-hidden animate-slide-up origin-top-right bg-white border border-slate-200 shadow-xl z-50 text-left">
                <div className="p-4 border-b border-slate-100">
                  <p className="text-slate-800 font-bold">{user?.nombre} {user?.apellido}</p>
                  <p className="text-xs mt-0.5 truncate text-amber-600 font-semibold">{user?.email}</p>
                  {(user as any)?.titulo && (
                    <p className="text-xs mt-1 text-slate-500 font-medium">
                      {(user as any).titulo} • Reg. {(user as any).numeroRegistro}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 mt-3 px-2 py-1.5 rounded-lg w-max"
                    style={{ background: esHabilitado ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)' }}>
                    <CheckCircle2 size={12} style={{ color: esHabilitado ? '#16A34A' : '#D97706' }} />
                    <span style={{
                      color: esHabilitado ? '#16A34A' : '#D97706',
                      fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                    }}>
                      {esHabilitado ? 'Habilitado por el GAD' : 'Pendiente de habilitación'}
                    </span>
                  </div>
                </div>
                <div className="p-2">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-red-500 hover:bg-red-50">
                    <LogOut size={16} />
                    <span className="font-semibold text-sm">Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="lg:hidden p-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* ── MOBILE MENU ── */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 pt-20 px-4 pb-6 flex flex-col bg-white/98 backdrop-blur-md">
          <nav className="flex-1 space-y-2 mt-4 text-left">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-4 rounded-2xl text-base font-semibold transition-all
                  ${isActive ? 'text-amber-600 bg-amber-50/50' : 'text-slate-600 hover:text-amber-600 hover:bg-slate-50'}
                `}
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 overflow-auto animate-fade-in relative z-10">
        <Outlet />
      </main>

      {/* Background Decorators */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-[0.025] blur-[120px]" style={{ background: ARQCOLOR }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full opacity-[0.015] blur-[100px]" style={{ background: ARQCOLOR }} />
      </div>
    </div>
  )
}
