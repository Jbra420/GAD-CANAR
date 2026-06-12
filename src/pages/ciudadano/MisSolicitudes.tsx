import { useEffect, useState } from 'react'
import { FileText, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { solicitudesApi } from '@/lib/apiCalls'
import { getEstadoBadgeClass, getEstadoLabel, formatDateTime } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'

export function MisSolicitudes() {
  const { user } = useAuthStore()
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMisSolicitudes = async () => {
    try {
      setLoading(true)
      const { data } = await solicitudesApi.misSolicitudes()
      setSolicitudes(data.data)
    } catch (e) {
      console.error('Error fetching mis solicitudes:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMisSolicitudes()
  }, [user?.role])

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="font-heading text-2xl font-bold text-blue-950 flex items-center gap-3">
          <FileText className="text-primary-600" />
          Mis Solicitudes
        </h1>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-surface-muted border-b border-surface-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Trámite</th>
                <th className="px-6 py-4 font-semibold">Dirección</th>
                <th className="px-6 py-4 font-semibold">Fecha de Creación</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Cargando tus solicitudes...
                  </td>
                </tr>
              ) : solicitudes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <FileText size={32} className="text-slate-400 mx-auto mb-3 opacity-50" />
                    <p className="text-blue-950 font-medium">Aún no tienes solicitudes registradas</p>
                    <p className="text-slate-500 text-sm mt-1">Los trámites deben ser ingresados inicialmente por un arquitecto autorizado.</p>
                  </td>
                </tr>
              ) : (
                solicitudes.map((s) => (
                  <tr key={s.id} className="border-b border-surface-border hover:bg-surface-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-blue-950">{s.tipoTramite || 'Ordenamiento Territorial'}</p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">#{s.id.slice(0, 8).toUpperCase()}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {s.predio?.direccion || '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatDateTime(s.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={getEstadoBadgeClass(s.estado)}>
                        {getEstadoLabel(s.estado)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/ciudadano/solicitudes/${s.id}`} 
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
