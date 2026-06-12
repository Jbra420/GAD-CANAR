import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  MapPin, FileText, CheckCircle2, ArrowRight, ArrowLeft,
  AlertCircle, Building2, Upload, X, Factory, Layers, HardHat, User,
  Search, UserCheck,
} from 'lucide-react'
import { applications_api, attachments_api } from '@/lib/api.calls'
import { mapUser, type User as AuthUser } from '@/stores/auth.store'
import { cn } from '@/lib/utils'
import api from '@/lib/api'

type ProcedureType = 'LINEA_FABRICAS' | 'APROBACION_PLANOS' | 'PERMISO_CONSTRUCCION'

const PROCEDURES = [
  {
    value: 'LINEA_FABRICAS' as ProcedureType,
    label: 'Línea de Fábricas',
    desc: 'Certificado que establece el lindero frontal de un predio respecto a la vía pública.',
    icon: <Factory size={28} />,
    color: '#D97706',
    docs: ['Título de propiedad', 'Cédula del propietario', 'Ficha catastral', 'Plano de ubicación', 'Copia de Cédula del Profesional'],
  },
  {
    value: 'APROBACION_PLANOS' as ProcedureType,
    label: 'Aprobación de Planos',
    desc: 'Revisión y aprobación técnica de planos arquitectónicos y estructurales.',
    icon: <Layers size={28} />,
    color: '#2563EB',
    docs: ['Título de propiedad', 'Planos arquitectónicos', 'Planos estructurales', 'Memoria de cálculo', 'Cédula del propietario', 'Copia de Cédula del Profesional'],
  },
  {
    value: 'PERMISO_CONSTRUCCION' as ProcedureType,
    label: 'Permiso de Construcción',
    desc: 'Autorización municipal para ejecutar obras de construcción, ampliación o remodelación.',
    icon: <HardHat size={28} />,
    color: '#2E8B57',
    docs: ['Título de propiedad', 'Planos aprobados', 'Contrato con profesional', 'Cédula del propietario', 'Pago de impuesto predial', 'Copia de Cédula del Profesional'],
  },
]

const step2Schema = z.object({
  procedure_type: z.enum(['LINEA_FABRICAS', 'APROBACION_PLANOS', 'PERMISO_CONSTRUCCION'], {
    required_error: 'Selecciona el tipo de trámite',
  }),
  location: z.enum(['URBAN', 'RURAL'], { required_error: 'Selecciona la ubicación' }),
  address: z.string().min(5, 'Ingresa la dirección del predio'),
  area: z.coerce.number().optional(),
  description: z.string().optional(),
})
type Step2Form = z.infer<typeof step2Schema>

const STEPS = [
  { num: 1, label: 'Propietario', icon: User },
  { num: 2, label: 'Tipo de Trámite', icon: FileText },
  { num: 3, label: 'Datos del Predio', icon: MapPin },
  { num: 4, label: 'Documentos', icon: Upload },
  { num: 5, label: 'Confirmación', icon: CheckCircle2 },
]

export function NewProcedure() {
  const navigate = useNavigate()
  const [step, set_step] = useState(1)

  // Paso 1: propietario
  const [national_id_search, set_national_id_search] = useState('')
  const [is_searching, set_is_searching] = useState(false)
  const [citizen_found, set_citizen_found] = useState<AuthUser | null>(null)
  const [citizen_national_id, set_citizen_national_id] = useState<string>('')

  // Pasos siguientes
  const [selected_procedure, set_selected_procedure] = useState<ProcedureType | null>(null)
  const [application_id, set_application_id] = useState<string | null>(null)
  const [files, set_files] = useState<File[]>([])
  const [upload_progress, set_upload_progress] = useState<Record<string, boolean>>({})
  const [is_loading, set_is_loading] = useState(false)
  const [error, set_error] = useState<string | null>(null)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Step2Form>({
    resolver: zodResolver(step2Schema),
    defaultValues: { location: 'URBAN' },
  })

  const procedure_info = PROCEDURES.find(t => t.value === selected_procedure)

  // ── PASO 1: Buscar propietario por cédula ──
  const searchCitizen = async () => {
    if (!national_id_search || national_id_search.length !== 10) {
      set_error('La cédula debe tener 10 dígitos')
      return
    }
    set_is_searching(true)
    set_error(null)
    try {
      const { data } = await api.get(`/users?cedula=${national_id_search}&limit=1`)
      const users = data.data || []
      const citizen = users.find((u: any) => u.cedula === national_id_search)
      if (citizen) {
        set_citizen_found(mapUser(citizen))
      } else {
        set_citizen_found(null)
      }
      set_citizen_national_id(national_id_search)
    } catch {
      set_citizen_national_id(national_id_search)
      set_citizen_found(null)
    } finally {
      set_is_searching(false)
    }
  }

  const onStep1Next = () => {
    if (!citizen_national_id) {
      set_error('Ingresa la cédula del propietario del predio')
      return
    }
    set_error(null)
    set_step(2)
  }

  // ── PASO 2: Selección de tipo de trámite ──
  const onStep2Next = () => {
    if (!selected_procedure) {
      set_error('Selecciona el tipo de trámite para continuar')
      return
    }
    set_error(null)
    setValue('procedure_type', selected_procedure)
    set_step(3)
  }

  // ── PASO 3: Crear solicitud con datos del predio ──
  const onStep3 = async (data: Step2Form) => {
    set_is_loading(true)
    set_error(null)
    try {
      const payload = {
        tipoTramite: selected_procedure,
        ubicacion: data.location === 'URBAN' ? 'URBANO' : 'RURAL',
        direccion: data.address,
        area: data.area,
        descripcion: data.description,
        ciudadanoCedula: citizen_national_id,
      }
      const { data: res } = await applications_api.create(payload)
      set_application_id(res.id)
      set_step(4)
    } catch (e: any) {
      set_error(e.response?.data?.message || 'Error al crear la solicitud')
    } finally {
      set_is_loading(false)
    }
  }

  // ── PASO 4: Subir archivos ──
  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file_list = Array.from(e.target.files ?? [])
    const valid = file_list.filter(f => {
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(f.type)) {
        set_error(`"${f.name}" no es un tipo válido (PDF, JPG, PNG)`)
        return false
      }
      if (f.size > 10 * 1024 * 1024) {
        set_error(`"${f.name}" supera el límite de 10 MB`)
        return false
      }
      return true
    })
    set_files(prev => [...prev, ...valid])
    set_error(null)
  }

  const uploadFiles = async () => {
    if (!application_id) return
    set_is_loading(true)
    set_error(null)
    try {
      for (const file of files) {
        set_upload_progress(p => ({ ...p, [file.name]: false }))
        await attachments_api.upload(application_id, file)
        set_upload_progress(p => ({ ...p, [file.name]: true }))
      }
      set_step(5)
    } catch (e: any) {
      set_error(e.response?.data?.message || 'Error al subir archivos')
    } finally {
      set_is_loading(false)
    }
  }

  // ── PASO 5: Enviar ──
  const handleSubmitApplication = async () => {
    if (!application_id) return
    set_is_loading(true)
    set_error(null)
    try {
      await applications_api.send(application_id)
      navigate(`/architect/procedures/${application_id}`)
    } catch (e: any) {
      set_error(e.response?.data?.message || 'Error al enviar la solicitud')
    } finally {
      set_is_loading(false)
    }
  }

  const ARCHITECT_COLOR = '#D97706'

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-blue-955">Nuevo Trámite</h1>
        <p className="text-blue-800 mt-1 text-sm">Inicia un trámite en nombre del ciudadano propietario del predio</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex items-center gap-1 flex-1">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0',
              step > s.num ? 'bg-green-500 text-white' :
              step === s.num ? 'text-white shadow-lg' :
              'bg-slate-200 text-slate-500',
            )}
              style={step === s.num ? { background: `linear-gradient(135deg, ${ARCHITECT_COLOR} 0%, #B45309 100%)` } : {}}>
              {step > s.num ? <CheckCircle2 size={14} /> : s.num}
            </div>
            <span className={cn(
              'text-xs font-medium hidden sm:block',
              step >= s.num ? 'text-blue-955' : 'text-slate-400'
            )}>{s.label}</span>
            {i < STEPS.length - 1 && (
              <div className={cn('flex-1 h-px ml-1', step > s.num ? 'bg-green-500' : 'bg-slate-200')} />
            )}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ── PASO 1: Propietario ── */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="glass-card p-6 space-y-5">
            <div>
              <h2 className="font-heading font-semibold text-blue-955 mb-1 flex items-center gap-2">
                <User size={18} style={{ color: ARCHITECT_COLOR }} />
                Datos del propietario del predio
              </h2>
              <p className="text-slate-500 text-sm">
                Ingresa la cédula del ciudadano propietario. Si no tiene cuenta en el sistema, se le creará automáticamente.
              </p>
            </div>

            <div>
              <label className="input-label">Cédula del Propietario *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={national_id_search}
                  onChange={e => {
                    set_national_id_search(e.target.value.replace(/\D/g, '').slice(0, 10))
                    set_citizen_found(null)
                    set_citizen_national_id('')
                  }}
                  className="input-field flex-1"
                  placeholder="0102030405"
                  maxLength={10}
                  id="propietario-cedula"
                />
                <button
                  type="button"
                  onClick={searchCitizen}
                  disabled={is_searching || national_id_search.length !== 10}
                  className="px-4 py-2 rounded-xl font-semibold text-white text-sm flex items-center gap-2 transition-all"
                  style={{ background: `linear-gradient(135deg, ${ARCHITECT_COLOR} 0%, #B45309 100%)`, opacity: national_id_search.length !== 10 ? 0.5 : 1 }}
                >
                  {is_searching ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search size={16} />}
                  Buscar
                </button>
              </div>
            </div>

            {/* Resultado de búsqueda */}
            {citizen_national_id && (
              <div className={cn(
                'p-4 rounded-xl border',
                citizen_found
                  ? 'bg-green-50 border-green-200'
                  : 'border-blue-200'
              )}
                style={!citizen_found ? { background: 'rgba(37,99,235,0.04)' } : {}}>
                {citizen_found ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <UserCheck size={18} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-blue-955">
                        {citizen_found.first_name} {citizen_found.last_name}
                      </p>
                      <p className="text-sm text-slate-500">CI: {citizen_found.national_id} • {citizen_found.email}</p>
                      <p className="text-xs text-green-600 font-semibold mt-0.5">✅ Ciudadano registrado en el sistema</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(37,99,235,0.1)' }}>
                      <User size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-blue-955">Cédula: {citizen_national_id}</p>
                      <p className="text-sm text-slate-500">Ciudadano no registrado aún</p>
                      <p className="text-xs text-blue-600 font-semibold mt-0.5">
                        ℹ️ Se creará una cuenta básica al registrar el trámite
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onStep1Next}
            disabled={!citizen_national_id}
            id="step1-next"
            className="btn-primary w-full"
            style={{ background: citizen_national_id ? `linear-gradient(135deg, ${ARCHITECT_COLOR} 0%, #B45309 100%)` : '', border: 'none', opacity: !citizen_national_id ? 0.5 : 1 }}
          >
            <span>Continuar</span><ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* ── PASO 2: Tipo de trámite ── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h2 className="font-heading font-semibold text-blue-955 mb-1">Selecciona el tipo de trámite</h2>
            <p className="text-slate-500 text-sm mb-5">El GAD Municipal ofrece tres procesos de ordenamiento territorial</p>

            <div className="space-y-3">
              {PROCEDURES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set_selected_procedure(t.value)}
                  className={cn(
                    'w-full text-left p-5 rounded-2xl border-2 transition-all group',
                    selected_procedure === t.value
                      ? 'shadow-lg'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                  )}
                  style={selected_procedure === t.value ? {
                    borderColor: t.color,
                    background: `${t.color}08`,
                    boxShadow: `0 4px 24px ${t.color}20`,
                  } : {}}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl flex-shrink-0"
                      style={{
                        background: selected_procedure === t.value ? `${t.color}20` : 'rgba(0,0,0,0.04)',
                        color: selected_procedure === t.value ? t.color : '#64748b',
                      }}>
                      {t.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-blue-955">{t.label}</p>
                        {selected_procedure === t.value && <CheckCircle2 size={20} style={{ color: t.color }} />}
                      </div>
                      <p className="text-slate-500 text-sm mt-1 leading-relaxed">{t.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => set_step(1)} className="btn-secondary flex-1">
              <ArrowLeft size={18} /> Atrás
            </button>
            <button type="button" onClick={onStep2Next} disabled={!selected_procedure} id="step2-next" className="btn-primary flex-1"
              style={{ background: selected_procedure ? `linear-gradient(135deg, ${ARCHITECT_COLOR} 0%, #B45309 100%)` : '', border: 'none' }}>
              <span>Continuar</span><ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ── PASO 3: Datos del predio ── */}
      {step === 3 && (
        <form onSubmit={handleSubmit(onStep3)} className="space-y-4">
          {procedure_info && (
            <div className="flex items-center gap-3 p-4 rounded-xl"
              style={{ background: `${procedure_info.color}10`, border: `1px solid ${procedure_info.color}30` }}>
              <div style={{ color: procedure_info.color }}>{procedure_info.icon}</div>
              <div>
                <p className="font-bold text-blue-955 text-sm">{procedure_info.label}</p>
                <p className="text-slate-500 text-xs">Para: CI {citizen_national_id} {citizen_found ? `— ${citizen_found.first_name} ${citizen_found.last_name}` : ''}</p>
              </div>
            </div>
          )}

          <div className="glass-card p-6 space-y-5">
            <div>
              <label className="input-label">Ubicación del Predio *</label>
              <div className="grid grid-cols-2 gap-3">
                {(['URBAN', 'RURAL'] as const).map(u => (
                  <label key={u} className={cn(
                    'flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all',
                    watch('location') === u ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'
                  )}>
                    <input {...register('location')} type="radio" value={u} className="sr-only" />
                    <Building2 size={18} className={watch('location') === u ? 'text-blue-600' : 'text-slate-400'} />
                    <span className={cn('font-medium text-sm', watch('location') === u ? 'text-blue-700' : 'text-blue-800')}>
                      {u === 'URBAN' ? '🏙️ Urbano' : '🌾 Rural'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="input-label">Dirección del Predio *</label>
              <input {...register('address')} id="predio-direccion" className="input-field"
                placeholder="Av. Los Cerezos y Calle 5, sector norte" />
              {errors.address && <p className="input-error"><AlertCircle size={12} />{errors.address.message}</p>}
            </div>

            <div>
              <label className="input-label">Área del Predio (m²) <span className="text-slate-400 normal-case">— opcional</span></label>
              <input {...register('area')} type="number" step="0.01" id="predio-area" className="input-field" placeholder="150.5" />
            </div>

            <div>
              <label className="input-label">Descripción adicional <span className="text-slate-400 normal-case">— opcional</span></label>
              <textarea {...register('description')} id="predio-descripcion" className="input-field resize-none" rows={3}
                placeholder="Información adicional sobre el predio o el trámite..." />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => set_step(2)} className="btn-secondary flex-1">
              <ArrowLeft size={18} /> Atrás
            </button>
            <button type="submit" disabled={is_loading} id="step3-next" className="btn-primary flex-1"
              style={{ background: `linear-gradient(135deg, ${ARCHITECT_COLOR} 0%, #B45309 100%)`, border: 'none' }}>
              {is_loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Siguiente</span><ArrowRight size={18} /></>}
            </button>
          </div>
        </form>
      )}

      {/* ── PASO 4: Documentos ── */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="glass-card p-6 space-y-5">
            <div>
              <h2 className="font-heading font-semibold text-blue-955 mb-1">Adjunta los documentos requeridos</h2>
              <p className="text-slate-500 text-sm">Escaneados en PDF o fotos JPG/PNG. Máximo 10 MB por archivo.</p>
            </div>

            {procedure_info && (
              <div className="p-4 rounded-xl" style={{ background: `${procedure_info.color}08`, border: `1px solid ${procedure_info.color}20` }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: procedure_info.color }}>
                  📋 Documentos para {procedure_info.label}
                </p>
                <ul className="space-y-1">
                  {procedure_info.docs.map(doc => (
                    <li key={doc} className="flex items-center gap-2 text-sm text-slate-600 text-left">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: procedure_info.color }} />
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <label className="block border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-xl p-8 text-center cursor-pointer transition-all group bg-white">
              <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileAdd} className="sr-only" id="file-upload" />
              <Upload size={32} className="text-slate-400 group-hover:text-amber-500 mx-auto mb-3 transition-colors" />
              <p className="text-slate-600 group-hover:text-amber-700 transition-colors font-medium">
                Haz clic o arrastra archivos aquí
              </p>
              <p className="text-slate-400 text-sm mt-1">PDF, JPG, PNG — máximo 10 MB</p>
            </label>

            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <FileText size={18} className="text-amber-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-blue-955 text-sm font-medium truncate">{f.name}</p>
                      <p className="text-slate-400 text-xs">{(f.size / 1024).toFixed(1)} KB</p>
                    </div>
                    {upload_progress[f.name] === true && <CheckCircle2 size={16} className="text-green-500" />}
                    <button type="button"
                      onClick={() => set_files(prev => prev.filter((_, j) => j !== i))}
                      className="text-slate-400 hover:text-red-500 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => set_step(3)} className="btn-secondary flex-1">
              <ArrowLeft size={18} /> Atrás
            </button>
            <button type="button" id="step4-upload" disabled={is_loading || files.length === 0}
              onClick={uploadFiles} className="btn-primary flex-1"
              style={{ background: `linear-gradient(135deg, ${ARCHITECT_COLOR} 0%, #B45309 100%)`, border: 'none', opacity: files.length === 0 ? 0.5 : 1 }}>
              {is_loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Upload size={18} /> Subir y continuar</>}
            </button>
          </div>
        </div>
      )}

      {/* ── PASO 5: Confirmación y envío ── */}
      {step === 5 && (
        <div className="glass-card p-6 space-y-5">
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(217,119,6,0.15)', border: `2px solid rgba(217,119,6,0.4)` }}>
              <CheckCircle2 size={32} style={{ color: ARCHITECT_COLOR }} />
            </div>
            <h2 className="font-heading font-bold text-blue-955 text-xl mb-2">¡Todo listo para enviar!</h2>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Al confirmar, la solicitud será enviada a la Secretaría del GAD para verificación documental.
            </p>
          </div>

          {/* Resumen */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50">
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.2)' }}>
              <User size={16} style={{ color: ARCHITECT_COLOR }} />
              <div className="text-left">
                <p className="font-bold text-blue-955 text-sm">
                  {citizen_found ? `${citizen_found.first_name} ${citizen_found.last_name}` : `Propietario CI: ${citizen_national_id}`}
                </p>
                <p className="text-slate-400 text-xs">Ciudadano propietario del predio</p>
              </div>
            </div>
            {procedure_info && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: `${procedure_info.color}15`, color: procedure_info.color }}>
                  {procedure_info.icon}
                </div>
                <div className="text-left">
                  <p className="font-bold text-blue-955 text-sm">{procedure_info.label}</p>
                  <p className="text-slate-400 text-xs">Tipo de trámite</p>
                </div>
              </div>
            )}
            <div className="h-px bg-slate-200" />
            <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
              <CheckCircle2 size={14} /> Datos del predio registrados
            </div>
            <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
              <CheckCircle2 size={14} /> {files.length} documento(s) adjuntado(s)
            </div>
          </div>

          {/* Flujo */}
          <div className="p-4 rounded-xl" style={{ background: 'rgba(217,119,6,0.04)', border: '1px solid rgba(217,119,6,0.1)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3 text-left" style={{ color: ARCHITECT_COLOR }}>Flujo de revisión</p>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { label: 'Secretaría', desc: 'Verifica docs', color: '#D97706' },
                { label: 'Técnico', desc: 'Evalúa predio', color: '#2E8B57' },
                { label: 'Financiero', desc: 'Gestiona cobro', color: '#7C3AED' },
                { label: 'Resultado', desc: 'Notifica al ciudadano', color: '#2563EB' },
              ].map((item, i, arr) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mx-auto"
                      style={{ background: item.color }}>
                      {i + 1}
                    </div>
                    <p className="text-xs font-semibold mt-1" style={{ color: item.color }}>{item.label}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                  {i < arr.length - 1 && <ArrowRight size={14} className="text-slate-300 flex-shrink-0 mb-4" />}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-200 pt-4">
            Al enviar, confirmas que los datos son verídicos y actúas como representante
            técnico del ciudadano para este trámite.
          </p>

          <div className="flex gap-3">
            <button type="button" onClick={() => set_step(4)} className="btn-secondary flex-1">
              <ArrowLeft size={18} /> Atrás
            </button>
            <button type="button" id="step5-enviar" disabled={is_loading} onClick={handleSubmitApplication}
              className="btn-primary flex-1"
              style={{ background: `linear-gradient(135deg, ${ARCHITECT_COLOR} 0%, #B45309 100%)`, border: 'none' }}>
              {is_loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><FileText size={18} /> Confirmar y Enviar</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
