import { useEffect, useState } from 'react'
import { FileCheck2, Clock, CheckCircle2, XCircle, Inbox, TrendingUp } from 'lucide-react'
import { applications_api } from '@/lib/api.calls'
import { Link } from 'react-router-dom'
import { formatDateTime } from '@/lib/utils'

const BRAND = '#D97706'

const TIPO_LABEL: Record<string, string> = {
  PERMISO_CONSTRUCCION: 'Permiso de Construcción',
  LINEA_FABRICAS: 'Línea de Fábricas',
  APROBACION_PLANOS: 'Aprobación de Planos',
}

interface Application {
  id: string
  status: string
  procedure_type: string
  created_at: string
  citizen?: {
    first_name: string
    last_name: string
  } | null
}

export function SecretaryDashboard() {
  const [applications, set_applications] = useState<Application[]>([])
  const [is_loading, set_is_loading] = useState(true)

  useEffect(() => {
    applications_api.list({ limit: 100 })
      .then(({ data }) => {
        const mapped = (data.data || []).map((s: any) => ({
          id: s.id,
          status: s.estado,
          procedure_type: s.tipoTramite,
          created_at: s.createdAt,
          citizen: s.ciudadano ? {
            first_name: s.ciudadano.nombre,
            last_name: s.ciudadano.apellido
          } : null
        }))
        set_applications(mapped)
      })
      .catch(() => set_applications([]))
      .finally(() => set_is_loading(false))
  }, [])

  const pending_applications = applications.filter(s => s.status === 'PENDIENTE_SECRETARIA')
  const observed_applications = applications.filter(s => s.status === 'OBSERVADO')
  const total = applications.length

  const stats = [
    { label: 'Pendientes de Revisión', value: pending_applications.length, icon: Clock, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    { label: 'En Proceso', value: applications.filter(s => ['EN_REVISION_TECNICA', 'INSPECCION'].includes(s.status)).length, icon: CheckCircle2, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Devueltas con Obs.', value: observed_applications.length, icon: XCircle, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
    { label: 'Total Histórico', value: total, icon: TrendingUp, color: BRAND, bg: `rgba(217,119,6,0.1)` },
  ]
  
  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-blue-955">Panel de Secretaría</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Revisión documental — verificación de firma y completitud
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl p-5 border"
            style={{ background: 'white', borderColor: '#e2e8f0', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: s.bg }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-3xl font-black" style={{ color: '#1e293b' }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: '#64748b' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Flujo de etapas — orientación visual */}
      <div className="rounded-2xl p-6 border" style={{ background: 'white', borderColor: '#e2e8f0' }}>
        <h2 className="font-bold text-blue-955 mb-4 text-left">Etapas del Proceso</h2>
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {[
            { label: 'Ciudadano\nSube docs', color: '#2563EB', active: false },
            { label: 'Secretaría\nRevisa', color: BRAND, active: true },
            { label: 'Técnico\nEvalúa', color: '#2E8B57', active: false },
            { label: 'Financiero\nCobra', color: '#7C3AED', active: false },
            { label: 'Aprobado', color: '#10B981', active: false },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold transition-all ${step.active ? 'ring-4' : ''}`}
                  style={{
                    background: step.active ? step.color : '#e2e8f0',
                    color: step.active ? 'white' : '#94a3b8',
                    '--tw-ring-color': step.active ? `${step.color}40` : 'transparent',
                    boxShadow: step.active ? `0 0 20px ${step.color}50` : 'none',
                  } as React.CSSProperties}>
                  {i + 1}
                </div>
                <p className="text-center mt-2 text-xs font-semibold whitespace-pre-line leading-tight"
                  style={{ color: step.active ? step.color : '#94a3b8', maxWidth: 72 }}>
                  {step.label}
                </p>
              </div>
              {i < arr.length - 1 && (
                <div className="w-8 sm:w-16 h-0.5 mx-1 flex-shrink-0" style={{ background: '#e2e8f0' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Solicitudes recientes */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'white', borderColor: '#e2e8f0' }}>
        <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: '#f1f5f9' }}>
          <Inbox size={18} style={{ color: BRAND }} />
          <h2 className="font-bold text-blue-955">Solicitudes Pendientes de Revisión</h2>
        </div>
        <div className="divide-y" style={{ borderColor: '#f8fafc' }}>
          {is_loading ? (
            <div className="p-6 space-y-4">
              <div className="h-12 rounded-xl shimmer" />
              <div className="h-12 rounded-xl shimmer" />
            </div>
          ) : pending_applications.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No hay solicitudes pendientes de revisión
            </div>
          ) : (
            pending_applications.slice(0, 5).map((sol) => (
              <Link to={`/secretary/inbox/${sol.id}`} key={sol.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer block">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-left"
                    style={{ background: `${BRAND}12`, border: `1px solid ${BRAND}20` }}>
                    <FileCheck2 size={16} style={{ color: BRAND }} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-blue-955 text-sm">{sol.citizen?.first_name} {sol.citizen?.last_name}</p>
                    <p style={{ color: '#64748b', fontSize: '0.75rem' }}>#{sol.id.slice(0,8)} · {TIPO_LABEL[sol.procedure_type] || 'Trámite'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs px-3 py-1 rounded-full font-semibold"
                    style={{
                      background: 'rgba(245,158,11,0.1)',
                      color: '#D97706',
                    }}>
                    {sol.status.replace('_', ' ')}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>{formatDateTime(sol.created_at)}</span>
                </div>
              </Link>
            ))
          )}
        </div>
        <div className="px-6 py-3 text-center border-t" style={{ borderColor: '#f1f5f9' }}>
          <Link to="/secretary/inbox" className="text-sm font-semibold" style={{ color: BRAND }}>
            Ver bandeja completa →
          </Link>
        </div>
      </div>

    </div>
  )
}
