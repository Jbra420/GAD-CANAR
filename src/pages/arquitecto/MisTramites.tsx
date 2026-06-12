import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, ArrowRight, Search, User } from 'lucide-react'
import api from '@/lib/api'
import { getEstadoBadgeClass, getEstadoLabel, formatDateTime } from '@/lib/utils'
import { SolicitudTimeline } from '@/components/SolicitudTimeline'

const ESTADOS = [
  { value: '', label: 'Todos' },
  { value: 'BORRADOR', label: 'Borrador' },
  { value: 'PENDIENTE_SECRETARIA', label: 'En Secretaría' },
  { value: 'OBSERVADO', label: 'Observado' },
  { value: 'EN_REVISION_TECNICA', label: 'Revisión Técnica' },
  { value: 'PENDIENTE_PAGO', label: 'Pendiente Pago' },
  { value: 'PAGADO', label: 'Pagado' },
  { value: 'APROBADO', label: 'Aprobado' },
  { value: 'RECHAZADO', label: 'Rechazado' },
]

const ARQCOLOR = '#D97706'

interface Solicitud {
  id: string
  estado: string
  tipoTramite: string
  predio?: { direccion: string }
  ciudadano?: { nombre: string; apellido: string; cedula?: string }
  createdAt: string
  updatedAt: string
}

export function MisTramites() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const params = new URLSearchParams()
    if (filtroEstado) params.set('estado', filtroEstado)
    api.get(`/solicitudes/mis-solicitudes?${params}`).then(({ data }) => {
      setSolicitudes(data.data || [])
    }).catch(() => {
      setSolicitudes([])
    }).finally(() => setLoading(false))
  }, [filtroEstado])

  const filtradas = solicitudes.filter(s => {
    if (!busqueda) return true
    const term = busqueda.toLowerCase()
    const ciudadanoNombre = s.ciudadano ? `${s.ciudadano.nombre} ${s.ciudadano.apellido}`.toLowerCase() : ''
    return (
      s.id.toLowerCase().includes(term) ||
      s.tipoTramite?.toLowerCase().includes(term) ||
      ciudadanoNombre.includes(term) ||
      s.ciudadano?.cedula?.includes(term) ||
      s.predio?.direccion?.toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-heading text-2xl font-bold text-blue-950">Mis Trámites</h1>
        <p className="text-blue-800 mt-1 text-sm">Todos los trámites que has gestionado para tus clientes</p>
      </div>

      {/* Filtros */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por ciudadano, cédula, dirección..."
            className="input-field pl-9 py-2"
          />
        </div>
        <select
          value={filtroEstado}
          onChange={e => { setFiltroEstado(e.target.value); setLoading(true) }}
          className="input-field py-2 sm:w-48"
        >
          {ESTADOS.map(e => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>
      </div>

      {/* Lista */}
      <div className="glass-card">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-28 rounded-xl shimmer" />)}
          </div>
        ) : filtradas.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={40} className="text-slate-400 mx-auto mb-4" />
            <p className="text-blue-800 font-medium">Sin trámites encontrados</p>
            <p className="text-slate-500 text-sm mt-1">
              {busqueda || filtroEstado ? 'Cambia los filtros para ver más resultados' : 'Inicia el primer trámite para un ciudadano'}
            </p>
            <Link to="/arquitecto/tramites/nuevo" className="btn-primary mt-4 inline-flex"
              style={{ background: `linear-gradient(135deg, ${ARQCOLOR} 0%, #B45309 100%)`, border: 'none' }}>
              Nuevo Trámite
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-surface-border">
            {filtradas.map((sol) => (
              <Link
                key={sol.id}
                to={`/arquitecto/tramites/${sol.id}`}
                className="block p-5 hover:bg-surface-muted/30 transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(217,119,6,0.1)', color: ARQCOLOR }}>
                      <FileText size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-blue-950 font-bold text-sm">{sol.tipoTramite || 'Trámite'}</p>
                        <span className={getEstadoBadgeClass(sol.estado)}>{getEstadoLabel(sol.estado)}</span>
                      </div>
                      {sol.ciudadano && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                          <User size={11} />
                          <span>{sol.ciudadano.nombre} {sol.ciudadano.apellido}</span>
                          {sol.ciudadano.cedula && <span className="text-slate-400">• CI: {sol.ciudadano.cedula}</span>}
                        </div>
                      )}
                      <p className="text-xs text-slate-400">
                        #{sol.id.slice(0, 8)} • {sol.predio?.direccion || '—'} • {formatDateTime(sol.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform mt-1" />
                </div>
                <div className="px-2 sm:px-14">
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
