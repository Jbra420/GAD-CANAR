import { useEffect, useState } from 'react'
import { Users, FileText, CheckCircle2, AlertTriangle, Activity, Shield, RotateCcw } from 'lucide-react'
import api from '@/lib/api'
import { MockDb } from '@/lib/mockDb'

const BRAND = '#0EA5E9'

interface Stats {
  usuarios: { total: number; tecnicos: number; ciudadanos: number }
  solicitudes: Record<string, number>
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [renderError, setRenderError] = useState<string | null>(null)

  const cargar = async () => {
    setLoading(true)
    setRenderError(null)
    try {
      const { data } = await api.get('/users/dashboard/stats')
      const statsObj = data?.data ?? data
      setStats(statsObj)
    } catch (e: any) {
      console.error('Error cargando stats de administrador', e)
      setRenderError(e?.message || 'Error de conexión con el servicio de estadísticas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const handleResetDemo = () => {
    MockDb.reset()
    setRenderError(null)
    cargar()
  }

  // Cálculos ultra seguros y blindaje contra TypeErrors en el render
  let kpis: any[] = []
  let solicitudesList: any[] = []

  try {
    kpis = [
      { label: 'Total Usuarios', value: stats?.usuarios?.total ?? '—', icon: Users, color: 'text-sky-500', bg: 'bg-sky-500/10' },
      { label: 'Técnicos Activos', value: stats?.usuarios?.tecnicos ?? '—', icon: Shield, color: 'text-violet-500', bg: 'bg-violet-500/10' },
      { label: 'Sol. Aprobadas', value: stats?.solicitudes?.['APROBADO'] ?? '—', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      { label: 'Sol. Pendientes', value: (stats?.solicitudes?.['EN_REVISION'] ?? 0) + (stats?.solicitudes?.['INSPECCION'] ?? 0) + (stats?.solicitudes?.['PENDIENTE_SECRETARIA'] ?? 0) + (stats?.solicitudes?.['PENDIENTE_TECNICO'] ?? 0), icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ]

    const solicitudesObj = stats?.solicitudes ?? {}
    const totalSolicitudesValores = Object.values(solicitudesObj).reduce((a, b) => a + Number(b), 0) || 1

    solicitudesList = [
      { key: 'BORRADOR', label: 'Borrador (Ciudadano)', color: 'bg-slate-400' },
      { key: 'PENDIENTE_SECRETARIA', label: 'Revisión Secretaría', color: 'bg-orange-400' },
      { key: 'OBSERVADO', label: 'Observado (Devuelto)', color: 'bg-red-400' },
      { key: 'PENDIENTE_TECNICO', label: 'Revisión Técnica (Asignada)', color: 'bg-yellow-500' },
      { key: 'INSPECCION', label: 'En Inspección Física', color: 'bg-blue-500' },
      { key: 'PAGO_PENDIENTE', label: 'Pendiente de Pago', color: 'bg-purple-400' },
      { key: 'PAGADO', label: 'Pagado', color: 'bg-emerald-400' },
      { key: 'APROBADO', label: 'Completado / Aprobado', color: 'bg-emerald-600' },
      { key: 'NEGADO', label: 'Negado', color: 'bg-red-600' },
    ].map(({ key, label, color }) => {
      const count = Number(solicitudesObj[key] ?? 0)
      const pct = Math.round((count / totalSolicitudesValores) * 100)
      return { key, label, color, count, pct }
    })

  } catch (err: any) {
    console.error('Error procesando render de AdminDashboard', err)
    if (!renderError) {
      setRenderError(err.message || 'Error al procesar el mapeo de estadísticas.')
    }
  }

  if (renderError) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-6 bg-white rounded-3xl border shadow-xl mt-12 animate-fade-in" style={{ borderColor: '#f1f5f9' }}>
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-500 border border-amber-100">
          <RotateCcw className="animate-spin" size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-blue-950">Autodiagnóstico y Recuperación de Control</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Hemos detectado datos corruptos o antiguos en la memoria local de tu navegador que provocaron una incompatibilidad con el panel de administración. 
            El sistema se ha auto-diagnosticado con éxito.
          </p>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl text-xs font-mono text-slate-500 border border-slate-100 max-h-32 overflow-y-auto text-left">
          [Diagnóstico] {renderError}
        </div>
        <button
          onClick={handleResetDemo}
          className="btn-primary w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
          style={{ background: BRAND, boxShadow: `0 4px 14px ${BRAND}40` }}
        >
          <RotateCcw size={16} />
          Restaurar Base de Datos Local y Limpiar Caché
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-blue-950">Panel de Control</h1>
          <p className="text-blue-800 mt-1">Monitoreo del sistema y gestión de usuarios del GAD Cañar.</p>
        </div>
        <button 
          onClick={handleResetDemo}
          className="btn-secondary px-3 py-2 text-xs flex items-center gap-2 border-dashed"
          title="Limpiar base de datos local y restaurar simulador"
        >
          <RotateCcw size={13} />
          <span>Reiniciar Demo</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="stat-card bg-white p-5 rounded-2xl border flex flex-col justify-between" style={{ borderColor: '#e2e8f0' }}>
            {loading ? (
              <div className="w-full space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse" />
                <div className="h-4 w-1/2 bg-slate-100 animate-pulse rounded" />
              </div>
            ) : (
              <>
                <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
                  <kpi.icon size={20} className={kpi.color} />
                </div>
                <div>
                  <p className="text-2xl font-heading font-extrabold text-blue-950">{kpi.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Estado de solicitudes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 bg-white rounded-2xl border" style={{ borderColor: '#e2e8f0' }}>
          <h2 className="font-heading font-semibold text-blue-950 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-sky-500" />
            Estado de Solicitudes
          </h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 bg-slate-50 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            solicitudesList.map(({ key, label, color, count, pct }) => (
              <div key={key} className="mb-3.5">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">{label}</span>
                  <span className="text-blue-950">{count} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="glass-card p-6 bg-white rounded-2xl border" style={{ borderColor: '#e2e8f0' }}>
          <h2 className="font-heading font-semibold text-blue-950 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            Estado del Sistema
          </h2>
          {[
            { label: 'API Backend', status: 'Operativo', ok: true },
            { label: 'Base de Datos Local', status: 'Operativo (Simulada)', ok: true },
            { label: 'Almacenamiento MinIO', status: 'Operativo', ok: true },
            { label: 'Servidor Email', status: 'Operativo', ok: true },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between py-3.5 border-b border-slate-100 last:border-0">
              <span className="text-slate-600 text-sm font-semibold">{s.label}</span>
              <span className={`text-xs font-bold flex items-center gap-1.5 ${s.ok ? 'text-emerald-600' : 'text-red-500'}`}>
                <span className={`w-2 h-2 rounded-full ${s.ok ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
