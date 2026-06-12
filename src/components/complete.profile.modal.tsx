import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  UserCheck, Eye, EyeOff, AlertCircle, CheckCircle2,
  User as UserIcon, CreditCard, Lock, Phone, X,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'

const profile_schema = z.object({
  first_name: z.string().min(2, 'Mínimo 2 caracteres'),
  last_name: z.string().min(2, 'Mínimo 2 caracteres'),
  national_id: z.string().regex(/^\d{10}$/, 'La cédula debe tener exactamente 10 dígitos'),
  phone: z.string().optional(),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Necesita mayúscula, minúscula y número'),
  confirm_password: z.string(),
}).refine(d => d.password === d.confirm_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm_password'],
})

type ProfileForm = z.infer<typeof profile_schema>

interface Props {
  onSuccess?: () => void
  onClose?: () => void
  allowClose?: boolean
}

export function CompleteProfileModal({ onSuccess, onClose, allowClose = false }: Props) {
  const { completeProfile, is_loading, error, clearError, user } = useAuthStore()
  const [show_pwd, set_show_pwd] = useState(false)
  const [done, set_done] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({ resolver: zodResolver(profile_schema) })

  // Clear errors on mount
  useEffect(() => { clearError() }, [clearError])

  const onSubmit = async (data: ProfileForm) => {
    clearError()
    try {
      await completeProfile({
        first_name: data.first_name,
        last_name: data.last_name,
        national_id: data.national_id,
        password: data.password,
        phone: data.phone,
      })
      set_done(true)
      setTimeout(() => onSuccess?.(), 900)
    } catch {
      // Error is handled in store
    }
  }

  return createPortal(
    /* ── Overlay ──────────────────────────────────────────────── */
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full max-w-md animate-slide-up relative bg-slate-900"
        style={{
          background: 'linear-gradient(135deg, rgba(24,24,40,0.98) 0%, rgba(18,18,30,0.98) 100%)',
          border: '1px solid rgba(37,99,235,0.2)',
          borderRadius: '1.25rem',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(37,99,235,0.06)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Close Button (only if allowClose) */}
        {allowClose && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors text-slate-500 hover:text-blue-500"
          >
            <X size={18} />
          </button>
        )}

        <div className="p-7">
          {done ? (
            /* ── State: Success ───────────────────────── */
            <div className="text-center py-8 animate-fade-in">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(46,139,87,0.15)', border: '2px solid rgba(46,139,87,0.4)' }}
              >
                <CheckCircle2 size={40} style={{ color: '#2E8B57' }} />
              </div>
              <h2 className="font-heading text-2xl font-bold text-blue-950 mb-2">
                ¡Perfil completado!
              </h2>
              <p className="text-sm" style={{ color: 'rgba(160,180,140,0.7)' }}>
                Tu cuenta está activa. Continuando…
              </p>
            </div>
          ) : (
            <>
              {/* ── Header ─────────────────────────────── */}
              <div className="mb-6">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-blue-950/20 border border-blue-500/20"
                >
                  <UserCheck size={22} className="text-blue-500" />
                </div>
                <h2 className="font-heading text-xl font-bold text-blue-950 mb-1">
                  Completa tu perfil
                </h2>
                <p className="text-sm leading-relaxed text-slate-400">
                  Para crear trámites necesitamos verificar tu identidad.
                  Estos datos son requeridos por la normativa de la LOPDP.
                </p>
                {user?.email && (
                  <p className="text-xs mt-2 text-blue-500/50">
                    Cuenta: <strong className="text-blue-500/80">{user.email}</strong>
                  </p>
                )}
              </div>

              {/* ── Global Error ───────────────────────── */}
              {error && (
                <div
                  className="flex items-start gap-3 p-3 rounded-xl text-sm mb-5 bg-red-500/10 border border-red-500/30 text-red-400"
                >
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {/* ── Form ─────────────────────────── */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                {/* First Name + Last Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label flex items-center gap-1">
                      <UserIcon size={11} /> Nombre
                    </label>
                    <input
                      {...register('first_name')}
                      id="profile-first-name"
                      className="input-field"
                      placeholder="Juan"
                      autoFocus
                    />
                    {errors.first_name && (
                      <p className="input-error"><AlertCircle size={11} />{errors.first_name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="input-label">Apellido</label>
                    <input
                      {...register('last_name')}
                      id="profile-last-name"
                      className="input-field"
                      placeholder="Pérez"
                    />
                    {errors.last_name && (
                      <p className="input-error"><AlertCircle size={11} />{errors.last_name.message}</p>
                    )}
                  </div>
                </div>

                {/* National ID */}
                <div>
                  <label className="input-label flex items-center gap-1">
                    <CreditCard size={11} /> Número de cédula
                  </label>
                  <input
                    {...register('national_id')}
                    id="profile-national-id"
                    className="input-field"
                    placeholder="0102030405"
                    maxLength={10}
                  />
                  {errors.national_id && (
                    <p className="input-error"><AlertCircle size={11} />{errors.national_id.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="input-label flex items-center gap-1">
                    <Phone size={11} /> Teléfono <span className="text-slate-500">(opcional)</span>
                  </label>
                  <input
                    {...register('phone')}
                    id="profile-phone"
                    className="input-field"
                    placeholder="0987654321"
                  />
                </div>

                {/* Password Fields */}
                <div className="border-t border-blue-500/10 pt-3">
                  <p className="text-xs mb-3 text-slate-500">
                    <Lock size={10} className="inline mr-1" />
                    Crea una contraseña para iniciar sesión en el futuro
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="input-label">Contraseña</label>
                      <div className="relative">
                        <input
                          {...register('password')}
                          type={show_pwd ? 'text' : 'password'}
                          id="profile-password"
                          className="input-field pr-12"
                          placeholder="Mínimo 8 caracteres"
                        />
                        <button
                          type="button"
                          onClick={() => set_show_pwd(!show_pwd)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {show_pwd ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="input-error"><AlertCircle size={11} />{errors.password.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="input-label">Confirmar contraseña</label>
                      <input
                        {...register('confirm_password')}
                        type={show_pwd ? 'text' : 'password'}
                        id="profile-confirm-password"
                        className="input-field"
                        placeholder="Repite la contraseña"
                      />
                      {errors.confirm_password && (
                        <p className="input-error"><AlertCircle size={11} />{errors.confirm_password.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  id="profile-submit"
                  disabled={is_loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all text-white"
                  style={{
                    background: is_loading
                      ? 'rgba(37,99,235,0.15)'
                      : 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #1E40AF 100%)',
                    boxShadow: is_loading ? 'none' : '0 0 24px rgba(37,99,235,0.3)',
                  }}
                >
                  {is_loading ? (
                    <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  ) : (
                    <><UserCheck size={18} /> Activar mi cuenta</>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
