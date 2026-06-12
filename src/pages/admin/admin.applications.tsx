import { useEffect, useState, useCallback } from 'react'
import { FileText, Search, Filter, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { applications_api } from '@/lib/api.calls'
import { getStatusBadgeClass, getStatusLabel, formatDateTime } from '@/lib/utils'

interface Application {
  id: string
  created_at: string
  user: {
    first_name: string
    last_name: string
    national_id: string
  } | null
  procedure_type: string
  status: string
}

export function AdminApplications() {
  const [applications, set_applications] = useState<Application[]>([])
  const [is_loading, set_is_loading] = useState(true)
  const [status_filter, set_status_filter] = useState<string>('')

  const fetchApplications = useCallback(async () => {
    try {
      set_is_loading(true)
      const params = status_filter ? { estado: status_filter, limit: 100 } : { limit: 100 }
      const { data } = await applications_api.list(params)
      
      const mapped = (data.data || []).map((s: any) => ({
        id: s.id,
        created_at: s.createdAt,
        user: s.usuario ? {
          first_name: s.usuario.nombre,
          last_name: s.usuario.apellido,
          national_id: s.usuario.cedula
        } : null,
        procedure_type: s.tipoTramite,
        status: s.estado
      }))

      set_applications(mapped)
    } catch (e) {
      console.error('Error fetching applications:', e)
    } finally {
      set_is_loading(false)
    }
  }, [status_filter])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

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
              value={status_filter} 
              onChange={(e) => set_status_filter(e.target.value)}
              className="input-field w-full sm:w-auto"
            >
              <option value="">Todos los estados</option>
              <option value="BORRADOR">Borrador</option>
              <option value="PENDIENTE_SECRETARIA">Revisión Secretaría</option>
              <option value="OBSERVADO">Observado</option>
              <option value="EN_REVISION_TECNICA">Revisión Técnica</option>
              <option value="PENDIENTE_PAGO">Pendiente de Pago</option>
              <option value="PAGADO">Pagado</option>
              <option value="APROBADO">Aprobado</option>
              <option value="RECHAZADO">Negado / Rechazado</option>
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
              {is_loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Cargando solicitudes...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No hay solicitudes registradas
                  </td>
                </tr>
              ) : (
                applications.map((s) => (
                  <tr key={s.id} className="border-b border-surface-border hover:bg-surface-muted/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-blue-950 font-medium">
                      {s.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatDateTime(s.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      {s.user ? (
                        <>
                          <p className="font-medium text-blue-955">{s.user.first_name} {s.user.last_name}</p>
                          <p className="text-xs text-slate-500">{s.user.national_id}</p>
                        </>
                      ) : (
                        <p className="text-slate-400">—</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {s.procedure_type || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={getStatusBadgeClass(s.status)}>
                        {getStatusLabel(s.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/admin/applications/${s.id}`} 
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
