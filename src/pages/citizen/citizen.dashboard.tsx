import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText, Clock, CheckCircle2, XCircle, ArrowRight,
  Factory, Layers, HardHat, Info,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/lib/api'
import { ApplicationTimeline } from '@/components/application.timeline'

interface Application {
  id: string
  status: string
  procedure_type: string
  property?: { address: string } | null
  created_at: string
}

const PROCEDURES_INFO = [
  {
    value: 'LINEA_FABRICAS',
    label: 'Línea de Fábricas',
    icon: Factory,
    color: '#D97706',
    desc: 'Certificado que define el retiro frontal y alineamiento del predio respecto a la vía.',
    tiempo: '3 a 5 días hábiles',
    requisitos: ['Cédula del propietario', 'Título de propiedad', 'Ficha catastral', 'Plano o croquis de ubicación'],
  },
  {
    value: 'APROBACION_PLANOS',
    label: 'Aprobación de Planos',
    icon: Layers,
    color: '#2563EB',
    desc: 'Revisión municipal de planos arquitectónicos y documentación técnica del proyecto.',
    tiempo: '5 a 10 días hábiles',
    requisitos: ['Cédula del propietario', 'Título de propiedad', 'Planos arquitectónicos', 'Planos estructurales', 'Memoria técnica'],
  },
  {
    value: 'PERMISO_CONSTRUCCION',
    label: 'Permiso de Construcción',
    icon: HardHat,
    color: '#2E8B57',
    desc: 'Autorización para ejecutar construcción, ampliación o remodelación en el cantón.',
    tiempo: '7 a 12 días hábiles',
    requisitos: ['Planos aprobados', 'Contrato del profesional responsable', 'Pago predial', 'Cédula del propietario', 'Comprobante de tasas'],
  },
]

export function CitizenDashboard() {
  const { user } = useAuthStore()
  const [applications, set_applications] = useState<Application[]>([])
  const [is_loading, set_is_loading] = useState(true)

  useEffect(() => {
    set_is_loading(true)
    api.get('/solicitudes/mis-solicitudes').then(({ data }) => {
      const mapped = (data.data || []).map((s: any) => ({
        id: s.id,
        status: s.estado,
        procedure_type: s.tipoTramite,
        property: s.predio ? {
          address: s.predio.direccion
        } : null,
        created_at: s.createdAt
      }))
      set_applications(mapped)
    }).catch(() => {
      set_applications([])
    }).finally(() => set_is_loading(false))
  }, [user?.role])

  const stats = [
    { label: 'Total Solicitudes', value: applications.length, icon: FileText, color: 'text-primary-400', bg: 'bg-primary/10' },
    { label: 'En Proceso', value: applications.filter(s => ['EN_REVISION_TECNICA', 'INSPECCION'].includes(s.status)).length, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Aprobadas', value: applications.filter(s => s.status === 'APROBADO').length, icon: CheckCircle2, color: 'text-success-400', bg: 'bg-success/10' },
    { label: 'Negadas', value: applications.filter(s => s.status === 'RECHAZADO').length, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  ]

  const display_name = user?.first_name || user?.email?.split('@')[0] || 'Ciudadano'

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Bienvenida */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-blue-955">
            Bienvenido, {display_name} 👋
          </h1>
          <p className="text-blue-800 mt-1">
            Consulta el estado de tus trámites de ordenamiento territorial.
          </p>
        </div>
      </div>

      {/* Banner informativo — arquitecto requerido */}
      <div className="rounded-2xl border p-5" style={{ background: 'rgba(37,99,235,0.04)', borderColor: 'rgba(37,99,235,0.2)' }}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}>
            <Info size={20} />
          </div>
          <div>
            <p className="font-bold text-blue-955">¿Quieres iniciar un nuevo trámite?</p>
            <p className="text-slate-600 text-sm mt-1 leading-relaxed">
              Los trámites de ordenamiento territorial deben ser iniciados por un
              <strong> arquitecto o profesional habilitado por el GAD</strong>. Contáctate con
              un profesional de tu confianza para que gestione tu solicitud.
            </p>
            <p className="text-xs text-slate-500 mt-2">
              📞 GAD Municipal de Cañar: (07) 224-2100 &bull; secretaria@gad-canar.gob.ec
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-blue-955">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Trámites disponibles (informativo) */}
      <div className="glass-card p-6">
        <h2 className="font-heading font-semibold text-blue-955 mb-4 flex items-center gap-2">
          <FileText size={16} className="text-blue-600" />
          Trámites disponibles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PROCEDURES_INFO.map(t => (
            <div key={t.value} className="p-4 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
              <div className="p-2.5 rounded-xl" style={{ background: `${t.color}15`, color: t.color }}>
                <t.icon size={20} />
              </div>
              <div>
                <p className="font-bold text-blue-955 text-sm">{t.label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{t.tiempo}</p>
                <p className="text-slate-400 text-xs mt-1">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Solicitudes recientes */}
      <div className="glass-card">
        <div className="flex items-center justify-between p-6 border-b border-surface-border">
          <h2 className="font-heading font-semibold text-blue-955">Solicitudes Recientes</h2>
          <Link to="/citizen/applications" className="text-primary-400 hover:text-primary-400 text-sm flex items-center gap-1 transition-colors">
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>

        {is_loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl shimmer" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={40} className="text-slate-500 mx-auto mb-4" />
            <p className="text-blue-800 font-medium">Sin solicitudes aún</p>
            <p className="text-slate-500 text-sm mt-1">
              Contacta a un arquitecto habilitado para iniciar tu trámite
            </p>
          </div>
        ) : (
          <div className="divide-y divide-surface-border">
            {applications.slice(0, 5).map((sol) => (
              <Link
                key={sol.id}
                to={`/citizen/applications/${sol.id}`}
                className="block p-5 hover:bg-surface-muted/30 transition-colors group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText size={18} className="text-primary-400" />
                    </div>
                    <div>
                      <p className="text-blue-955 font-bold text-sm">
                        {sol.procedure_type || 'Trámite de Ordenamiento'}
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        ID: #{sol.id.slice(0,8)} • {sol.property?.address || '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-855 transition-colors" />
                  </div>
                </div>
                
                {/* ApplicationTimeline inline for active requests */}
                <div className="mt-2 pt-2 px-2 sm:px-8">
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
