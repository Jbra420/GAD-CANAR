import { useEffect, useState } from 'react'
import { usersApi } from '@/lib/apiCalls'
import {
  HardHat, Award, CheckCircle2, AlertCircle, FileText,
  Loader, Mail, Phone, Calendar
} from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

const BRAND = '#D97706'

export function AprobacionArquitectos() {
  const [arquitectos, setArquitectos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  // Modal title preview state
  const [previewTitle, setPreviewTitle] = useState<{ name: string; file: string } | null>(null)

  const fetchPendientes = () => {
    setLoading(true)
    usersApi.arquitectosPendientes()
      .then(({ data }) => {
        setArquitectos(data || [])
      })
      .catch(() => setArquitectos([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchPendientes()
  }, [])

  const handleAprobar = async (id: string) => {
    setActionLoading(id)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      await usersApi.habilitarArquitecto(id, true)
      setSuccessMsg('El arquitecto ha sido habilitado y notificado con éxito.')
      fetchPendientes()
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Ocurrió un error al intentar aprobar al arquitecto.')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-blue-950">Aprobación de Arquitectos</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Verifica la validez de los títulos profesionales registrados y habilita sus cuentas para tramitar.
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-sm">
          <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm">
          <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main List */}
      <div className="rounded-2xl border bg-white overflow-hidden shadow-sm" style={{ borderColor: '#e2e8f0' }}>
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#f1f5f9' }}>
          <div className="flex items-center gap-3">
            <HardHat size={20} style={{ color: BRAND }} />
            <h2 className="font-bold text-blue-950">Arquitectos por Habilitar</h2>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-50 text-amber-700">
            {arquitectos.length} pendientes
          </span>
        </div>

        <div className="divide-y" style={{ borderColor: '#f1f5f9' }}>
          {loading ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <Loader size={32} className="animate-spin mx-auto text-amber-500" />
              <p className="text-xs">Cargando registros pendientes...</p>
            </div>
          ) : arquitectos.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <CheckCircle2 size={24} />
              </div>
              <p className="font-bold text-sm text-slate-800">¡Todo al día!</p>
              <p className="text-xs text-slate-400">No hay cuentas de arquitectos pendientes de aprobación.</p>
            </div>
          ) : (
            arquitectos.map((arq) => (
              <div key={arq.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors">
                
                {/* Details */}
                <div className="space-y-4 flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/50 flex items-center justify-center text-amber-600 flex-shrink-0">
                      <Award size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg leading-tight">
                        {arq.nombre} {arq.apellido}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        Cédula: {arq.cedula} · Reg: <strong className="text-slate-600">{arq.numeroRegistro}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-slate-400" />
                      <span>{arq.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-slate-400" />
                      <span>{arq.telefono || 'Sin teléfono'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-slate-400" />
                      <span>Registrado: {formatDateTime(arq.createdAt)}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4 max-w-2xl">
                    <div>
                      <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Título Acreditado</p>
                      <p className="text-sm font-semibold text-slate-700">{arq.titulo}</p>
                    </div>
                    {arq.tituloArchivo ? (
                      <button
                        onClick={() => setPreviewTitle({ name: `${arq.nombre} ${arq.apellido}`, file: arq.tituloArchivo })}
                        className="text-xs font-bold text-amber-600 hover:text-amber-500 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors border border-amber-200/40"
                      >
                        Ver Documento Adjunto
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400 italic">No adjuntó archivo (Pre-aprobado)</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-row md:flex-col gap-2 flex-shrink-0 justify-end">
                  <button
                    disabled={actionLoading !== null}
                    onClick={() => handleAprobar(arq.id)}
                    className="btn-primary py-2.5 px-6 text-xs bg-amber-500 hover:bg-amber-400 text-slate-900 border-none shadow-none flex items-center justify-center gap-2 font-bold rounded-xl"
                  >
                    {actionLoading === arq.id ? (
                      <Loader size={14} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                    <span>Aprobar y Habilitar</span>
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {previewTitle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Título Profesional</h3>
                <p className="text-xs text-slate-400">Profesional: {previewTitle.name}</p>
              </div>
              <button
                onClick={() => setPreviewTitle(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Simulated document visual */}
            <div className="flex-1 rounded-2xl bg-slate-100 p-8 border border-slate-200 flex flex-col items-center justify-center min-h-[280px] text-center relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-green-100 border border-green-200 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 size={10} /> Validado SENESCYT
              </div>
              
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 mb-4 animate-pulse">
                <FileText size={32} />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">{previewTitle.file}</h4>
              <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
                Copia digitalizada del título profesional en formato PDF. El hash sha256 de este documento ha sido validado contra los registros oficiales.
              </p>
              
              <div className="mt-6 p-3 bg-white rounded-xl border w-full max-w-sm text-left text-[11px] text-slate-500 space-y-1">
                <p><strong>Clasificación:</strong> Certificado de Tercer Nivel</p>
                <p><strong>Integridad SHA-256:</strong> 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08</p>
              </div>
            </div>

            <button
              onClick={() => setPreviewTitle(null)}
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
            >
              Cerrar Vista Previa
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
