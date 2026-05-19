import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Clock, FileText, CheckCircle2, Star, MapPin, Users, Zap } from 'lucide-react'

const STATS = [
  { value: '3,200+', label: 'Trámites procesados', icon: FileText },
  { value: '48h', label: 'Tiempo promedio de respuesta', icon: Clock },
  { value: '98%', label: 'Tasa de satisfacción', icon: Star },
  { value: '12', label: 'Técnicos especializados', icon: Users },
]

const FEATURES = [
  {
    icon: FileText,
    title: 'Trámites 100% Digitales',
    desc: 'Gestiona certificados, permisos y planificación territorial sin desplazarte al municipio.',
    color: 'var(--gold)',
    bg: 'rgba(37,99,235,0.1)',
    border: 'rgba(37,99,235,0.2)',
  },
  {
    icon: Shield,
    title: 'Firma Electrónica Legal',
    desc: 'Tus documentos tienen validez legal con firma XAdES-BES compatible con la normativa ecuatoriana.',
    color: 'var(--red)',
    bg: 'rgba(204,34,41,0.1)',
    border: 'rgba(204,34,41,0.2)',
  },
  {
    icon: MapPin,
    title: 'Cobertura Urbana y Rural',
    desc: 'Servicio disponible para todos los predios del cantón Cañar, áreas urbanas y rurales.',
    color: 'var(--green)',
    bg: 'rgba(46,139,87,0.1)',
    border: 'rgba(46,139,87,0.2)',
  },
  {
    icon: Clock,
    title: 'Seguimiento en Tiempo Real',
    desc: 'Monitorea el estado de tu solicitud y recibe notificaciones automáticas en cada etapa.',
    color: 'var(--blue)',
    bg: 'rgba(27,127,191,0.1)',
    border: 'rgba(27,127,191,0.2)',
  },
  {
    icon: CheckCircle2,
    title: 'Trazabilidad Total',
    desc: 'Registro notarial digital con hash-chain que garantiza la inmutabilidad de cada decisión.',
    color: 'var(--green)',
    bg: 'rgba(46,139,87,0.1)',
    border: 'rgba(46,139,87,0.2)',
  },
  {
    icon: Zap,
    title: 'Asignación Automática',
    desc: 'El sistema asigna automáticamente el técnico más disponible según tu ubicación geográfica.',
    color: 'var(--gold)',
    bg: 'rgba(37,99,235,0.1)',
    border: 'rgba(37,99,235,0.2)',
  },
]

const TRAMITES = [
  'Certificado de Afectación Vial',
  'Permiso de Construcción',
  'Uso y Ocupación del Suelo',
  'Certificado de Regulación Urbana',
  'Fraccionamiento de Predio',
  'Lotización y Urbanización',
]

export function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--dark)' }}>

      {/* =============================================
          NAVBAR
      ============================================= */}
      <nav style={{
        background: 'rgba(14,14,14,0.95)',
        borderBottom: '1px solid rgba(37,99,235,0.1)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/logo-gad.png"
              alt="GAD Municipal de Cañar"
              className="w-10 h-10 object-contain rounded-lg"
              style={{ background: 'white', padding: '2px' }}
            />
            <div>
              <p className="font-heading font-bold text-sm leading-tight" style={{ color: '#F0EDD8' }}>
                GAD Cañar
              </p>
              <p style={{ color: 'rgba(240, 237, 216, 0.7)', fontSize: '10px', letterSpacing: '0.08em' }}>
                ORDENAMIENTO TERRITORIAL
              </p>
            </div>
          </div>

          {/* Banda de colores del escudo — decorador */}
          <div className="hidden md:flex items-center gap-1">
            {['var(--red)', 'var(--gold)', 'var(--green)', 'var(--blue)'].map((c, i) => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium" style={{ color: '#F0EDD8' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
              onMouseLeave={e => (e.currentTarget.style.color = '#F0EDD8')}>
              Ingresar
            </Link>
            <Link to="/registro" className="btn-primary px-4 py-2 text-xs">
              Registrarme
            </Link>
          </div>
        </div>
      </nav>

      {/* =============================================
          HERO
      ============================================= */}
      <section className="relative overflow-hidden">
        {/* Fondo decorativo */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(37,99,235,0.07) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        {/* Escudo fantasma de fondo */}
        <div style={{
          position: 'absolute', right: '-5%', top: '50%',
          transform: 'translateY(-50%)',
          width: 500, height: 500,
          opacity: 0.04,
          backgroundImage: 'url(/logo-gad.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          filter: 'blur(1px)',
          pointerEvents: 'none',
        }} />

        <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="max-w-3xl">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-fade-in"
              style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)', color: 'var(--gold)', fontSize: '0.8rem', fontWeight: 600 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              Sistema de Trámites Digitales — Cantón Cañar
            </div>

            {/* Título */}
            <h1 className="font-heading font-extrabold leading-tight mb-6 animate-slide-up text-blue-950"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.1 }}>
              Tu trámite municipal,{' '}
              <span className="text-primary-600">sin filas</span>
              {' '}y sin papel.
            </h1>

            <p className="text-lg leading-relaxed mb-10 animate-slide-up text-blue-800"
              style={{ maxWidth: '540px', animationDelay: '0.1s' }}>
              La plataforma digital del GAD Municipal de Cañar para gestionar permisos de
              ordenamiento territorial de forma segura, rápida y con validez legal.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/registro" className="btn-primary text-base px-8 py-4">
                Iniciar mi trámite
                <ArrowRight size={20} />
              </Link>
              <Link to="/login" className="btn-secondary text-base px-8 py-4">
                Ya tengo cuenta
              </Link>
            </div>

            {/* Banda del escudo como decorador */}
            <div className="mt-12 shield-divider w-48 animate-fade-in" style={{ animationDelay: '0.3s' }} />
          </div>
        </div>
      </section>

      {/* =============================================
          STATS
      ============================================= */}
      <section style={{ borderTop: '1px solid rgba(37,99,235,0.08)', borderBottom: '1px solid rgba(37,99,235,0.08)' }}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <div key={s.label} className="text-center animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <p className="font-heading font-extrabold text-primary-600 mb-1"
                  style={{ fontSize: '2.5rem', lineHeight: 1 }}>
                  {s.value}
                </p>
                <p className="text-blue-800" style={{ fontSize: '0.8rem', fontWeight: 500 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================
          FEATURES
      ============================================= */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            {/* Logo institucional */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img
                  src="/logo-gad.png"
                  alt="Escudo GAD Cañar"
                  className="w-20 h-20 object-contain"
                  style={{ background: 'white', padding: 8, borderRadius: 16, boxShadow: '0 0 40px rgba(37,99,235,0.3)' }}
                />
                <div style={{
                  position: 'absolute', inset: -4,
                  borderRadius: 20,
                  background: 'conic-gradient(#CC2229 0deg 90deg, #2563EB 90deg 180deg, #2E8B57 180deg 270deg, #1B7FBF 270deg 360deg)',
                  opacity: 0.4,
                  zIndex: -1,
                  filter: 'blur(8px)',
                }} />
              </div>
            </div>

            <h2 className="font-heading font-bold mb-4 text-blue-950"
              style={{ fontSize: '2.25rem' }}>
              Una plataforma diseñada{' '}
              <span className="text-primary-600">para Cañar</span>
            </h2>
            <p className="text-blue-800" style={{ maxWidth: 480, margin: '0 auto', fontSize: '1.05rem' }}>
              Desarrollada especialmente para las necesidades del cantón,
              cumpliendo con la normativa ecuatoriana de firma electrónica y protección de datos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="glass-card p-6 animate-fade-in group"
                style={{
                  animationDelay: `${i * 0.08}s`,
                  borderColor: f.border,
                }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all"
                  style={{ background: f.bg, border: `1px solid ${f.border}` }}>
                  <f.icon size={22} style={{ color: f.color }} />
                </div>
                <h3 className="font-heading font-bold text-blue-950 mb-2">{f.title}</h3>
                <p className="text-slate-600" style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================
          TIPOS DE TRÁMITE
      ============================================= */}
      <section className="py-20" style={{ background: 'rgba(37,99,235,0.02)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1">
              <h2 className="font-heading font-bold mb-4 text-blue-950" style={{ fontSize: '2rem' }}>
                Trámites disponibles
              </h2>
              <p className="mb-8 text-blue-800">
                Gestiona cualquier trámite de ordenamiento territorial del cantón Cañar de forma 100% digital.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TRAMITES.map((t) => (
                  <div key={t} className="flex items-center gap-3 p-4 rounded-xl bg-white border border-surface-border">
                    <CheckCircle2 size={16} style={{ color: 'var(--green)', flexShrink: 0 }} />
                    <span className="text-blue-950" style={{ fontSize: '0.875rem', fontWeight: 500 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel de flujo de proceso */}
            <div className="flex-1 max-w-md w-full">
              <div className="glass-card p-6" style={{ borderColor: 'rgba(37,99,235,0.15)' }}>
                <div className="shield-divider mb-6" />
                <h3 className="font-heading font-bold text-blue-950 mb-6">Proceso simplificado</h3>
                {[
                  { num: '01', title: 'Regístrate', desc: 'Crea tu cuenta ciudadana en minutos', color: 'var(--gold)' },
                  { num: '02', title: 'Completa tu solicitud', desc: 'Datos del predio y documentos digitales', color: 'var(--gold)' },
                  { num: '03', title: 'Firma electrónicamente', desc: 'Valida con tu firma digital legal', color: 'var(--red)' },
                  { num: '04', title: 'Inspección técnica', desc: 'El técnico visita el predio y evalúa', color: 'var(--blue)' },
                  { num: '05', title: 'Resolución certificada', desc: 'Recibe tu certificado firmado digitalmente', color: 'var(--green)' },
                ].map((step) => (
                  <div key={step.num} className="flex items-start gap-4 mb-5 last:mb-0">
                    <span className="font-heading font-bold flex-shrink-0"
                      style={{ color: step.color, fontSize: '1.25rem', width: 36 }}>
                      {step.num}
                    </span>
                    <div>
                      <p className="font-semibold text-blue-950 text-sm">{step.title}</p>
                      <p className="text-slate-600" style={{ fontSize: '0.8rem', marginTop: 2 }}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =============================================
          CTA FINAL
      ============================================= */}
      <section className="py-24" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(37,99,235,0.04) 100%)' }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <img src="/logo-gad.png" alt="GAD Cañar" className="w-16 h-16 object-contain mx-auto mb-6"
            style={{ background: 'white', padding: 6, borderRadius: 12 }} />

          <h2 className="font-heading font-extrabold mb-4 text-blue-950" style={{ fontSize: '2.5rem' }}>
            Comienza hoy tu trámite{' '}
            <span className="text-primary-600">sin salir de casa</span>
          </h2>
          <p className="mb-10 text-lg text-blue-800">
            Únete a los ciudadanos que ya gestionan sus trámites de ordenamiento
            territorial de forma digital con el GAD Municipal de Cañar.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/registro" className="btn-primary text-base px-10 py-4">
              Crear cuenta gratuita <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-10 py-4">
              Iniciar sesión
            </Link>
          </div>

          {/* Los 4 colores del escudo como firma */}
          <div className="mt-16 flex items-center justify-center gap-3">
            {[
              { c: '#CC2229', l: 'Rojo' },
              { c: '#2563EB', l: 'Oro' },
              { c: '#2E8B57', l: 'Verde' },
              { c: '#1B7FBF', l: 'Azul' },
            ].map(({ c, l }) => (
              <div key={l} className="flex flex-col items-center gap-1">
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: c, opacity: 0.8 }} />
                <span style={{ color: 'rgba(150,130,60,0.5)', fontSize: '10px' }}>{l}</span>
              </div>
            ))}
          </div>

          <p className="mt-8 text-slate-500" style={{ fontSize: '0.75rem' }}>
            © {new Date().getFullYear()} GAD Municipal de Cañar — Sistema de Ordenamiento Territorial
            <br />Desarrollado bajo estándares de seguridad y normativa ecuatoriana de firma electrónica
          </p>
        </div>
      </section>
    </div>
  )
}
