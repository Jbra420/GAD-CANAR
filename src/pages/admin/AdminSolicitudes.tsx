import { useEffect, useState, useCallback } from 'react'
import { FileText, Search, Filter, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { solicitudesApi } from '@/lib/apiCalls'
import { getEstadoBadgeClass, getEstadoLabel, formatDateTime } from '@/lib/utils'

export function AdminSolicitudes() {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [estadoFilter, setEstadoFilter] = useState<string>('')

  const fetchSolicitudes = useCallback(async () => {
    try {
      setLoading(true)
      const params = estadoFilter ? { estado: estadoFilter, limit: 100 } : { limit: 100 }
      const { data } = await solicitudesApi.list(params)
      setSolicitudes(data.data)
    } catch (e) {
      console.error('Error fetching solicitudes:', e)
    } finally {
      setLoading(false)
    }
  }, [estadoFilter])

  useEffect(() => {
    fetchSolicitudes()
  }, [fetchSolicitudes])

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="font-heading text-2xl font-bold text-blue-950 flex items-center gap-3">
          <FileText className="text-primary-600" />
          Todas las Solicitudes
        </h1>
      </div>

      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="relative flex-1 w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por código o solicitante..." 
              className="input-field pl-10"
              disabled
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={18} className="text-slate-400" />
            <select 
              value={estadoFilter} 
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="input-field w-full sm:w-auto"
            >
              <option value="">Todos los estados</option>
              <option value="BORRADOR">Borrador</option>
              <option value="EN_REVISION">En Revisión</option>
              <option value="INSPECCION">En Inspección</option>
              <option value="APROBADO">Aprobado</option>
              <option value="NEGADO">Negado</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-surface-border">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-surface-muted border-b border-surface-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Código</th>
                <th className="px-6 py-4 font-semibold">Fecha</th>
                <th className="px-6 py-4 font-semibold">Solicitante</th>
                <th className="px-6 py-4 font-semibold">Trámite</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Cargando solicitudes...
                  </td>
                </tr>
              ) : solicitudes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No hay solicitudes registradas
                  </td>
                </tr>
              ) : (
                solicitudes.map((s) => (
                  <tr key={s.id} className="border-b border-surface-border hover:bg-surface-muted/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-blue-950 font-medium">
                      {s.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatDateTime(s.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-blue-950">{s.usuario?.nombre} {s.usuario?.apellido}</p>
                      <p className="text-xs text-slate-500">{s.usuario?.cedula}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {s.tipoTramite || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={getEstadoBadgeClass(s.estado)}>
                        {getEstadoLabel(s.estado)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/admin/solicitudes/${s.id}`} 
                        className="inline-flex items-center justify-center p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Ver detalle"
                      >
                        <Eye size={18} />
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
