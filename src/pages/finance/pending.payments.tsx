import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DollarSign, Eye, Filter, RefreshCw, Clock, CheckCircle2, Receipt } from 'lucide-react'
import { applications_api } from '@/lib/api.calls'

const BRAND = '#7C3AED'

const PROCEDURE_LABEL: Record<string, string> = {
  PERMISO_CONSTRUCCION: 'Permiso de Construcción',
  LINEA_FABRICAS: 'Línea de Fábricas',
  APROBACION_PLANOS: 'Aprobación de Planos',
}

const PROCEDURE_COLOR: Record<string, string> = {
  PERMISO_CONSTRUCCION: '#2563EB',
  LINEA_FABRICAS: '#D97706',
  APROBACION_PLANOS: '#2E8B57',
}

type FilterType = 'ALL' | 'PENDING_PAYMENT' | 'PAID'

interface Payment {
  id: string
  amount: number
  status: string
  created_at: string
}

interface FinanceApplication {
  id: string
  procedure_type: string
  status: string
  created_at: string
  citizen?: {
    first_name: string
    last_name: string
    national_id: string
  } | null
  predio?: {
    location: string
  } | null
  payment?: Payment | null
}

export function PendingPayments() {
  const [applications, set_applications] = useState<FinanceApplication[]>([])
  const [is_loading, set_is_loading] = useState(true)
  const [filter, set_filter] = useState<FilterType>('ALL')
  const [search, set_search] = useState('')

  const loadPayments = async () => {
    set_is_loading(true)
    try {
      const { data } = await applications_api.list({ limit: 100 })
      const list = (data.data || []).map((s: any) => {
        const cobro = s.cobros && s.cobros.length > 0 ? s.cobros[0] : null
        return {
          id: s.id,
          procedure_type: s.tipoTramite || '',
          status: s.estado || '',
          created_at: s.createdAt || '',
          citizen: s.ciudadano ? {
            first_name: s.ciudadano.nombre || '',
            last_name: s.ciudadano.apellido || '',
            national_id: s.ciudadano.cedula || '',
          } : null,
          predio: s.predio ? {
            location: s.predio.ubicacion || '',
          } : null,
          payment: cobro ? {
            id: cobro.id,
            amount: Number(cobro.monto || 0),
            status: cobro.estado || '',
            created_at: cobro.createdAt || '',
          } : null,
        }
      })
      set_applications(list)
    } catch (e) {
      console.error('Error loading payments:', e)
    } finally {
      set_is_loading(false)
    }
  }

  useEffect(() => { loadPayments() }, [])

  const filtered_applications = applications.filter(s => {
    const is_paid = ['PAGADO', 'PAID', 'APROBADO', 'APPROVED'].includes(s.status)
    if (filter === 'PENDING_PAYMENT' && s.status !== 'PENDIENTE_PAGO' && s.status !== 'PENDING_PAYMENT') return false
    if (filter === 'PAID' && !is_paid) return false
    if (filter === 'ALL' && !['PENDIENTE_PAGO', 'PENDING_PAYMENT', 'PAGADO', 'PAID', 'APROBADO', 'APPROVED'].includes(s.status)) return false
    if (search) {
      const q = search.toLowerCase()
      const name = `${s.citizen?.first_name ?? ''} ${s.citizen?.last_name ?? ''}`.toLowerCase()
      if (!name.includes(q) && !s.id?.toLowerCase().includes(q)) return false
    }
    return true
  })

  const pending_applications = applications.filter(s => ['PENDIENTE_PAGO', 'PENDING_PAYMENT'].includes(s.status))
  const paid_applications = applications.filter(s => ['PAGADO', 'PAID', 'APROBADO', 'APPROVED'].includes(s.status))
  const total_revenue = paid_applications.reduce((sum, s) => sum + (s.payment?.amount ?? 0), 0)

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-955">Gestión de Cobros</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Registro y seguimiento de pagos de trámites aprobados
          </p>
        </div>
        <button onClick={loadPayments} disabled={is_loading}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all"
          title="Actualizar">
          <RefreshCw size={16} className={is_loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pend. de cobro', count: pending_applications.length, color: '#7C3AED', icon: <Clock size={16} />, suffix: '' },
          { label: 'Pagados', count: paid_applications.length, color: '#16A34A', icon: <CheckCircle2 size={16} />, suffix: '' },
          { label: 'Total recaudado', count: total_revenue, color: '#D97706', icon: <DollarSign size={16} />, suffix: '$', isAmount: true },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: `${stat.color}12`, color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-extrabold text-blue-955">
                {stat.isAmount ? `$${stat.count.toFixed(2)}` : stat.count}
              </p>
              <p className="text-slate-400 text-xs">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por ciudadano o ID..."
            value={search}
            onChange={(e) => set_search(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-white"
            style={{ borderColor: '#e2e8f0', color: '#1e293b' }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} style={{ color: '#64748b' }} />
          {(['ALL', 'PENDING_PAYMENT', 'PAID'] as FilterType[]).map((f) => (
            <button key={f}
              onClick={() => set_filter(f)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border"
              style={{
                background: filter === f ? `${BRAND}18` : 'white',
                borderColor: filter === f ? `${BRAND}40` : '#e2e8f0',
                color: filter === f ? BRAND : '#64748b',
              }}>
              {f === 'ALL' ? 'Todos' : f === 'PENDING_PAYMENT' ? '⏳ Pendientes' : '✅ Pagados'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
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
              {is_loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">Cargando cobros...</p>
                  </td>
                </tr>
              ) : filtered_applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Receipt size={40} className="mx-auto mb-3 text-slate-200" />
                    <p className="text-slate-400">No hay cobros que coincidan</p>
                  </td>
                </tr>
              ) : (
                filtered_applications.map((app) => {
                  const payment = app.payment
                  const is_paid = ['PAGADO', 'PAID', 'APROBADO', 'APPROVED'].includes(app.status)
                  return (
                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-blue-955 text-sm font-mono">#{app.id?.slice(0, 8).toUpperCase()}</p>
                        <p className="text-slate-400 text-xs">
                          {app.created_at ? new Date(app.created_at).toLocaleDateString('es-EC') : '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-blue-955 text-sm">
                          {app.citizen?.first_name} {app.citizen?.last_name}
                        </p>
                        <p className="text-slate-400 text-xs">CI: {app.citizen?.national_id || '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background: `${PROCEDURE_COLOR[app.procedure_type] ?? '#64748b'}15`,
                            color: PROCEDURE_COLOR[app.procedure_type] ?? '#64748b',
                          }}>
                          {PROCEDURE_LABEL[app.procedure_type] ?? app.procedure_type}
                        </span>
                        <p className="text-slate-400 text-xs mt-1">{app.predio?.location ?? '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        {payment ? (
                          <p className="text-lg font-extrabold text-purple-700">${Number(payment.amount).toFixed(2)}</p>
                        ) : (
                          <p className="text-slate-400 text-sm italic">Por registrar</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background: is_paid ? 'rgba(22,163,74,0.1)' : 'rgba(124,58,237,0.1)',
                            color: is_paid ? '#16A34A' : '#7C3AED',
                            border: `1px solid ${is_paid ? 'rgba(22,163,74,0.3)' : 'rgba(124,58,237,0.3)'}`,
                          }}>
                          {is_paid ? '✅ Pagado' : '⏳ Pend. pago'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/finance/payments/${app.id}`}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                          style={{ background: `${BRAND}10`, color: BRAND, border: `1px solid ${BRAND}25` }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${BRAND}18`}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = `${BRAND}10`}>
                          <Eye size={14} /> {is_paid ? 'Ver' : 'Gestionar'}
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

