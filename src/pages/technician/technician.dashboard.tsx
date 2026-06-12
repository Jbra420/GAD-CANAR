import { useEffect, useState } from 'react'
import { Inbox, CheckCircle2, Clock, MapPin, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { applications_api } from '@/lib/api.calls'
import { Link } from 'react-router-dom'

interface Application {
  id: string
  procedure_type: string
  property?: { address: string } | null
  created_at: string
  status: string
}

export function TechnicianDashboard() {
  const { user } = useAuthStore()
  const [applications, set_applications] = useState<Application[]>([])
  const [is_loading, set_is_loading] = useState(true)

  useEffect(() => {
    applications_api.list({ limit: 100 })
      .then(({ data }) => {
        const mapped = (data.data || []).map((s: any) => ({
          id: s.id,
          procedure_type: s.tipoTramite,
          property: s.predio ? {
            address: s.predio.direccion
          } : null,
          created_at: s.createdAt,
          status: s.estado
        }))
        set_applications(mapped)
      })
      .catch(() => set_applications([]))
      .finally(() => set_is_loading(false))
  }, [])

  const assigned_applications = applications.filter(s => ['EN_REVISION_TECNICA', 'UNDER_REVIEW'].includes(s.status))
  const inspection_applications = applications.filter(s => ['INSPECCION', 'INSPECTION'].includes(s.status))
  const resolved_applications = applications.filter(s =>
    ['APPROVED', 'REJECTED', 'PENDING_PAYMENT', 'PAID', 'APROBADO', 'NEGADO', 'PENDIENTE_PAGO', 'PAGADO'].includes(s.status)
  )

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-blue-955">Bienvenido, Tec. {user?.first_name}</h1>
        <p className="text-blue-800 mt-1">Gestiona los trámites asignados a tu zona.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {([
          { label: 'En Revisión (Nuevos)', value: assigned_applications.length, icon: Inbox, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { label: 'En Inspección', value: inspection_applications.length, icon: MapPin, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Resueltos', value: resolved_applications.length, icon: CheckCircle2, color: 'text-success-400', bg: 'bg-success/10' },
        ] as const).map(s => (
          <div key={s.label} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon size={20} className={s.color} />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-blue-955">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="glass-card p-6">
        <div className="flex items-center justify-between border-b border-surface-border pb-4 mb-4">
          <h2 className="font-heading font-semibold text-blue-955 flex items-center gap-2">
            <Clock size={18} className="text-primary-400" />
            Trámites Pendientes de Revisión
          </h2>
          <Link to="/technician/inbox" className="text-sm font-semibold text-primary-400 hover:text-primary-400 transition-colors">
            Ver todos →
          </Link>
        </div>
        
        <div className="divide-y divide-surface-border">
          {is_loading ? (
            <div className="py-4 space-y-4">
              <div className="h-12 rounded-xl shimmer" />
            </div>
          ) : assigned_applications.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              No tienes trámites pendientes de revisión en este momento.
            </div>
          ) : (
            assigned_applications.slice(0, 5).map(app => (
              <Link to={`/technician/inbox/${app.id}`} key={app.id} className="flex items-center justify-between py-4 group">
                <div>
                  <p className="font-semibold text-blue-955">{app.procedure_type || 'Trámite'}</p>
                  <p className="text-xs text-slate-500">#{app.id.slice(0,8).toUpperCase()} · {app.property?.address || 'Sin dirección'}</p>
                </div>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-850 transition-colors" />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

