import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, FileText, Calendar, User, MapPin,
  CheckCircle2, Clock, XCircle,
  AlertCircle, Eye,
} from 'lucide-react'
import { applications_api } from '@/lib/api.calls'
import { getStatusBadgeClass, getStatusLabel, formatDateTime, cn } from '@/lib/utils'
import api from '@/lib/api'

interface Attachment {
  id: string
  name: string
  size: number
  hash: string
  key: string
}

interface ApplicationDetail {
  id: string
  created_at: string
  status: string
  procedure_type: string
  rejection_reason: string | null
  observations: string | null
  property: {
    address: string
    location: string
    area: number
    description: string | null
  } | null
  technician: {
    first_name: string
    last_name: string
    email: string
  } | null
  schedule: {
    date: string
    notes: string | null
    is_confirmed: boolean
  } | null
  attachments: Attachment[]
}

const TIMELINE = [
  { status: 'BORRADOR', label: 'Creada', icon: FileText },
  { status: 'EN_REVISION_TECNICA', label: 'En Revisión', icon: Clock },
  { status: 'INSPECCION', label: 'En Inspección', icon: MapPin },
  { status: 'APROBADO', label: 'Aprobada', icon: CheckCircle2 },
]

export function AdminApplicationDetail() {
  const { id } = useParams<{ id: string }>()
  const [application, set_application] = useState<ApplicationDetail | null>(null)
  const [is_loading, set_is_loading] = useState(true)
  const [error, set_error] = useState<string | null>(null)

  const mapApplicationObj = (s: any): ApplicationDetail | null => {
    if (!s) return null
    return {
      id: s.id,
      created_at: s.createdAt,
      status: s.estado,
      procedure_type: s.tipoTramite,
      rejection_reason: s.motivoRechazo,
      observations: s.observaciones,
      property: s.predio ? {
        address: s.predio.direccion,
        location: s.predio.ubicacion,
        area: s.predio.area,
        description: s.predio.descripcion
      } : null,
      technician: s.tecnico ? {
        first_name: s.tecnico.nombre,
        last_name: s.tecnico.apellido,
        email: s.tecnico.email
      } : null,
      schedule: s.agenda ? {
        date: s.agenda.fecha,
        notes: s.agenda.notas,
        is_confirmed: s.agenda.confirmada
      } : null,
      attachments: (s.anexos || []).map((anexo: any) => ({
        id: anexo.id,
        name: anexo.nombre,
        size: anexo.tamano,
        hash: anexo.hash,
        key: anexo.key
      }))
    }
  }

  const loadApplication = useCallback(async () => {
    if (!id) return
    try {
      const { data } = await applications_api.getById(id)
      const mapped = mapApplicationObj(data)
      set_application(mapped)
    } catch (e: any) {
      set_error(e.response?.data?.message || 'Error al cargar la solicitud')
    } finally {
      set_is_loading(false)
    }
  }, [id])

  useEffect(() => { loadApplication() }, [loadApplication])

  const statusIndex = (status: string) => {
    const order = ['BORRADOR', 'EN_REVISION_TECNICA', 'INSPECCION', 'APROBADO']
    return order.indexOf(status)
  }

  const handleView = async (url: string) => {
    try {
      const response = await api.get(url, { responseType: 'blob' })
      const blob_url = window.URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] as string }))
      window.open(blob_url, '_blank')
    } catch (e) {
      console.error(e)
      set_error('No se pudo acceder al documento. Verifica tu sesión.')
    }
  }

  if (is_loading) return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-2xl shimmer" />)}
    </div>
  )

  if (!application) return (
    <div className="glass-card p-12 text-center">
      <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
      <p className="text-red-400">{error || 'Solicitud no encontrada'}</p>
    </div>
  )

  const is_rejected = application.status === 'RECHAZADO'

  return (
    <div className="animate-fade-in space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link to="/admin/applications" className="btn-secondary p-2 mt-1">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-heading text-xl font-bold text-blue-955">
              {application.procedure_type || 'Trámite de Ordenamiento'}
            </h1>
            <span className={getStatusBadgeClass(application.status)}>
              {getStatusLabel(application.status)}
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            ID: #{id?.slice(0, 8)}... • Creado {formatDateTime(application.created_at)}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />{error}
        </div>
      )}

      {/* Timeline de progreso */}
      {!is_rejected && (
        <div className="glass-card p-6">
          <h2 className="font-heading font-semibold text-blue-955 mb-4 text-sm">Progreso del Trámite</h2>
          <div className="flex justify-between">
            {TIMELINE.map((t, i) => {
              const active = statusIndex(application.status) >= i
              const current = statusIndex(application.status) === i
              return (
                <div key={t.status} className="flex flex-1 flex-col items-center gap-2">
                  <div className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center transition-all',
                    active ? (current ? 'bg-primary-600 shadow-glow-primary' : 'bg-success-600') : 'bg-surface-muted',
                  )}>
                    <t.icon size={16} className={active ? 'text-blue-955' : 'text-slate-500'} />
                  </div>
                  <span className={cn(
                    'text-xs text-center font-medium',
                    active ? 'text-blue-955' : 'text-slate-500'
                  )}>{t.label}</span>
                  {i < TIMELINE.length - 1 && (
                    <div className={cn(
                      'absolute h-px w-full top-4',
                      active ? 'bg-success-600' : 'bg-surface-border',
                    )} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Rechazado */}
      {is_rejected && (
        <div className="glass-card p-6 border-red-500/30">
          <div className="flex items-center gap-3 mb-3">
            <XCircle size={20} className="text-red-400" />
            <h2 className="font-heading font-semibold text-red-400">Solicitud Rechazada</h2>
          </div>
          <p className="text-blue-800 text-sm">{application.rejection_reason || application.observations || 'Sin motivo especificado.'}</p>
        </div>
      )}

      {/* Datos del predio */}
      <div className="glass-card p-6">
        <h2 className="font-heading font-semibold text-blue-955 mb-4 flex items-center gap-2">
          <MapPin size={16} className="text-primary-400" /> Datos del Predio
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Dirección', value: application.property?.address },
            { label: 'Ubicación', value: application.property?.location },
            { label: 'Área', value: application.property?.area ? `${application.property.area} m²` : '—' },
            { label: 'Tipo', value: application.procedure_type },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-slate-500">{label}</p>
              <p className="text-blue-955 font-medium mt-0.5">{value || '—'}</p>
            </div>
          ))}
        </div>
        {application.property?.description && (
          <p className="text-blue-800 text-sm mt-3 border-t border-surface-border pt-3">{application.property.description}</p>
        )}
      </div>

      {/* Técnico asignado */}
      {application.technician && (
        <div className="glass-card p-6">
          <h2 className="font-heading font-semibold text-blue-955 mb-3 flex items-center gap-2">
            <User size={16} className="text-primary-400" /> Técnico Asignado
          </h2>
          <p className="text-blue-955 font-medium">{application.technician.first_name} {application.technician.last_name}</p>
          <p className="text-slate-500 text-sm">{application.technician.email}</p>
        </div>
      )}

      {/* Agenda */}
      {application.schedule && (
        <div className="glass-card p-6">
          <h2 className="font-heading font-semibold text-blue-955 mb-3 flex items-center gap-2">
            <Calendar size={16} className="text-primary-400" /> Inspección Programada
          </h2>
          <p className="text-blue-955 font-medium">{formatDateTime(application.schedule.date)}</p>
          {application.schedule.notes && <p className="text-blue-800 text-sm mt-1">{application.schedule.notes}</p>}
          <span className={cn('badge mt-2', application.schedule.is_confirmed ? 'badge-aprobado' : 'badge-revision')}>
            {application.schedule.is_confirmed ? 'Confirmada' : 'Pendiente de confirmación'}
          </span>
        </div>
      )}

      {/* Anexos */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-blue-955 flex items-center gap-2">
            <FileText size={16} className="text-primary-400" /> Documentos ({application.attachments?.length ?? 0})
          </h2>
        </div>

        {application.attachments?.length === 0 ? (
          <p className="text-slate-500 text-sm">No hay documentos adjuntos.</p>
        ) : (
          <div className="space-y-2">
            {application.attachments?.map((anexo: any) => (
              <div key={anexo.id} className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-surface-border">
                <FileText size={16} className="text-primary-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-blue-955 text-sm font-medium truncate">{anexo.name}</p>
                  <p className="text-slate-500 text-xs">{(anexo.size / 1024).toFixed(1)} KB • SHA-256: {anexo.hash?.slice(0, 12)}...</p>
                </div>
                <button
                  onClick={() => handleView(`/api/v1/files/${encodeURIComponent(anexo.key)}`)}
                  className="text-primary-400 hover:text-primary-400"
                >
                  <Eye size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
