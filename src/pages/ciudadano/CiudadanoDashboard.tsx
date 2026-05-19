import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText, Clock, CheckCircle2, XCircle, PlusCircle, ArrowRight,
  AlertCircle, Factory, Layers, HardHat, ClipboardCheck, ShieldCheck,
  MapPin, CreditCard,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/lib/api'
import { SolicitudTimeline } from '@/components/SolicitudTimeline'

interface Solicitud {
  id: string
  estado: string
  tipoTramite: string
  predio?: { direccion: string }
  createdAt: string
}

const TRAMITES_ACCESO_RAPIDO = [
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

function InvitadoDashboard({ nombre }: { nombre?: string }) {
  const pasos = [
    { icon: ShieldCheck, title: 'Activa tu perfil', text: 'Completa nombre, cédula, teléfono y contraseña.' },
    { icon: FileText, title: 'Elige un trámite', text: 'Selecciona el proceso municipal que necesitas iniciar.' },
    { icon: ClipboardCheck, title: 'Adjunta requisitos', text: 'Sube PDF, JPG o PNG de los documentos solicitados.' },
    { icon: CheckCircle2, title: 'Firma y envía', text: 'La solicitud pasa a revisión documental y técnica.' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl overflow-hidden border bg-white" style={{ borderColor: '#dbeafe' }}>
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-6 md:p-8">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border"
              style={{ background: 'rgba(37,99,235,0.08)', borderColor: 'rgba(37,99,235,0.2)', color: '#2563EB' }}>
              <AlertCircle size={14} /> Acceso informativo
            </span>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-blue-950 mt-4">
              Bienvenido, {nombre || 'visitante'}
            </h1>
            <p className="text-slate-600 mt-2 max-w-2xl">
              Puedes revisar los trámites disponibles, requisitos y pasos antes de activar tu cuenta.
              Para enviar una solicitud se requiere completar tu perfil ciudadano.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Link to="/ciudadano/solicitudes/nueva" className="btn-primary inline-flex">
                <ShieldCheck size={18} />
                Completar perfil e iniciar
              </Link>
              <a href="#tramites-disponibles" className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-blue-900 font-semibold hover:bg-slate-50 transition-colors">
                Ver trámites <ArrowRight size={16} />
              </a>
            </div>
          </div>
          <div className="p-6 md:p-8 bg-slate-50 border-t lg:border-t-0 lg:border-l" style={{ borderColor: '#e2e8f0' }}>
            <h2 className="font-bold text-blue-950 mb-4">Antes de empezar</h2>
            <div className="space-y-3">
              {[
                { icon: FileText, label: 'Formatos aceptados', value: 'PDF, JPG, PNG' },
                { icon: CreditCard, label: 'Identificación', value: 'Cédula ecuatoriana de 10 dígitos' },
                { icon: MapPin, label: 'Cobertura', value: 'Predios urbanos y rurales del cantón' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                    <item.icon size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">{item.label}</p>
                    <p className="text-sm text-blue-950 font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div id="tramites-disponibles" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {TRAMITES_ACCESO_RAPIDO.map((t) => (
          <div key={t.value} className="rounded-2xl border bg-white p-5 flex flex-col" style={{ borderColor: '#e2e8f0' }}>
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-xl" style={{ background: `${t.color}12`, color: t.color }}>
                <t.icon size={24} />
              </div>
              <div>
                <h2 className="font-heading font-bold text-blue-950">{t.label}</h2>
                <p className="text-xs font-semibold mt-1" style={{ color: t.color }}>{t.tiempo}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-4 leading-relaxed">{t.desc}</p>
            <div className="mt-5">
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">Requisitos principales</p>
              <div className="space-y-2">
                {t.requisitos.map((req) => (
                  <div key={req} className="flex items-center gap-2 text-sm text-blue-950">
                    <CheckCircle2 size={14} style={{ color: t.color }} />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>
            <Link to="/ciudadano/solicitudes/nueva" className="mt-5 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white transition-colors"
              style={{ background: t.color }}>
              Iniciar este trámite <ArrowRight size={16} />
            </Link>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-white p-6" style={{ borderColor: '#e2e8f0' }}>
        <h2 className="font-heading font-bold text-blue-950 mb-4">Cómo avanza tu solicitud</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {pasos.map((paso, index) => (
            <div key={paso.title} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <paso.icon size={18} className="text-blue-700" />
              </div>
              <p className="font-bold text-blue-950 text-sm">{paso.title}</p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{paso.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CiudadanoDashboard() {
  const { user } = useAuthStore()
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === 'INVITADO') {
      setSolicitudes([])
      setLoading(false)
      return
    }

    api.get('/solicitudes/mis-solicitudes').then(({ data }) => {
      setSolicitudes(data.data || [])
    }).catch(() => {
      // Datos de demo si el backend aún no está listo
      setSolicitudes([])
    }).finally(() => setLoading(false))
  }, [user?.role])

  const stats = [
    { label: 'Total Solicitudes', value: solicitudes.length, icon: FileText, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { label: 'En Proceso', value: solicitudes.filter(s => ['EN_REVISION', 'INSPECCION'].includes(s.estado)).length, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Aprobadas', value: solicitudes.filter(s => s.estado === 'APROBADO').length, icon: CheckCircle2, color: 'text-success-400', bg: 'bg-success-500/10' },
    { label: 'Negadas', value: solicitudes.filter(s => s.estado === 'NEGADO').length, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  ]

  if (user?.role === 'INVITADO') {
    return <InvitadoDashboard nombre={user?.nombre || user?.email?.split('@')[0]} />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Bienvenida */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-blue-950">
            Bienvenido, {user?.nombre || 'Usuario'} 👋
          </h1>
          <p className="text-blue-800 mt-1">
            Gestiona tus trámites de ordenamiento territorial desde aquí.
          </p>
        </div>
        <Link to="/ciudadano/solicitudes/nueva" className="btn-primary">
          <PlusCircle size={18} />
          <span className="hidden sm:inline">Nueva Solicitud</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-blue-950">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Accesos Rápidos */}
      <div className="glass-card p-6">
        <h2 className="font-heading font-semibold text-blue-950 mb-4">Inicia un nuevo trámite</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TRAMITES_ACCESO_RAPIDO.map(t => (
            <Link key={t.value} to="/ciudadano/solicitudes/nueva"
              className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all group flex items-start gap-3">
              <div className="p-2.5 rounded-xl transition-all" style={{ background: `${t.color}15`, color: t.color }}>
                <t.icon size={20} />
              </div>
              <div>
                <p className="font-bold text-blue-950 text-sm group-hover:text-blue-700 transition-colors">{t.label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{t.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Solicitudes recientes */}
      <div className="glass-card">
        <div className="flex items-center justify-between p-6 border-b border-surface-border">
          <h2 className="font-heading font-semibold text-blue-950">Solicitudes Recientes</h2>
          <Link to="/ciudadano/solicitudes" className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1 transition-colors">
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl shimmer" />
            ))}
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={40} className="text-slate-500 mx-auto mb-4" />
            <p className="text-blue-800 font-medium">Sin solicitudes aún</p>
            <p className="text-slate-500 text-sm mt-1">Crea tu primera solicitud de trámite</p>
            <Link to="/ciudadano/solicitudes/nueva" className="btn-primary mt-4 inline-flex">
              <PlusCircle size={16} />
              Crear solicitud
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-surface-border">
            {solicitudes.slice(0, 5).map((sol) => (
              <Link
                key={sol.id}
                to={`/ciudadano/solicitudes/${sol.id}`}
                className="block p-5 hover:bg-surface-muted/30 transition-colors group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                      <FileText size={18} className="text-primary-400" />
                    </div>
                    <div>
                      <p className="text-blue-950 font-bold text-sm">
                        {sol.tipoTramite || 'Trámite de Ordenamiento'}
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        ID: #{sol.id.slice(0,8)} • {sol.predio?.direccion || '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-800 transition-colors" />
                  </div>
                </div>
                
                {/* SolicitudTimeline inline for active requests */}
                <div className="mt-2 pt-2 px-2 sm:px-8">
                  <SolicitudTimeline estadoActual={sol.estado} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
