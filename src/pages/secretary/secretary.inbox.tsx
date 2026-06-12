import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, FileCheck2, Eye, Filter, RefreshCw, Clock, XCircle } from 'lucide-react'
import { applications_api } from '@/lib/api.calls'

const BRAND = '#D97706'

type StatusFilter = 'TODOS' | 'PENDIENTE_SECRETARIA' | 'OBSERVADO'

const TIPO_LABEL: Record<string, string> = {
  PERMISO_CONSTRUCCION: 'Permiso de Construcción',
  LINEA_FABRICAS: 'Línea de Fábricas',
  APROBACION_PLANOS: 'Aprobación de Planos',
}

const TIPO_COLOR: Record<string, string> = {
  PERMISO_CONSTRUCCION: '#2563EB',
  LINEA_FABRICAS: '#D97706',
  APROBACION_PLANOS: '#2E8B57',
}

interface Application {
  id: string
  status: string
  procedure_type: string
  created_at: string
  citizen?: {
    first_name: string
    last_name: string
    national_id?: string
  } | null
  property?: {
    address: string
  } | null
  attachments: Array<{ id: string }>
}

export function SecretaryInbox() {
  const [applications, set_applications] = useState<Application[]>([])
  const [is_loading, set_is_loading] = useState(true)
  const [filter, set_filter] = useState<StatusFilter>('TODOS')
  const [search, set_search] = useState('')

  const loadInbox = useCallback(async () => {
    set_is_loading(true)
    try {
      const params: any = {}
      if (filter !== 'TODOS') params.estado = filter
      const { data } = await applications_api.list({ ...params, limit: 100 })
      
      const mapped = (data.data || []).map((s: any) => ({
        id: s.id,
        status: s.estado,
        procedure_type: s.tipoTramite,
        created_at: s.createdAt,
        citizen: s.ciudadano ? {
          first_name: s.ciudadano.nombre,
          last_name: s.ciudadano.apellido,
          national_id: s.ciudadano.cedula
        } : null,
        property: s.predio ? {
          address: s.predio.direccion
        } : null,
        attachments: (s.anexos || []).map((a: any) => ({
          id: a.id
        }))
      }))

      set_applications(mapped)
    } catch (e) {
      console.error('Error loading inbox', e)
    } finally {
      set_is_loading(false)
    }
  }, [filter])

  useEffect(() => { loadInbox() }, [loadInbox])

  const filtered_applications = applications.filter((s) => {
    if (filter === 'TODOS') {
      if (!['PENDIENTE_SECRETARIA', 'OBSERVADO'].includes(s.status)) return false
    }
    if (search) {
      const q = search.toLowerCase()
      const name = `${s.citizen?.first_name ?? ''} ${s.citizen?.last_name ?? ''}`.toLowerCase()
      if (!name.includes(q) && !s.id?.toLowerCase().includes(q) && !s.citizen?.national_id?.includes(q)) return false
    }
    return true
  })

  const pending_count = applications.filter(s => s.status === 'PENDIENTE_SECRETARIA').length
  const observed_count = applications.filter(s => s.status === 'OBSERVADO').length

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-955">Bandeja de Trámites</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Verificación documental — firma y completitud de expedientes
          </p>
        </div>
        <button onClick={loadInbox} disabled={is_loading}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all"
          title="Actualizar">
          <RefreshCw size={16} className={is_loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pendientes', count: pending_count, color: '#D97706', icon: <Clock size={16} /> },
          { label: 'Observados', count: observed_count, color: '#DC2626', icon: <XCircle size={16} /> },
          { label: 'Total activos', count: pending_count + observed_count, color: '#2563EB', icon: <FileCheck2 size={16} /> },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: `${stat.color}12`, color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-extrabold text-blue-955">{stat.count}</p>
              <p className="text-slate-400 text-xs">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Buscar por ciudadano, cédula o ID..."
            value={search}
            onChange={(e) => set_search(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-white"
            style={{ borderColor: '#e2e8f0', color: '#1e293b' }}
          />
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2">
          <Filter size={16} style={{ color: '#64748b' }} />
          {(['TODOS', 'PENDIENTE_SECRETARIA', 'OBSERVADO'] as StatusFilter[]).map((f) => (
            <button key={f}
              onClick={() => set_filter(f)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border"
              style={{
                background: filter === f ? `${BRAND}18` : 'white',
                borderColor: filter === f ? `${BRAND}40` : '#e2e8f0',
                color: filter === f ? BRAND : '#64748b',
              }}>
              {f === 'TODOS' ? 'Todos' : f === 'PENDIENTE_SECRETARIA' ? 'Pendientes' : 'Observados'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'white', borderColor: '#e2e8f0' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Expediente', 'Ciudadano', 'Tipo de Trámite', 'Archivos', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#f1f5f9' }}>
              {is_loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">Cargando bandeja...</p>
                  </td>
                </tr>
              ) : filtered_applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <FileCheck2 size={40} className="mx-auto mb-3" style={{ color: '#e2e8f0' }} />
                    <p style={{ color: '#94a3b8' }}>No hay solicitudes que coincidan</p>
                  </td>
                </tr>
              ) : (
                filtered_applications.map((sol) => (
                  <tr key={sol.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-blue-955 text-sm font-mono">#{sol.id?.slice(0, 8).toUpperCase()}</p>
                      <p style={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                        {sol.created_at ? new Date(sol.created_at).toLocaleDateString('es-EC') : '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-blue-955 text-sm text-left">
                        {sol.citizen?.first_name} {sol.citizen?.last_name}
                      </p>
                      <p className="text-left" style={{ color: '#64748b', fontSize: '0.75rem' }}>CI: {sol.citizen?.national_id || '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: `${TIPO_COLOR[sol.procedure_type] ?? '#64748b'}15`,
                          color: TIPO_COLOR[sol.procedure_type] ?? '#64748b',
                        }}>
                        {TIPO_LABEL[sol.procedure_type] ?? sol.procedure_type}
                      </span>
                      <p style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: 4 }}>
                        {sol.property?.address ?? '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileCheck2 size={14} style={{ color: '#64748b' }} />
                        <span className="text-sm font-semibold text-blue-955">
                          {sol.attachments?.length ?? 0} archivos
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: sol.status === 'PENDIENTE_SECRETARIA' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                          color: sol.status === 'PENDIENTE_SECRETARIA' ? '#D97706' : '#DC2626',
                          border: `1px solid ${sol.status === 'PENDIENTE_SECRETARIA' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        }}>
                        {sol.status === 'PENDIENTE_SECRETARIA' ? '⏳ Pendiente' : '↩ Observado'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/secretary/inbox/${sol.id}`}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border"
                        style={{ background: 'rgba(217,119,6,0.08)', color: '#D97706', borderColor: 'rgba(217,119,6,0.2)' }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.background = 'rgba(217,119,6,0.15)'
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.background = 'rgba(217,119,6,0.08)'
                        }}>
                        <Eye size={14} /> Revisar
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
