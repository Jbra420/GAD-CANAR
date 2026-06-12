import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  HardHat, AlertCircle, CheckCircle2, ArrowRight, Eye, EyeOff,
  User, Phone, Lock, Mail
} from 'lucide-react'
import api from '@/lib/api'

const schema = z.object({
  nombre: z.string().min(2, 'Ingresa tu nombre'),
  apellido: z.string().min(2, 'Ingresa tu apellido'),
  cedula: z.string().regex(/^\d{10}$/, 'La cédula debe tener 10 dígitos'),
  email: z.string().email('Email no válido'),
  telefono: z.string().optional(),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Debe incluir mayúscula, minúscula y número'),
  confirmarPassword: z.string(),
}).refine(d => d.password === d.confirmarPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmarPassword'],
})

type Form = z.infer<typeof schema>

export function RegisterArquitectoPage() {
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: Form) => {
    setLoading(true)
    setError(null)
    try {
      await api.post('/auth/registro-arquitecto', {
        nombre: data.nombre,
        apellido: data.apellido,
        cedula: data.cedula,
        email: data.email,
        telefono: data.telefono || undefined,
        password: data.password,
      })
      setExito(true)
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al registrar. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  if (exito) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 font-sans">
        <div className="max-w-md w-full rounded-3xl p-10 text-center space-y-5 bg-white shadow-xl border border-slate-200/80">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto bg-green-50 border border-green-200">
            <CheckCircle2 size={36} className="text-green-600" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-slate-800">¡Registro exitoso!</h2>
          
          <p className="text-slate-600 text-sm leading-relaxed">
            Tu cuenta de profesional habilitado ha sido <strong className="text-green-600">creada e inmediatamente activada</strong>. Ya puedes ingresar al sistema y comenzar a gestionar trámites en nombre de tus clientes.
          </p>

          <div className="p-4 rounded-2xl text-left space-y-2 bg-slate-50 border border-slate-100">
            <p className="text-slate-800 font-bold text-sm">📋 Pasos a seguir:</p>
            <ul className="text-slate-600 text-xs space-y-1 list-disc list-inside">
              <li>Inicia sesión con tu correo y contraseña.</li>
              <li>Ve a "Nuevo Trámite" para registrar predios.</li>
              <li>Sube los documentos requeridos (tu título profesional se validará con tu cédula al enviar el trámite).</li>
              <li>El trámite se enviará a la Secretaría para validación documental y posterior delegación al técnico rural o urbano.</li>
            </ul>
          </div>
          <Link to="/login" className="block w-full py-3.5 rounded-xl font-bold text-sm text-center bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors">
            Ir al inicio de sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-10 bg-slate-50 relative font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100/30 opacity-60 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-50/20 opacity-40 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center text-slate-800">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-blue-600 shadow-md text-white">
            <HardHat size={28} />
          </div>
          <h1 className="font-heading text-2xl font-black text-slate-900">Portal Profesional</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Registro de Arquitecto / Profesional Habilitado
          </p>
          <div className="flex items-center gap-2 justify-center mt-3 px-4 py-1.5 rounded-full w-max mx-auto border"
            style={{
              background: 'rgba(34,197,94,0.08)',
              borderColor: 'rgba(34,197,94,0.2)',
              color: '#15803D'
            }}>
            <AlertCircle size={12} />
            <span className="text-xs font-semibold">
              Habilitación Inmediata (Validación en primer trámite)
            </span>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="rounded-3xl p-6 space-y-5 bg-white border border-slate-200 shadow-xl">
            
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-4 text-blue-600">
                Datos Personales
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label text-slate-600">Nombre *</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input {...register('nombre')} id="reg-nombre" className="input-field pl-9"
                      placeholder="Juan" />
                  </div>
                  {errors.nombre && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.nombre.message}</p>}
                </div>
                <div>
                  <label className="input-label text-slate-600">Apellido *</label>
                  <input {...register('apellido')} id="reg-apellido" className="input-field" placeholder="Pérez" />
                  {errors.apellido && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.apellido.message}</p>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label text-slate-600">Cédula *</label>
                <input {...register('cedula')} id="reg-cedula" className="input-field" placeholder="0102030405" maxLength={10} />
                {errors.cedula && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.cedula.message}</p>}
              </div>
              <div>
                <label className="input-label text-slate-600">Teléfono</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input {...register('telefono')} id="reg-telefono" className="input-field pl-9" placeholder="0987654321" />
                </div>
              </div>
            </div>

            <div>
              <label className="input-label text-slate-600">Correo Electrónico *</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input {...register('email')} id="reg-email" type="email" className="input-field pl-9" placeholder="arquitecto@email.com" />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.email.message}</p>}
            </div>

            <div className="h-px bg-slate-200" />

            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-4 text-blue-600">
                Contraseña
              </p>
              <div className="space-y-4">
                <div>
                  <label className="input-label text-slate-600">Contraseña *</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input {...register('password')} id="reg-password" type={showPass ? 'text' : 'password'}
                      className="input-field pl-9 pr-10" placeholder="Mínimo 8 caracteres" />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.password.message}</p>}
                </div>
                <div>
                  <label className="input-label text-slate-600">Confirmar Contraseña *</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input {...register('confirmarPassword')} id="reg-confirm-password" type="password"
                      className="input-field pl-9" placeholder="Repite tu contraseña" />
                  </div>
                  {errors.confirmarPassword && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.confirmarPassword.message}</p>}
                </div>
              </div>
            </div>

          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            id="btn-registrar-arquitecto"
            disabled={loading}
            className="btn-primary w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
            style={{ opacity: loading ? 0.8 : 1 }}
          >
            {loading
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><span>Registrarme como Profesional</span><ArrowRight size={18} /></>}
          </button>

          <div className="text-center space-y-2">
            <p className="text-slate-500 text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="font-semibold transition-colors text-blue-600 hover:text-blue-700">
                Inicia sesión
              </Link>
            </p>
            <p className="text-slate-400 text-xs">
              ¿Eres ciudadano?{' '}
              <Link to="/registro" className="text-blue-500 hover:text-blue-600 transition-colors">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
