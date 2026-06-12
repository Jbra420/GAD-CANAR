import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, User, MapPin, AlertCircle,
  DollarSign, CheckCircle2, Clock, Receipt, CreditCard,
} from 'lucide-react'
import { applications_api } from '@/lib/api.calls'
import { formatDateTime } from '@/lib/utils'

const PROCEDURE_LABEL: Record<string, string> = {
  PERMISO_CONSTRUCCION: 'Permiso de Construcción',
  LINEA_FABRICAS: 'Línea de Fábricas',
  APROBACION_PLANOS: 'Aprobación de Planos',
}

const BASE_FEES: Record<string, number> = {
  LINEA_FABRICAS: 25.00,
  APROBACION_PLANOS: 80.00,
  PERMISO_CONSTRUCCION: 150.00,
}

interface Payment {
  id: string
  amount: number
  status: string
  concept: string
  notes?: string | null
  created_at: string
}

interface FinanceDetailApplication {
  id: string
  procedure_type: string
  status: string
  updated_at: string
  citizen?: {
    first_name: string
    last_name: string
    national_id: string
    email: string
    phone?: string | null
  } | null
  predio?: {
    location: string
    address: string
    area?: number | null
  } | null
  technical_opinion?: {
    observations?: string | null
    created_at?: string | null
  } | null
  payment?: Payment | null
}

export function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [application, set_application] = useState<FinanceDetailApplication | null>(null)
  const [is_loading, set_is_loading] = useState(true)
  const [error, set_error] = useState<string | null>(null)
  const [is_submitting, set_is_submitting] = useState(false)

  // Billing form
  const [amount, set_amount] = useState('')
  const [concept, set_concept] = useState('')
  const [notes, set_notes] = useState('')

  useEffect(() => {
    const loadApplicationDetail = async () => {
      if (!id) return
      try {
        const { data } = await applications_api.getById(id)
        const mapped: FinanceDetailApplication = {
          id: data.id,
          procedure_type: data.tipoTramite || '',
          status: data.estado || '',
          updated_at: data.updatedAt || '',
          citizen: data.ciudadano ? {
            first_name: data.ciudadano.nombre || '',
            last_name: data.ciudadano.apellido || '',
            national_id: data.ciudadano.cedula || '',
            email: data.ciudadano.email || '',
            phone: data.ciudadano.telefono || null,
          } : null,
          predio: data.predio ? {
            location: data.predio.ubicacion || '',
            address: data.predio.direccion || '',
            area: data.predio.area || null,
          } : null,
          technical_opinion: data.dictamenTecnico ? {
            observations: data.dictamenTecnico.observaciones || null,
            created_at: data.dictamenTecnico.creadoEn || null,
          } : null,
          payment: data.cobros && data.cobros.length > 0 ? {
            id: data.cobros[0].id,
            amount: Number(data.cobros[0].monto || 0),
            status: data.cobros[0].estado || '',
            concept: data.cobros[0].concepto || '',
            notes: data.cobros[0].notas || null,
            created_at: data.cobros[0].createdAt || '',
          } : null,
        }
        set_application(mapped)
        const procedure_type = mapped.procedure_type
        const base = BASE_FEES[procedure_type] ?? 50
        const area = mapped.predio?.area ?? 0
        const suggested_amount = base + (area * 0.20)
        set_amount(suggested_amount.toFixed(2))
        set_concept(`${PROCEDURE_LABEL[procedure_type] ?? procedure_type} — ${mapped.predio?.address ?? 'Predio'}`)
      } catch {
        set_error('No se pudo cargar la solicitud')
      } finally {
        set_is_loading(false)
      }
    }
    loadApplicationDetail()
  }, [id])

  const handleRegisterPayment = async () => {
    if (!id || !amount || !concept) {
      set_error('Completa el monto y el concepto del cobro')
      return
    }
    set_is_submitting(true)
    set_error(null)
    try {
      await applications_api.charge(id, {
        amount: parseFloat(amount),
        concept,
        notes: notes.trim() || undefined,
      })
      navigate('/finance/payments')
    } catch (e: any) {
      set_error(e.response?.data?.message || 'Error al registrar el cobro')
    } finally {
      set_is_submitting(false)
    }
  }

  const handleMarkAsPaid = async () => {
    if (!id) return
    set_is_submitting(true)
    set_error(null)
    try {
      await applications_api.pay(id)
      navigate('/finance/payments')
    } catch (e: any) {
      set_error(e.response?.data?.message || 'Error al marcar como pagado')
    } finally {
      set_is_submitting(false)
    }
  }

  if (is_loading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-2xl shimmer" />)}
      </div>
    )
  }

  if (!application || error) {
    return (
      <div className="glass-card p-12 text-center max-w-xl mx-auto">
        <AlertCircle size={40} className="mx-auto mb-4 text-red-500" />
        <p className="text-red-600">{error || 'Solicitud no encontrada'}</p>
        <Link to="/finance/payments" className="btn-secondary mt-4 inline-flex">
          <ArrowLeft size={16} /> Volver a cobros
        </Link>
      </div>
    )
  }

  const payment = application.payment
  const payment_status = payment?.status
  const procedure_label = PROCEDURE_LABEL[application.procedure_type] ?? application.procedure_type
  const is_pending_payment = application.status === 'PENDIENTE_PAGO' || application.status === 'PENDING_PAYMENT'
  const is_paid = ['PAGADO', 'PAID', 'APROBADO', 'APPROVED'].includes(application.status)

  return (
    <div className="animate-fade-in space-y-5 max-w-3xl mx-auto pb-10">

      {/* ── Header ── */}
      <div className="flex items-start gap-4">
        <Link to="/finance/payments" className="btn-secondary p-2 mt-1 flex-shrink-0">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-heading text-xl font-bold text-blue-955">{procedure_label}</h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: is_paid ? 'rgba(22,163,74,0.1)' : 'rgba(124,58,237,0.1)',
                color: is_paid ? '#16A34A' : '#7C3AED',
                border: `1px solid ${is_paid ? 'rgba(22,163,74,0.3)' : 'rgba(124,58,237,0.3)'}`,
              }}>
              {is_paid ? '✅ Pagado' : is_pending_payment ? '💰 Pendiente de pago' : application.status}
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
            <Clock size={14} />
            Aprobado técnicamente: {formatDateTime(application.technical_opinion?.created_at ?? application.updated_at)}
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />{error}
        </div>
      )}

      {/* ── Citizen Data ── */}
      <div className="glass-card p-5">
        <h2 className="font-heading font-semibold text-blue-955 mb-4 flex items-center gap-2 text-sm">
          <User size={15} className="text-purple-600" /> Ciudadano
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { l: 'Nombre', v: `${application.citizen?.first_name} ${application.citizen?.last_name}` },
            { l: 'Cédula', v: application.citizen?.national_id || '—' },
            { l: 'Correo', v: application.citizen?.email },
            { l: 'Teléfono', v: application.citizen?.phone || '—' },
          ].map(({ l, v }) => (
            <div key={l}>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-0.5">{l}</p>
              <p className="text-blue-955 font-medium">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Procedure and Property ── */}
      <div className="glass-card p-5">
        <h2 className="font-heading font-semibold text-blue-955 mb-4 flex items-center gap-2 text-sm">
          <MapPin size={15} className="text-purple-600" /> Trámite y Predio
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { l: 'Tipo de trámite', v: procedure_label },
            { l: 'Zona', v: application.predio?.location === 'URBANO' || application.predio?.location === 'URBAN' ? '🏙️ Urbano' : '🌿 Rural' },
            { l: 'Dirección', v: application.predio?.address },
            { l: 'Área', v: application.predio?.area ? `${application.predio.area} m²` : '—' },
          ].map(({ l, v }) => (
            <div key={l}>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-0.5">{l}</p>
              <p className="text-blue-955 font-medium">{v || '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Technical Opinion ── */}
      {application.technical_opinion && (
        <div className="glass-card p-5 border-green-250 bg-green-50/10">
          <h2 className="font-heading font-semibold text-blue-955 mb-3 flex items-center gap-2 text-sm">
            <CheckCircle2 size={15} className="text-green-600" /> Dictamen Técnico (aprobado)
          </h2>
          {application.technical_opinion.observations && (
            <p className="text-slate-600 text-sm bg-green-50 rounded-xl p-3 border border-green-100">
              {application.technical_opinion.observations}
            </p>
          )}
        </div>
      )}

      {payment && (
        <div className="glass-card p-5" style={{
          borderColor: ['PAGADO', 'PAID'].includes(payment_status) ? 'rgba(22,163,74,0.4)' : 'rgba(124,58,237,0.3)',
        }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-blue-955 flex items-center gap-2 text-sm">
              <Receipt size={15} style={{ color: '#7C3AED' }} /> Cobro Registrado
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: ['PAGADO', 'PAID'].includes(payment_status) ? 'rgba(22,163,74,0.1)' : 'rgba(124,58,237,0.1)',
                color: ['PAGADO', 'PAID'].includes(payment_status) ? '#16A34A' : '#7C3AED',
                border: `1px solid ${['PAGADO', 'PAID'].includes(payment_status) ? 'rgba(22,163,74,0.3)' : 'rgba(124,58,237,0.3)'}`,
              }}>
              {['PAGADO', 'PAID'].includes(payment_status) ? '✅ Pagado' : '⏳ Pendiente de pago'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-0.5">Monto</p>
              <p className="text-2xl font-extrabold text-purple-700">${Number(payment.amount).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-0.5">Concepto</p>
              <p className="text-blue-955 font-medium">{payment.concept}</p>
            </div>
          </div>

          {payment.notes && (
            <p className="text-slate-500 text-sm bg-slate-50 rounded-xl p-3 border border-slate-200">
              {payment.notes}
            </p>
          )}

          {['PENDIENTE', 'PENDING'].includes(payment_status) && (
            <button onClick={handleMarkAsPaid} disabled={is_submitting}
              className="w-full mt-4 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all"
              style={{
                background: 'linear-gradient(135deg, #16A34A 0%, #166534 100%)',
                boxShadow: '0 4px 20px rgba(22,163,74,0.3)',
              }}>
              {is_submitting
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><CreditCard size={18} /> Confirmar Pago Recibido</>}
            </button>
          )}
        </div>
      )}

      {!payment && is_pending_payment && (
        <div className="glass-card p-5 space-y-5" style={{ borderColor: 'rgba(124,58,237,0.3)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ background: 'rgba(124,58,237,0.1)' }}>
              <DollarSign size={20} style={{ color: '#7C3AED' }} />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-blue-955">Registrar Cobro</h2>
              <p className="text-slate-400 text-xs">El técnico aprobó este trámite — registra el cobro correspondiente</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100">
            <p className="text-xs font-bold uppercase tracking-wider mb-2 text-purple-700">
              📊 Tarifa referencial
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {Object.entries(BASE_FEES).map(([tipo, base]) => (
                <div key={tipo} className={`p-2 rounded-lg text-center ${application.procedure_type === tipo ? 'ring-2 ring-purple-400' : ''}`}
                  style={{ background: 'white', border: '1px solid rgba(124,58,237,0.1)' }}>
                  <p className="font-bold text-purple-700">${base}</p>
                  <p className="text-slate-400 text-xs leading-tight">{PROCEDURE_LABEL[tipo]?.split(' ')[0]}</p>
                </div>
              ))}
            </div>
            <p className="text-slate-400 text-xs mt-2">
              + $0.20/m² de área del predio. Monto pre-calculado: <strong className="text-purple-700">${amount}</strong>
            </p>
          </div>

          <div>
            <label className="input-label">Monto a Cobrar (USD) *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={e => set_amount(e.target.value)}
                className="input-field pl-8"
                placeholder="0.00"
                id="cobro-monto"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Concepto *</label>
            <input
              type="text"
              value={concept}
              onChange={e => set_concept(e.target.value)}
              className="input-field"
              placeholder="Descripción del cobro..."
              id="cobro-concepto"
            />
          </div>

          <div>
            <label className="input-label">Notas adicionales <span className="text-slate-400 normal-case">— opcional</span></label>
            <textarea
              value={notes}
              onChange={e => set_notes(e.target.value)}
              className="input-field resize-none"
              rows={3}
              placeholder="Información adicional para el comprobante..."
              id="cobro-notas"
            />
          </div>

          <button
            onClick={handleRegisterPayment}
            disabled={is_submitting || !amount || !concept}
            className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all"
            style={{
              background: !amount || !concept ? '#e2e8f0' : 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
              color: !amount || !concept ? '#94a3b8' : 'white',
              boxShadow: amount && concept ? '0 4px 20px rgba(124,58,237,0.3)' : 'none',
              cursor: !amount || !concept ? 'not-allowed' : 'pointer',
            }}>
            {is_submitting
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Receipt size={18} /> Registrar Cobro</>}
          </button>
        </div>
      )}

      {is_paid && (
        <div className="glass-card p-5 text-center border-green-250 bg-green-50/10">
          <CheckCircle2 size={40} className="mx-auto mb-3 text-green-500" />
          <h2 className="font-heading font-bold text-blue-955 text-lg mb-1">Trámite Completado</h2>
          <p className="text-slate-500 text-sm">El ciudadano ha sido notificado de la aprobación y pago de su trámite.</p>
        </div>
      )}
    </div>
  )
}

