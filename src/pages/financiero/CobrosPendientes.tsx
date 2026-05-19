import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DollarSign, Eye, Filter, RefreshCw, Clock, CheckCircle2, Receipt } from 'lucide-react'
import { solicitudesApi } from '@/lib/apiCalls'

const BRAND = '#7C3AED'

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

type Filtro = 'TODOS' | 'PENDIENTE_PAGO' | 'PAGADO'

export function CobrosPendientes() {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<Filtro>('TODOS')
  const [busqueda, setBusqueda] = useState('')

  const cargar = async () => {
    setLoading(true)
    try {
      const { data } = await solicitudesApi.list({ limit: 100 })
      setSolicitudes(data.data ?? data ?? [])
    } catch (e) {
      console.error('Error cargando cobros', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const filtradas = solicitudes.filter(s => {
    if (filtro === 'PENDIENTE_PAGO' && s.estado !== 'PENDIENTE_PAGO') return false
    if (filtro === 'PAGADO' && !['PAGADO', 'APROBADO'].includes(s.estado)) return false
    if (filtro === 'TODOS' && !['PENDIENTE_PAGO', 'PAGADO', 'APROBADO'].includes(s.estado)) return false
    if (busqueda) {
      const q = busqueda.toLowerCase()
      const nombre = `${s.ciudadano?.nombre ?? ''} ${s.ciudadano?.apellido ?? ''}`.toLowerCase()
      if (!nombre.includes(q) && !s.id?.toLowerCase().includes(q)) return false
    }
    return true
  })

  const pendientes = solicitudes.filter(s => s.estado === 'PENDIENTE_PAGO')
  const pagados = solicitudes.filter(s => ['PAGADO', 'APROBADO'].includes(s.estado))
  const totalRecaudado = pagados.reduce((sum, s) => sum + Number(s.cobros?.[0]?.monto ?? 0), 0)

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-950">Gestión de Cobros</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Registro y seguimiento de pagos de trámites aprobados
          </p>
        </div>
        <button onClick={cargar} disabled={loading}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all"
          title="Actualizar">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pend. de cobro', count: pendientes.length, color: '#7C3AED', icon: <Clock size={16} />, suffix: '' },
          { label: 'Pagados', count: pagados.length, color: '#16A34A', icon: <CheckCircle2 size={16} />, suffix: '' },
          { label: 'Total recaudado', count: totalRecaudado, color: '#D97706', icon: <DollarSign size={16} />, suffix: '$', isAmount: true },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: `${stat.color}12`, color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-extrabold text-blue-950">
                {stat.isAmount ? `$${stat.count.toFixed(2)}` : stat.count}
              </p>
              <p className="text-slate-400 text-xs">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por ciudadano o ID..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-white"
            style={{ borderColor: '#e2e8f0', color: '#1e293b' }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} style={{ color: '#64748b' }} />
          {(['TODOS', 'PENDIENTE_PAGO', 'PAGADO'] as Filtro[]).map((f) => (
            <button key={f}
              onClick={() => setFiltro(f)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border"
              style={{
                background: filtro === f ? `${BRAND}18` : 'white',
                borderColor: filtro === f ? `${BRAND}40` : '#e2e8f0',
                color: filtro === f ? BRAND : '#64748b',
              }}>
              {f === 'TODOS' ? 'Todos' : f === 'PENDIENTE_PAGO' ? '⏳ Pendientes' : '✅ Pagados'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border overflow-hidden bg-white" style={{ borderColor: '#e2e8f0' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Expediente', 'Ciudadano', 'Tipo de Trámite', 'Monto', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#f1f5f9' }}>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">Cargando cobros...</p>
                  </td>
                </tr>
              ) : filtradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Receipt size={40} className="mx-auto mb-3 text-slate-200" />
                    <p className="text-slate-400">No hay cobros que coincidan</p>
                  </td>
                </tr>
              ) : (
                filtradas.map((sol) => {
                  const cobro = sol.cobros?.[0]
                  const pagado = ['PAGADO', 'APROBADO'].includes(sol.estado)
                  return (
                    <tr key={sol.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-blue-950 text-sm font-mono">#{sol.id?.slice(0, 8).toUpperCase()}</p>
                        <p className="text-slate-400 text-xs">
                          {sol.createdAt ? new Date(sol.createdAt).toLocaleDateString('es-EC') : '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-blue-950 text-sm">
                          {sol.ciudadano?.nombre} {sol.ciudadano?.apellido}
                        </p>
                        <p className="text-slate-400 text-xs">CI: {sol.ciudadano?.cedula || '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background: `${TIPO_COLOR[sol.tipoTramite] ?? '#64748b'}15`,
                            color: TIPO_COLOR[sol.tipoTramite] ?? '#64748b',
                          }}>
                          {TIPO_LABEL[sol.tipoTramite] ?? sol.tipoTramite}
                        </span>
                        <p className="text-slate-400 text-xs mt-1">{sol.predio?.ubicacion ?? '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        {cobro ? (
                          <p className="text-lg font-extrabold text-purple-700">${Number(cobro.monto).toFixed(2)}</p>
                        ) : (
                          <p className="text-slate-400 text-sm italic">Por registrar</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background: pagado ? 'rgba(22,163,74,0.1)' : 'rgba(124,58,237,0.1)',
                            color: pagado ? '#16A34A' : '#7C3AED',
                            border: `1px solid ${pagado ? 'rgba(22,163,74,0.3)' : 'rgba(124,58,237,0.3)'}`,
                          }}>
                          {pagado ? '✅ Pagado' : '⏳ Pend. pago'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/financiero/cobros/${sol.id}`}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                          style={{ background: `${BRAND}10`, color: BRAND, border: `1px solid ${BRAND}25` }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${BRAND}18`}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = `${BRAND}10`}>
                          <Eye size={14} /> {pagado ? 'Ver' : 'Gestionar'}
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
