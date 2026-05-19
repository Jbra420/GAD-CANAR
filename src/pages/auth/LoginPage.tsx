import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, AlertCircle, ArrowRight, Lock, Mail } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
type LoginForm = z.infer<typeof loginSchema>

const ROLE_REDIRECT: Record<string, string> = {
  CIUDADANO:   '/ciudadano',
  INVITADO:    '/ciudadano',
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

  const onSubmit = async (data: LoginForm) => {
    clearError()
    try {
      await login(data.email, data.password)
      const user = useAuthStore.getState().user
      navigate(ROLE_REDIRECT[user?.role ?? ''] ?? '/ciudadano', { replace: true })
    } catch {}
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--dark)' }}>

      {/* ── Panel izquierdo — Identidad institucional ── */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative overflow-hidden"
        style={{ background: '#0A0800' }}>

        {/* Fondo decorativo con los colores del escudo */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `
            radial-gradient(circle at 20% 20%, rgba(204,34,41,0.12) 0%, transparent 40%),
            radial-gradient(circle at 80% 80%, rgba(46,139,87,0.08) 0%, transparent 40%),
            radial-gradient(circle at 80% 20%, rgba(27,127,191,0.08) 0%, transparent 40%),
            radial-gradient(circle at 20% 80%, rgba(37,99,235,0.05) 0%, transparent 40%)
          `,
        }} />

        {/* Líneas decorativas */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: 4,
          background: 'linear-gradient(90deg, #CC2229 25%, #2563EB 25% 50%, #2E8B57 50% 75%, #1B7FBF 75%)',
        }} />

        <div className="relative z-10 text-center px-12 max-w-md">
          {/* Logo con glow */}
          <div className="relative inline-block mb-8">
            <img src="/logo-gad.png" alt="GAD Municipal de Cañar"
              className="w-32 h-32 object-contain mx-auto"
              style={{ background: 'white', borderRadius: 20, padding: 8, boxShadow: '0 0 60px rgba(37,99,235,0.3)' }} />
            {/* Anillo giratorio de colores */}
            <div style={{
              position: 'absolute', inset: -6, borderRadius: 28,
              background: 'conic-gradient(#CC2229 0deg 90deg, #2563EB 90deg 180deg, #2E8B57 180deg 270deg, #1B7FBF 270deg 360deg)',
              opacity: 0.35,
              zIndex: -1,
              filter: 'blur(6px)',
            }} />
          </div>

          <h2 className="font-heading font-extrabold text-blue-950 text-3xl mb-3">
            CAÑAR
          </h2>
          <p className="font-bold mb-1" style={{ color: '#2563EB', letterSpacing: '0.2em', fontSize: '0.8rem' }}>
            GAD MUNICIPAL
          </p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '2rem' }}>
            ORDENAMIENTO TERRITORIAL
          </p>

          {/* Cuatro bloques de colores del escudo */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { c: '#CC2229', label: 'Justicia', desc: 'Equidad Social' },
              { c: '#2563EB', label: 'Progreso', desc: 'Desarrollo Cantonal' },
              { c: '#2E8B57', label: 'Naturaleza', desc: 'Sostenibilidad' },
              { c: '#1B7FBF', label: 'Agua', desc: 'Recurso Vital' },
            ].map(({ c, label, desc }) => (
              <div key={label} className="p-4 rounded-xl text-center"
                style={{ background: `${c}15`, border: `1px solid ${c}30` }}>
                <p style={{ color: `${c}`, fontSize: '0.85rem', fontWeight: 700 }}>{label}</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', marginTop: 4 }}>{desc}</p>
              </div>
            ))}
          </div>

          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', lineHeight: 1.7 }}>
            Plataforma oficial de trámites digitales de ordenamiento territorial del Cantón Cañar
          </p>
        </div>

        {/* Línea inferior */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 4,
          background: 'linear-gradient(90deg, #1B7FBF 25%, #2E8B57 25% 50%, #2563EB 50% 75%, #CC2229 75%)',
        }} />
      </div>

      {/* ── Panel derecho — Formulario ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12"
        style={{ background: 'var(--dark)', maxWidth: 480, width: '100%' }}>

        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src="/logo-gad.png" alt="GAD" className="w-10 h-10 object-contain rounded-xl"
              style={{ background: 'white', padding: 3 }} />
            <div>
              <p className="font-heading font-bold text-blue-950">GAD Cañar</p>
              <p style={{ color: 'rgba(37,99,235,0.5)', fontSize: '10px' }}>PORTAL CIUDADANO</p>
            </div>
          </div>

          {/* Banda de colores del escudo — móvil */}
          <div className="lg:hidden shield-band mb-8 rounded-full" style={{ height: 3 }} />

          <h1 className="font-heading font-extrabold text-blue-950 text-2xl mb-2">
            Inicia sesión
          </h1>
          <p className="mb-8" style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Accede a tu portal según tu rol institucional
          </p>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl mb-6" style={{
              background: 'rgba(204,34,41,0.1)',
              border: '1px solid rgba(204,34,41,0.3)',
              color: '#F87171',
              fontSize: '0.875rem',
            }}>
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="input-label">
                <Mail size={12} className="inline mr-1" />
                Correo electrónico
              </label>
              <input
                {...register('email')}
                id="login-email"
                type="email"
                className="input-field"
                placeholder="nombre@gadcanar.gob.ec"
                autoComplete="email"
              />
              {errors.email && (
                <p className="input-error">
                  <AlertCircle size={12} />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="input-label">
                <Lock size={12} className="inline mr-1" />
                Contraseña
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#94a3b8' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="input-error">
                  <AlertCircle size={12} />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button type="submit" id="login-submit" disabled={isLoading} className="btn-primary w-full mt-2">
              {isLoading
                ? <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF' }} />
                : <><span>Ingresar al sistema</span><ArrowRight size={18} /></>}
            </button>
          </form>

          {/* Divisor */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(37,99,235,0.1)' }} />
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>¿nuevo usuario?</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(37,99,235,0.1)' }} />
          </div>

          <Link to="/registro" id="login-to-register"
            className="btn-secondary w-full">
            Crear cuenta ciudadana
          </Link>

          {/* Portales disponibles */}
          <div className="mt-8 p-4 rounded-2xl" style={{ background: 'rgba(37,99,235,0.04)', border: '1px solid rgba(37,99,235,0.1)' }}>
            <p style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, textAlign: 'center' }}>
              Portales del sistema
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { role: 'Ciudadano', color: '#2563EB', icon: '👤', text: 'Trámites' },
                { role: 'Secretaría', color: '#D97706', icon: '📋', text: 'Revisión Docs' },
                { role: 'Técnico', color: '#2E8B57', icon: '🔬', text: 'Evaluación' },
                { role: 'Financiero', color: '#7C3AED', icon: '💰', text: 'Cobros' },
                { role: 'SuperAdmin', color: '#CC2229', icon: '🛡️', text: 'Control Total' },
                { role: 'Invitado', color: '#64748b', icon: '👁️', text: 'Consulta' },
              ].map(r => (
                <div key={r.role} className="text-center p-3 rounded-xl transition-all"
                  style={{ background: `${r.color}08`, border: `1px solid ${r.color}20` }}>
                  <p style={{ fontSize: '1rem', marginBottom: 4 }}>{r.icon}</p>
                  <p style={{ color: `${r.color}`, fontSize: '0.65rem', fontWeight: 700 }}>
                    {r.role}
                  </p>
                  <p style={{ color: '#94a3b8', fontSize: '0.58rem', marginTop: 2 }}>
                    {r.text}
                  </p>
                </div>
              ))}
            </div>
            <p style={{ color: 'rgba(100,116,139,0.6)', fontSize: '0.65rem', textAlign: 'center', marginTop: 10 }}>
              🔐 Cada rol ingresa con credenciales asignadas
            </p>
          </div>

          <p className="text-center mt-8" style={{ color: '#94a3b8', fontSize: '0.7rem' }}>
            © {new Date().getFullYear()} GAD Municipal de Cañar
          </p>
        </div>
      </div>
    </div>
  )
}
