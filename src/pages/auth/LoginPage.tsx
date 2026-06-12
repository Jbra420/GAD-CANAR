import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, AlertCircle, ArrowRight, Lock, Mail, Loader, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
type LoginForm = z.infer<typeof loginSchema>

const ROLE_REDIRECT: Record<string, string> = {
  CIUDADANO:   '/ciudadano',
  INVITADO:    '/ciudadano',
  ARQUITECTO:  '/arquitecto',
  TECNICO:     '/tecnico',
  SECRETARIA:  '/secretaria',
  FINANCIERO:  '/financiero',
  SUPERADMIN:  '/admin',
}

export function LoginPage() {
  const { login, isLoading, error, clearError } = useAuthStore()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    clearError()
  }, [clearError])

  const onSubmit = async (data: LoginForm) => {
    clearError()
    try {
      await login(data.email, data.password)
      const user = useAuthStore.getState().user
      navigate(ROLE_REDIRECT[user?.role ?? ''] ?? '/ciudadano', { replace: true })
    } catch {}
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between relative overflow-hidden font-sans">
      
      {/* ── Ambient Floating Glow Blobs ── */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-blue-100/40 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-blue-50/30 blur-[130px] pointer-events-none" />

      {/* Header back link */}
      <header className="relative z-10 px-6 py-6 max-w-5xl mx-auto w-full flex items-center justify-start">
        <Link to="/" className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
          <ArrowLeft size={14} className="text-slate-400" /> Volver al Inicio
        </Link>
      </header>

      {/* Main card container */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          
          <div className="text-center mb-8">
            <img src="/logo-gad.png" alt="Logo GAD" className="w-16 h-16 object-contain mx-auto bg-white p-1 rounded-2xl shadow-md mb-4" />
            <h1 className="text-2xl font-heading font-black text-slate-900">Ingreso de Usuarios</h1>
            <p className="text-slate-500 text-xs mt-1">Ingresa a tu cuenta para gestionar tus trámites</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xl relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-[#F5C100] to-green-500 rounded-t-3xl" />

            {error && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs mb-6">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left">
              <div>
                <label className="text-[10px] tracking-wider uppercase font-bold text-blue-600 mb-1.5 flex items-center gap-1">
                  <Mail size={10} /> Correo electrónico
                </label>
                <input
                  {...register('email')}
                  id="login-email"
                  type="email"
                  className="input-field bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 text-sm rounded-xl py-3"
                  placeholder="ejemplo@gadcanar.gob.ec"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-[10px] tracking-wider uppercase font-bold text-blue-600 mb-1.5 flex items-center gap-1">
                  <Lock size={10} /> Contraseña
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    className="input-field bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 text-sm rounded-xl py-3 pr-10"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                id="login-submit"
                disabled={isLoading}
                className="btn-primary w-full py-3 rounded-xl mt-6 flex items-center justify-center gap-2 font-bold text-xs"
              >
                {isLoading ? (
                  <Loader size={14} className="animate-spin" />
                ) : (
                  <>
                    <span>Ingresar al Sistema</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">¿nuevo usuario?</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <Link
              to="/registro"
              id="login-to-register"
              className="btn-secondary w-full py-3 rounded-xl flex items-center justify-center font-bold text-xs transition-all"
            >
              Crear cuenta ciudadana
            </Link>

          </div>
        </div>
      </main>

      <footer className="relative z-10 px-6 py-6 text-center text-[10px] text-slate-400">
        <p>© {new Date().getFullYear()} GAD Cañar. Portal de Planificación.</p>
      </footer>

    </div>
  )
}
