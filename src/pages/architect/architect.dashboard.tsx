import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText, Clock, CheckCircle2, XCircle, PlusCircle, ArrowRight,
  AlertCircle, HardHat, User, TrendingUp, ShieldAlert,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/lib/api'
import { ApplicationTimeline } from '@/components/application.timeline'

const BLUE = '#2563EB'
const GOLD = '#F5C100'

interface Application {
  id: string
  status: string
  procedure_type: string
  property?: { address: string } | null
  citizen?: { first_name: string; last_name: string; national_id?: string } | null
  created_at: string
}

function PendienteHabilitacionBanner() {
  return (
    <div className="rounded-2xl border p-6 mb-6 animate-fade-in"
      style={{ background: 'rgba(245,193,0,0.06)', borderColor: 'rgba(245,193,0,0.3)' }}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(245,193,0,0.15)', color: GOLD }}>
          <ShieldAlert size={24} />
        </div>
        <div>
          <h2 className="font-heading font-bold text-blue-955 text-lg">Cuenta pendiente de habilitación</h2>
          <p className="text-slate-600 mt-1 text-sm leading-relaxed">
            Tu registro fue recibido correctamente. La Secretaría del GAD Municipal de Cañar validará
            tu título profesional y número de registro SENESCYT antes de que puedas iniciar trámites.
            Este proceso toma entre 1 y 2 días laborables.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(245,193,0,0.12)', color: '#B08A00', border: '1px solid rgba(245,193,0,0.3)' }}>
              <AlertCircle size={12} /> Revisión en proceso
            </div>
            <p className="text-slate-500 text-xs self-center">
              Contacto: secretaria@gad-canar.gob.ec
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ArchitectDashboard() {
  const { user } = useAuthStore()
  const [applications, set_applications] = useState<Application[]>([])
  const [is_loading, set_is_loading] = useState(true)

  const is_enabled = user?.is_enabled === true

  useEffect(() => {
    api.get('/solicitudes/mis-solicitudes').then(({ data }) => {
      const mapped = (data.data || []).map((s: any) => ({
        id: s.id,
        status: s.estado,
        procedure_type: s.tipoTramite,
        property: s.predio ? {
          address: s.predio.direccion
        } : null,
        citizen: s.ciudadano ? {
          first_name: s.ciudadano.nombre,
          last_name: s.ciudadano.apellido,
          national_id: s.ciudadano.cedula
        } : null,
        created_at: s.createdAt
      }))
      set_applications(mapped)
    }).catch(() => {
      set_applications([])
    }).finally(() => set_is_loading(false))
  }, [])

  const stats = [
    {
      label: 'Total Trámites',
      value: applications.length,
      icon: FileText,
      color: BLUE,
      bg: 'rgba(37,99,235,0.1)',
    },
    {
      label: 'En Proceso',
      value: applications.filter(s => !['APROBADO', 'RECHAZADO', 'BORRADOR'].includes(s.status)).length,
      icon: Clock,
      color: GOLD,
      bg: 'rgba(245,193,0,0.1)',
    },
    {
      label: 'Aprobados',
      value: applications.filter(s => s.status === 'APROBADO').length,
      icon: CheckCircle2,
      color: '#22C55E',
      bg: 'rgba(34,197,94,0.1)',
    },
    {
      label: 'Rechazados',
      value: applications.filter(s => s.status === 'RECHAZADO').length,
      icon: XCircle,
      color: '#EF4444',
      bg: 'rgba(239,68,68,0.1)',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">

      {!is_enabled && <PendienteHabilitacionBanner />}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-blue-955">
            Bienvenido, {user?.first_name || 'Arquitecto'} 👷
          </h1>
          <p className="text-blue-800 mt-1">
            {is_enabled
              ? 'Gestiona los trámites de tus clientes desde aquí.'
              : 'Tu cuenta está siendo verificada por el GAD Municipal.'}
          </p>
        </div>
        {is_enabled && (
          <Link to="/architect/procedures/new" className="btn-primary">
            <PlusCircle size={18} />
            <span className="hidden sm:inline">Nuevo Trámite</span>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: stat.bg, color: stat.color }}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-blue-955">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Información profesional */}
      {user?.title && (
        <div className="glass-card p-5">
          <h2 className="font-heading font-semibold text-blue-955 mb-4 flex items-center gap-2">
            <HardHat size={16} style={{ color: BLUE }} />
            Mi perfil profesional
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Título', value: user.title },
              { label: 'N° Registro SENESCYT', value: user.registration_number },
              { label: 'Estado', value: is_enabled ? '✅ Habilitado por el GAD' : '⏳ Pendiente de habilitación' },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">{label}</p>
                <p className="text-sm font-medium text-blue-955">{value || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trámites recientes */}
      <div className="glass-card">
        <div className="flex items-center justify-between p-6 border-b border-surface-border">
          <h2 className="font-heading font-semibold text-blue-955">Trámites Recientes</h2>
          <Link to="/architect/procedures" className="text-sm flex items-center gap-1 transition-colors font-bold text-blue-600 hover:text-blue-500">
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>

        {is_loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded-xl shimmer" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center">
            <TrendingUp size={40} className="text-slate-400 mx-auto mb-4" />
            <p className="text-blue-800 font-medium">Sin trámites aún</p>
            <p className="text-slate-500 text-sm mt-1">Inicia el primer trámite para un ciudadano</p>
            {is_enabled && (
              <Link to="/architect/procedures/new" className="btn-primary mt-4 inline-flex">
                <PlusCircle size={16} />
                Nuevo Trámite
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-surface-border">
            {applications.slice(0, 5).map((sol) => (
              <Link
                key={sol.id}
                to={`/architect/procedures/${sol.id}`}
                className="block p-5 hover:bg-surface-muted/30 transition-colors group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(37,99,235,0.1)', color: BLUE }}>
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-blue-955 font-bold text-sm">{sol.procedure_type || 'Trámite'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <User size={11} className="text-slate-400" />
                        <p className="text-slate-500 text-xs">
                          {sol.citizen
                            ? `${sol.citizen.first_name} ${sol.citizen.last_name}`
                            : `ID: #${sol.id.slice(0, 8)}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="pt-1 px-2 sm:px-8">
                  <ApplicationTimeline current_status={sol.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
