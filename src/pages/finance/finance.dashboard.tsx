import { useEffect, useState } from 'react'
import { DollarSign, Clock, CheckCircle2, TrendingUp, CreditCard, ArrowUpRight } from 'lucide-react'
import { applications_api } from '@/lib/api.calls'
import { Link } from 'react-router-dom'
import { formatDateTime } from '@/lib/utils'

const BRAND = '#7C3AED'

const PROCEDURE_LABEL: Record<string, string> = {
  PERMISO_CONSTRUCCION: 'Permiso de Construcción',
  LINEA_FABRICAS: 'Línea de Fábricas',
  APROBACION_PLANOS: 'Aprobación de Planos',
}

interface Payment {
  id: string
  amount: number
  status: string
  payment_date?: string | null
  created_at: string
}

interface FinanceApplication {
  id: string
  procedure_type: string
  status: string
  citizen?: {
    first_name: string
    last_name: string
  } | null
  payment?: Payment | null
}

export function FinanceDashboard() {
  const [applications, set_applications] = useState<FinanceApplication[]>([])
  const [is_loading, set_is_loading] = useState(true)

  useEffect(() => {
    applications_api.list({ limit: 100 })
      .then(({ data }) => {
        const mapped = (data.data || []).map((s: any) => {
          const cobro = s.cobros && s.cobros.length > 0 ? s.cobros[0] : null
          return {
            id: s.id,
            procedure_type: s.tipoTramite || '',
            status: s.estado || '',
            citizen: s.ciudadano ? {
              first_name: s.ciudadano.nombre || '',
              last_name: s.ciudadano.apellido || '',
            } : null,
            payment: cobro ? {
              id: cobro.id,
              amount: Number(cobro.monto || 0),
              status: cobro.estado || '',
              payment_date: cobro.fechaPago || null,
              created_at: cobro.createdAt || cobro.updatedAt || '',
            } : null,
          }
        }).filter((app: FinanceApplication) => 
          ['PENDIENTE_PAGO', 'PENDING_PAYMENT', 'PAGADO', 'PAID', 'APROBADO', 'APPROVED'].includes(app.status) && app.payment
        )
        set_applications(mapped)
      })
      .catch(() => set_applications([]))
      .finally(() => set_is_loading(false))
  }, [])

  // Calculate stats
  const pending_applications = applications.filter(s => ['PENDIENTE', 'PENDING'].includes(s.payment?.status || ''))
  const paid_applications = applications.filter(s => ['PAGADO', 'PAID'].includes(s.payment?.status || ''))
  
  const paid_today = paid_applications.filter(s => {
    const today = new Date().toDateString()
    const payment_date = s.payment?.payment_date || s.payment?.created_at
    return payment_date && new Date(payment_date).toDateString() === today
  })

  const revenue_today = paid_today.reduce((acc, s) => acc + (s.payment?.amount || 0), 0)
  const total_revenue = paid_applications.reduce((acc, s) => acc + (s.payment?.amount || 0), 0)

  const stats = [
    { label: 'Cobros Pendientes', value: pending_applications.length, icon: Clock, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Pagados Hoy', value: paid_today.length, icon: CheckCircle2, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Recaudado Hoy ($)', value: `$ ${revenue_today.toFixed(2)}`, icon: DollarSign, color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
    { label: 'Total Histórico ($)', value: `$ ${total_revenue.toFixed(2)}`, icon: TrendingUp, color: '#2563EB', bg: 'rgba(37,99,235,0.1)' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-blue-955">Panel Financiero</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Gestión de cobros, liquidación y registro de pagos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl p-5 border"
            style={{ background: 'white', borderColor: '#e2e8f0', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <ArrowUpRight size={14} style={{ color: '#94a3b8' }} />
            </div>
            <p className="text-3xl font-black text-slate-800">{s.value}</p>
            <p className="text-xs mt-1" style={{ color: '#64748b' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Process Flow */}
      <div className="rounded-2xl p-6 border bg-white" style={{ borderColor: '#e2e8f0' }}>
        <h2 className="font-bold text-blue-955 mb-4">Etapas del Proceso</h2>
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {[
            { label: 'Ciudadano\nSube docs', color: '#2563EB', active: false },
            { label: 'Secretaría\nRevisa', color: '#D97706', active: false },
            { label: 'Técnico\nEvalúa', color: '#2E8B57', active: false },
            { label: 'Financiero\nCobra', color: BRAND, active: true },
            { label: 'Aprobado', color: '#10B981', active: false },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold`}
                  style={{
                    background: step.active ? step.color : '#e2e8f0',
                    color: step.active ? 'white' : '#94a3b8',
                    boxShadow: step.active ? `0 0 20px ${step.color}50` : 'none',
                  }}>
                  {i + 1}
                </div>
                <p className="text-center mt-2 text-xs font-semibold whitespace-pre-line leading-tight"
                  style={{ color: step.active ? step.color : '#94a3b8', maxWidth: 72 }}>
                  {step.label}
                </p>
              </div>
              {i < arr.length - 1 && (
                <div className="w-8 sm:w-16 h-0.5 mx-1 flex-shrink-0" style={{ background: '#e2e8f0' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Payments */}
      <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: '#e2e8f0' }}>
        <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: '#f1f5f9' }}>
          <CreditCard size={18} style={{ color: BRAND }} />
          <h2 className="font-bold text-blue-955">Cobros Pendientes y Recientes</h2>
        </div>
        <div className="divide-y" style={{ borderColor: '#f8fafc' }}>
          {is_loading ? (
            <div className="p-6 space-y-4">
              <div className="h-12 rounded-xl shimmer" />
              <div className="h-12 rounded-xl shimmer" />
            </div>
          ) : applications.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No hay cobros registrados
            </div>
          ) : (
            applications.slice(0, 5).map((app) => {
              const payment = app.payment!
              return (
                <Link to={`/finance/payments/${app.id}`} key={app.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer block">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${BRAND}12`, border: `1px solid ${BRAND}20` }}>
                      <DollarSign size={16} style={{ color: BRAND }} />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-955 text-sm">{app.citizen?.first_name} {app.citizen?.last_name}</p>
                      <p style={{ color: '#64748b', fontSize: '0.75rem' }}>#{app.id.slice(0,8).toUpperCase()} · {PROCEDURE_LABEL[app.procedure_type] || 'Trámite'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-blue-955">${Number(payment.amount).toFixed(2)}</p>
                    <span className="text-xs px-3 py-1 rounded-full font-semibold"
                      style={{
                        background: ['PENDIENTE', 'PENDING'].includes(payment.status) ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                        color: ['PENDIENTE', 'PENDING'].includes(payment.status) ? '#D97706' : '#059669',
                      }}>
                      {payment.status}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>{formatDateTime(payment.created_at)}</span>
                  </div>
                </Link>
              )
            })
          )}
        </div>
        <div className="px-6 py-3 text-center border-t border-slate-100">
          <Link to="/finance/payments" className="text-sm font-semibold" style={{ color: BRAND }}>
            Ver todos los cobros →
          </Link>
        </div>
      </div>

    </div>
  )
}

