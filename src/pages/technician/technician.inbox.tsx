import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Inbox, CheckCircle2, Clock, ArrowRight, User,
  MapPin, FileText, XCircle, Building2, Trees,
} from 'lucide-react'
import { applications_api } from '@/lib/api.calls'
import { useAuthStore } from '@/stores/auth.store'
import { getStatusBadgeClass, getStatusLabel, formatDate, cn } from '@/lib/utils'

// ── Reusable zone badge ──────────────────────────────
function ZoneBadge({ zone, size = 'md' }: { zone?: string | null; size?: 'sm' | 'md' }) {
  if (!zone) return null
  const is_urban = zone === 'URBAN' || zone === 'URBANO'
  const small = size === 'sm'
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-lg font-medium', small ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm')}
      style={{
        background: is_urban ? 'rgba(37,99,235,0.1)' : 'rgba(46,139,87,0.1)',
        border: `1px solid ${is_urban ? 'rgba(37,99,235,0.3)' : 'rgba(46,139,87,0.3)'}`,
        color: is_urban ? '#2563EB' : '#2E8B57',
      }}
    >
      {is_urban ? <Building2 size={small ? 10 : 13} /> : <Trees size={small ? 10 : 13} />}
      {is_urban ? 'Urbano' : 'Rural'}
    </span>
  )
}

interface Application {
  id: string
  procedure_type: string
  status: string
  created_at: string
  attachments_count: number
  citizen?: {
    first_name: string
    last_name: string
  } | null
  property?: {
    location: string
    address: string
  } | null
}

export function TechnicianInbox() {
  const { user } = useAuthStore()
  const [applications, set_applications] = useState<Application[]>([])
  const [is_loading, set_is_loading] = useState(true)
  const [filter, set_filter] = useState<string>('ALL')

  useEffect(() => {
    applications_api.list()
      .then(({ data }) => {
        const mapped = (data.data || []).map((s: any) => ({
          id: s.id,
          procedure_type: s.tipoTramite,
          status: s.estado,
          created_at: s.createdAt,
          attachments_count: s._count?.anexos || 0,
          citizen: s.ciudadano ? {
            first_name: s.ciudadano.nombre,
            last_name: s.ciudadano.apellido,
          } : null,
          property: s.predio ? {
            location: s.predio.ubicacion,
            address: s.predio.direccion,
          } : null,
        }))
        set_applications(mapped)
      })
      .catch(() => set_applications([]))
      .finally(() => set_is_loading(false))
  }, [])

  const filtered_applications = filter === 'ALL'
    ? applications
    : applications.filter(s => {
        if (filter === 'UNDER_REVIEW') return ['UNDER_REVIEW', 'EN_REVISION', 'EN_REVISION_TECNICA'].includes(s.status)
        if (filter === 'INSPECTION') return ['INSPECTION', 'INSPECCION'].includes(s.status)
        if (filter === 'APPROVED') return ['APPROVED', 'APROBADO'].includes(s.status)
        if (filter === 'REJECTED') return ['REJECTED', 'NEGADO'].includes(s.status)
        return s.status === filter
      })

  const counts = {
    under_review: applications.filter(s => ['EN_REVISION', 'EN_REVISION_TECNICA', 'UNDER_REVIEW'].includes(s.status)).length,
    inspection:  applications.filter(s => ['INSPECCION', 'INSPECTION'].includes(s.status)).length,
    approved:    applications.filter(s => ['APROBADO', 'APPROVED'].includes(s.status)).length,
    rejected:      applications.filter(s => ['NEGADO', 'REJECTED'].includes(s.status)).length,
  }

  const FILTERS = [
    { key: 'ALL',          label: `Todas (${applications.length})` },
    { key: 'UNDER_REVIEW', label: `Revisión (${counts.under_review})` },
    { key: 'INSPECTION',  label: `Inspección (${counts.inspection})` },
    { key: 'APPROVED',    label: `Aprobadas (${counts.approved})` },
    { key: 'REJECTED',      label: `Negadas (${counts.rejected})` },
  ]

  return (
    <div className="animate-fade-in space-y-6">

      {/* ── Header with technician zone ─────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-heading text-2xl font-bold text-blue-955">Bandeja de Trabajo</h1>
            {/* Authenticated technician zone badge */}
            <ZoneBadge zone={user?.zone} />
          </div>
          <p className="text-blue-800 mt-1 text-sm">
            {user?.zone
              ? `Solicitudes asignadas de la zona ${user.zone === 'URBAN' ? 'Urbana' : 'Rural'}`
              : 'Solicitudes asignadas para revisión técnica'}
          </p>
        </div>

        {/* Zone info with descriptive icon */}
        {user?.zone && (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
            style={{
              background: user.zone === 'URBAN' ? 'rgba(37,99,235,0.05)' : 'rgba(46,139,87,0.05)',
              border: `1px solid ${user.zone === 'URBAN' ? 'rgba(37,99,235,0.15)' : 'rgba(46,139,87,0.15)'}`,
              color: user.zone === 'URBAN' ? 'rgba(200,160,30,0.8)' : 'rgba(46,139,87,0.8)',
            }}
          >
            {user.zone === 'URBAN'
              ? <><Building2 size={14} /> Solo trámites de zona <strong>Urbana</strong></>
              : <><Trees size={14} /> Solo trámites de zona <strong>Rural</strong></>
            }
          </div>
        )}
      </div>

      {/* ── Stats ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'En Revisión',   value: counts.under_review, color: 'text-yellow-400', bg: 'bg-yellow-500/10',  icon: Clock        },
          { label: 'En Inspección', value: counts.inspection,  color: 'text-blue-400',   bg: 'bg-blue-500/10',   icon: MapPin       },
          { label: 'Aprobadas',     value: counts.approved,    color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
          { label: 'Negadas',       value: counts.rejected,      color: 'text-red-400',    bg: 'bg-red-500/10',    icon: XCircle      },
        ].map(s => (
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

      {/* ── Filters ─────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => set_filter(f.key)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all',
              filter === f.key
                ? 'bg-primary-600 text-white'
                : 'bg-surface-muted text-blue-800 hover:text-blue-955',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Applications List ─────────────────────────────── */}
      <div className="glass-card overflow-hidden">
        {is_loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl shimmer" />)}
          </div>
        ) : filtered_applications.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox size={40} className="text-slate-500 mx-auto mb-4" />
            <p className="text-blue-800 font-medium">Sin solicitudes en esta categoría</p>
            {user?.zone && (
              <p className="text-slate-500 text-sm mt-2">
                Solo se muestran solicitudes de zona <strong style={{ color: user.zone === 'URBAN' ? '#2563EB' : '#2E8B57' }}>{user.zone}</strong>
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-surface-border">
            {filtered_applications.map((app) => (
              <Link
                key={app.id}
                to={`/technician/inbox/${app.id}`}
                className="flex items-center gap-4 p-4 hover:bg-surface-muted/30 transition-colors group"
              >
                {/* Procedure type icon */}
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-primary-400" />
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-blue-955 font-medium text-sm">{app.procedure_type || 'Trámite'}</p>
                    <span className={getStatusBadgeClass(app.status)}>{getStatusLabel(app.status)}</span>
                    {/* Zone badge of each application */}
                    <ZoneBadge zone={app.property?.location} size="sm" />
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <User size={11} />
                      {app.citizen?.first_name} {app.citizen?.last_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {app.property?.address || app.property?.location || '—'}
                    </span>
                    <span>{formatDate(app.created_at)}</span>
                  </div>
                </div>

                {/* Attachments */}
                {app.attachments_count > 0 && (
                  <span className="text-xs text-slate-500 hidden sm:flex items-center gap-1">
                    <FileText size={11} />
                    {app.attachments_count} doc{app.attachments_count > 1 ? 's' : ''}
                  </span>
                )}

                <ArrowRight size={16} className="text-slate-500 group-hover:text-blue-850 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

