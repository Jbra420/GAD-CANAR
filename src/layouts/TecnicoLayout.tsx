import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Inbox, LogOut, ChevronDown, Menu, X, Wrench
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/auth.store'

const navItems = [
  { to: '/tecnico', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/tecnico/bandeja', icon: Inbox, label: 'Bandeja de Trabajo' },
]

export function TecnicoLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
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
          <img src="/logo-gad.png" alt="GAD" className="w-10 h-10 object-contain rounded-xl"
            style={{ background: 'white', padding: '2px', boxShadow: '0 2px 10px rgba(46,139,87,0.1)' }} />
          <div>
            <p className="font-heading font-black text-blue-600 text-sm tracking-wide">GAD CAÑAR</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#2E8B57' }} />
              <p className="text-slate-500" style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em' }}>
                PORTAL TÉCNICO
              </p>
            </div>
          </div>
        </div>

        {/* CENTER: Navigation (Desktop) */}
        <nav className="hidden lg:flex items-center gap-2 p-1 rounded-full"
          style={{ background: 'rgba(46,139,87,0.03)', border: '1px solid rgba(46,139,87,0.08)' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `
                flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300
                ${isActive ? 'text-white' : 'text-slate-600 hover:text-green-700 hover:bg-slate-50'}
              `}
              style={({ isActive }) => isActive ? {
                background: 'linear-gradient(135deg, #2E8B57 0%, #1A5233 100%)',
                boxShadow: '0 4px 12px rgba(46,139,87,0.2)'
              } : {}}
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-4">
          
          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-100"
            style={{ background: 'rgba(46,139,87,0.05)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2E8B57' }} />
            <span style={{ color: '#2E8B57', fontSize: '0.7rem', fontWeight: 600 }}>En línea</span>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-full transition-all border border-slate-200"
              style={{ 
                background: dropdownOpen ? 'rgba(46,139,87,0.05)' : 'rgba(46,139,87,0.01)',
              }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ background: 'linear-gradient(135deg, #2E8B57 0%, #1A5233 100%)', color: 'white', boxShadow: '0 2px 8px rgba(46,139,87,0.2)' }}>
                {initials}
              </div>
              <span className="text-slate-700 text-sm font-semibold hidden sm:block">
                {user?.nombre?.split(' ')[0]}
              </span>
              <ChevronDown size={14} className={`transition-transform duration-300 text-slate-400 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 rounded-2xl overflow-hidden animate-slide-up origin-top-right bg-white border border-slate-200 shadow-xl z-50 text-left">
                <div className="p-4 border-b border-slate-100">
                  <p className="text-slate-800 font-bold">{user?.nombre} {user?.apellido}</p>
                  <p className="text-xs mt-0.5 truncate text-green-600 font-semibold">{user?.email}</p>
                  <div className="flex items-center gap-1.5 mt-3 px-2 py-1.5 rounded-lg w-max" style={{ background: 'rgba(46,139,87,0.08)' }}>
                    <Wrench size={12} style={{ color: '#2E8B57' }} />
                    <span style={{ color: '#2E8B57', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>Técnico Territorial</span>
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

      {/* ── MOBILE MENU OVERLAY ── */}
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
                  ${isActive ? 'text-green-600 bg-green-50/50' : 'text-slate-600 hover:text-green-700 hover:bg-slate-50'}
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
        <div className="absolute top-[30%] left-[-15%] w-[40%] h-[60%] rounded-full opacity-[0.02] blur-[120px]" style={{ background: '#2E8B57' }} />
        <div className="absolute bottom-[-10%] right-[10%] w-[30%] h-[40%] rounded-full opacity-[0.03] blur-[100px]" style={{ background: '#1B7FBF' }} />
      </div>

    </div>
  )
}
