import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { applications_api } from '@/lib/api.calls'

export function RegisterPage() {
  const navigate = useNavigate()
  const { registerGuest, is_loading: store_loading, error: store_error, clearError } = useAuthStore()
  
  const [search_val, set_search_val] = useState('')
  const [search_error, set_search_error] = useState('')
  const [is_searching, set_is_searching] = useState(false)
  const [custom_error, set_custom_error] = useState<string | null>(null)
  const [is_done, set_is_done] = useState(false)

  const validateInput = (val: string) => {
    if (!val.trim()) return 'El correo o cédula es requerido'
    const looks_like_email = val.includes('@')
    if (looks_like_email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return 'Correo electrónico inválido'
    } else {
      if (!/^\d+$/.test(val.trim()) || val.trim().length !== 10) {
        return 'Ingresa un correo válido o una cédula de 10 dígitos'
      }
    }
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    set_custom_error(null)
    
    const err = validateInput(search_val)
    if (err) { set_search_error(err); return }
    set_search_error('')
    
    set_is_searching(true)
    try {
      const is_email = search_val.includes('@')
      const params = is_email ? { email: search_val.trim() } : { national_id: search_val.trim() }
      
      // 1. Verificar si existen solicitudes
      const { data } = await applications_api.publicTracking(params)
      
      if (!data.solicitudes || data.solicitudes.length === 0) {
        set_custom_error('No se encontraron trámites a su nombre. Los trámites deben ser registrados inicialmente por un arquitecto autorizado.')
        set_is_searching(false)
        return
      }

      // 2. Obtener el email del ciudadano en la base de datos y loguearlo/registrarlo
      const target_email = data.ciudadano.email
      await registerGuest(target_email)
      set_is_done(true)
      setTimeout(() => navigate('/citizen'), 1200)
    } catch (err: any) {
      set_custom_error(
        err.response?.data?.message || 
        'No se encontraron trámites a su nombre. Los trámites deben ser registrados inicialmente por un arquitecto autorizado.'
      )
    } finally {
      set_is_searching(false)
    }
  }

  const active_error = custom_error || store_error
  const active_loading = is_searching || store_loading

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Ambient background glow blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-blue-100/40 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-blue-50/30 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md animate-slide-up relative z-10">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <img src="/logo-gad.png" alt="Logo GAD" className="w-12 h-12 object-contain bg-white p-1 rounded-xl shadow-md" />
          <div className="text-left">
            <span className="font-heading font-black text-blue-600 text-lg tracking-wider block">CAÑAR</span>
            <p className="text-[#D4A800] text-[9px] uppercase tracking-wider font-bold">Portal Ciudadano</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xl relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-[#F5C100] to-green-500 rounded-t-3xl" />

          {/* Estado: éxito */}
          {is_done ? (
            <div className="text-center py-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <h2 className="font-heading text-xl font-bold text-slate-900 mb-2">¡Acceso Concedido!</h2>
              <p className="text-slate-500 text-sm">Cargando tus trámites municipales…</p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-left">
                <h1 className="font-heading text-xl font-bold text-slate-900 mb-2">
                  Acceso para Propietarios
                </h1>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Ingresa tu cédula o correo electrónico para verificar tus solicitudes activas e ingresar al portal.
                </p>
              </div>

              {/* Error */}
              {active_error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs mb-5 text-left">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p>{active_error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div>
                  <label htmlFor="reg-search" className="text-[10px] tracking-wider uppercase font-bold text-blue-600 mb-1.5 flex items-center gap-1">
                    <Search size={10} /> Cédula o Correo Electrónico
                  </label>
                  <input
                    id="reg-search"
                    type="text"
                    value={search_val}
                    onChange={e => { set_search_val(e.target.value); set_search_error(''); set_custom_error(null); }}
                    className="input-field bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 text-sm rounded-xl py-3"
                    placeholder="Ej. 0102030405 o juan@gmail.com"
                    autoFocus
                  />
                  {search_error && (
                    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={10} />{search_error}
                    </p>
                  )}
                </div>

                {/* Explicación visual del proceso */}
                <div className="rounded-xl p-4 space-y-3 bg-blue-50/30 border border-blue-100">
                  <p className="text-[10px] tracking-wider uppercase font-bold text-blue-600">
                    ¿Cómo funciona el acceso?
                  </p>
                  {[
                    { num: '1', text: 'Tu arquitecto de confianza debe registrar inicialmente el trámite con tus datos.' },
                    { num: '2', text: 'Ingresas tu cédula o correo para verificar la existencia del trámite.' },
                    { num: '3', text: 'Accedes de forma segura y consultas el estado del trámite en tiempo real.' },
                  ].map(s => (
                    <div key={s.num} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 bg-blue-100 text-blue-600 border border-blue-200">
                        {s.num}
                      </span>
                      <p className="text-slate-600 text-xs leading-relaxed">{s.text}</p>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  id="reg-submit"
                  disabled={active_loading}
                  className="btn-primary w-full py-3 rounded-xl mt-6 flex items-center justify-center gap-2 font-bold text-xs"
                >
                  {active_loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Acceder a mis Trámites</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-slate-500 text-xs mt-6">
                ¿Eres personal municipal o arquitecto?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                  Iniciar sesión
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
