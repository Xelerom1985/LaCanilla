import { useState, useEffect, useRef, useCallback } from 'react'
import { db, ref, runTransaction } from '../firebase'

const ENCUESTA_KEY = 'lp_encuesta_votada'
const OPCIONES = [
  { key: 'op1', label: 'Sí, desde la App' },
  { key: 'op2', label: 'No, prefiero los grupos de WhatsApp' },
  { key: 'op3', label: '¡Las dos opciones!' },
]

function Encuesta({ votos }) {
  const [votado, setVotado]   = useState(() => localStorage.getItem(ENCUESTA_KEY))
  const [voting, setVoting]   = useState(false)

  const total = OPCIONES.reduce((s, o) => s + (votos?.[o.key] || 0), 0)

  const votar = async (key) => {
    if (voting || votado) return
    setVoting(true)
    try {
      await runTransaction(ref(db, `encuesta/votos/${key}`), (curr) => (curr || 0) + 1)
      localStorage.setItem(ENCUESTA_KEY, key)
      setVotado(key)
    } catch { /* silencioso */ }
    setVoting(false)
  }

  return (
    <div className="mx-3 mt-3">
      <div
        className="rounded-2xl border border-[#16a34a]/40 p-4 flex flex-col gap-3 shadow-xl"
        style={{ background: 'rgba(22,163,74,0.10)', backdropFilter: 'blur(12px)' }}
      >
        {/* Encabezado */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#16a34a]/50 text-[#c06070] uppercase tracking-widest">
            Encuesta
          </span>
        </div>

        <p className="text-white font-semibold text-sm leading-snug">
          ¿Te gustaría tener un panel de novedades de CSD La Canilla en la App?
        </p>

        {!votado ? (
          <div className="flex flex-col gap-2">
            {OPCIONES.map(op => (
              <button
                key={op.key}
                onClick={() => votar(op.key)}
                disabled={voting}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-white border border-white/15 active:opacity-70 transition-all disabled:opacity-50"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                {op.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-green-400 text-sm font-semibold text-center">¡Gracias por tu voto! 🎉</p>
            {OPCIONES.map(op => {
              const n    = votos?.[op.key] || 0
              const pct  = total > 0 ? Math.round((n / total) * 100) : 0
              const mine = votado === op.key
              return (
                <div key={op.key} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${mine ? 'text-white font-bold' : 'text-white/60'}`}>
                      {op.label} {mine && '✓'}
                    </span>
                    <span className={`text-xs font-bold ${mine ? 'text-[#e08090]' : 'text-white/40'}`}>{pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/8 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: mine ? '#16a34a' : 'rgba(255,255,255,0.25)' }}
                    />
                  </div>
                  <span className="text-white/25 text-[10px]">{n} {n === 1 ? 'voto' : 'votos'}</span>
                </div>
              )
            })}
            <p className="text-white/25 text-[10px] text-center">{total} respuestas en total</p>
          </div>
        )}
      </div>
    </div>
  )
}

function PinchZoomImage({ src, alt, onClose }) {
  const [scale, setScale]   = useState(1)
  const [pos, setPos]       = useState({ x: 0, y: 0 })
  const touch               = useRef({})
  const lastTap             = useRef(0)

  const clampScale = (s) => Math.min(Math.max(s, 1), 4)

  const onTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      touch.current.startDist = Math.hypot(dx, dy)
      touch.current.startScale = scale
      touch.current.midX = (e.touches[0].clientX + e.touches[1].clientX) / 2
      touch.current.midY = (e.touches[0].clientY + e.touches[1].clientY) / 2
    } else if (e.touches.length === 1) {
      touch.current.startX = e.touches[0].clientX - pos.x
      touch.current.startY = e.touches[0].clientY - pos.y
    }
  }, [scale, pos])

  const onTouchMove = useCallback((e) => {
    e.preventDefault()
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      const newScale = clampScale(touch.current.startScale * (dist / touch.current.startDist))
      setScale(newScale)
      if (newScale === 1) setPos({ x: 0, y: 0 })
    } else if (e.touches.length === 1 && scale > 1) {
      setPos({
        x: e.touches[0].clientX - touch.current.startX,
        y: e.touches[0].clientY - touch.current.startY,
      })
    }
  }, [scale])

  const onTouchEnd = useCallback((e) => {
    if (e.changedTouches.length === 1) {
      const now = Date.now()
      if (now - lastTap.current < 300) {
        // doble tap: si hay zoom lo resetea, si no hace zoom 2.5x
        if (scale > 1) { setScale(1); setPos({ x: 0, y: 0 }) }
        else setScale(2.5)
        lastTap.current = 0
      } else {
        // tap simple: si no hay zoom, cerrar
        if (scale <= 1) {
          onClose()
          return
        }
        lastTap.current = now
      }
    }
    if (scale <= 1) { setScale(1); setPos({ x: 0, y: 0 }) }
  }, [scale, onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.97)', touchAction: 'none' }}
      onClick={onClose}
    >
      <button
        className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center z-10"
        style={{ background: 'rgba(255,255,255,0.15)' }}
        onClick={onClose}
      >
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <img
        src={src}
        alt={alt}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          transform: `scale(${scale}) translate(${pos.x / scale}px, ${pos.y / scale}px)`,
          transformOrigin: 'center center',
          transition: scale === 1 ? 'transform 0.2s ease' : 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          cursor: scale > 1 ? 'grab' : 'zoom-in',
        }}
      />
      <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-1 pointer-events-none">
        <p className="text-white/20 text-[10px]">
          {scale > 1 ? 'Doble tap para resetear' : 'Pellizco para zoom · Doble tap 2.5x'}
        </p>
      </div>
    </div>
  )
}

const formatDia = (dia) => {
  if (!dia) return '—'
  if (/^\d{4}-\d{2}-\d{2}$/.test(dia)) {
    const d = new Date(dia + 'T12:00:00')
    return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
  }
  return dia
}

const CATS_LIVE = [
  { key: 'reservaFem',  label: 'Reserva Femenino' },
  { key: 'reservaMasc', label: 'Reserva Masculino' },
  { key: '5ta',         label: '5ta División' },
  { key: '4ta',         label: '4ta División' },
  { key: '6ta',         label: '6ta División' },
  { key: 'mas33',       label: 'Seniors +33' },
  { key: 'fem1ra',      label: '1ra Femenino' },
  { key: '3ra',         label: '3ra División' },
  { key: 'mas40',       label: 'Seniors +40' },
  { key: '1ra',         label: '1ra División' },
]

export default function Home({ data }) {
  const { proximoPartido, bannerImagen, categorias, transmitiendo } = data
  const [zoom, setZoom] = useState(false)

  useEffect(() => {
    if (!zoom) return
    window.history.pushState({ zoom: true }, '')
    const handlePop = () => setZoom(false)
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  }, [zoom])

  const jugandoAhora = CATS_LIVE.filter(c => categorias?.[c.key]?.jugando === true)

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-4 pt-10 pb-6 relative overflow-hidden" style={{ background: 'rgba(15,92,34,0.85)', backdropFilter: 'blur(8px)' }}>
        <div className="flex items-center gap-3 relative z-10">
          <img
            src="/escudo.png"
            alt="CSD La Canilla"
            className="w-14 h-14 rounded-full object-contain border-2 border-white/30 shadow-lg"
            onError={e => { e.target.style.display = 'none' }}
          />
          <div>
            <p className="text-white/70 text-xs tracking-widest uppercase">Club Social y Deportivo</p>
            <h1 className="text-white font-bold text-xl leading-tight">La Canilla</h1>
          </div>
        </div>
      </div>

      {/* Banner Próximo Partido */}
      <div className="mx-3 -mt-4 relative z-10">
        <div className="rounded-2xl border border-white/10 p-4 shadow-xl" style={{ background: 'rgba(7,26,13,0.88)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-5 bg-[#16a34a] rounded-full" />
            <p className="text-[#16a34a] font-semibold text-sm uppercase tracking-wider">Próximo Partido</p>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white font-bold text-lg leading-tight">
                vs. {proximoPartido?.rival || '—'}
              </p>
              <p className="text-gray-400 text-sm mt-0.5 capitalize">
                {formatDia(proximoPartido?.dia)}
              </p>
            </div>
            {proximoPartido?.mapsUrl ? (
              <a href={proximoPartido.mapsUrl} target="_blank" rel="noopener noreferrer"
                className="rounded-xl px-3 py-2 flex flex-col items-center justify-center gap-0.5 shrink-0"
                style={{ background: 'rgba(22,163,74,0.2)' }}>
                <svg className="w-5 h-5 text-[#16a34a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-[#16a34a] text-[9px] font-bold leading-none">Ver en Maps</span>
              </a>
            ) : (
              <div className="rounded-xl px-3 py-2 shrink-0" style={{ background: 'rgba(22,163,74,0.2)' }}>
                <svg className="w-5 h-5 text-[#16a34a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            )}
          </div>
          {proximoPartido?.cancha && (
            <p className="text-gray-500 text-xs mt-2 border-t border-white/5 pt-2">
              📍 {proximoPartido.cancha}
            </p>
          )}
        </div>
      </div>

      {/* En Vivo */}
      {jugandoAhora.length > 0 && (
        <div className="mx-3 mt-3">
          <div className="rounded-2xl border border-red-500/30 p-4 shadow-xl flex flex-col gap-3" style={{ background: 'rgba(180,0,0,0.12)', backdropFilter: 'blur(12px)' }}>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              <p className="text-red-400 font-bold text-sm uppercase tracking-wider">Jugando Ahora</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {jugandoAhora.map(cat => (
                <span key={cat.key}
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-white border border-red-500/40"
                  style={{ background: 'rgba(200,0,0,0.25)' }}>
                  {cat.label}
                </span>
              ))}
            </div>
            {transmitiendo === true && (
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 rounded-xl py-3 font-bold text-white text-sm active:opacity-80 transition-opacity"
                style={{ background: '#FF0000' }}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white shrink-0">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                VER PARTIDO EN VIVO
              </a>
            )}
          </div>
        </div>
      )}

      {/* Encuesta */}
      {data.encuesta?.activa === true && (
        <Encuesta votos={data.encuesta?.votos} />
      )}

      {/* Foto del partido */}
      {bannerImagen && (
        <div className="mx-3 mt-3">
          <div className="rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center"
            style={{ background: 'rgba(7,26,13,0.6)' }}>
            <img
              src={bannerImagen}
              alt="Foto del partido"
              className="w-full object-contain cursor-zoom-in"
              style={{ maxHeight: '50vh' }}
              onClick={() => setZoom(true)}
            />
          </div>
        </div>
      )}

      {zoom && bannerImagen && (
        <PinchZoomImage src={bannerImagen} alt="Foto del partido" onClose={() => setZoom(false)} />
      )}

      {/* Redes Sociales */}
      <div className="mx-3 mt-3">
        <div className="rounded-2xl border border-white/10 p-4 shadow-xl flex flex-col items-center gap-3"
          style={{ background: 'rgba(7,26,13,0.88)', backdropFilter: 'blur(12px)' }}>
          <p className="text-white/60 text-sm">Seguinos en nuestras redes</p>
          <div className="flex items-center gap-10">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-12 h-12 rounded-2xl transition-opacity active:opacity-70"
              style={{ background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}
            >
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-12 h-12 rounded-2xl transition-opacity active:opacity-70"
              style={{ background: '#FF0000' }}
            >
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <p className="text-white/20 text-xs text-center pt-2 pb-2">Developed by CSD La Canilla</p>

      <div className="h-6" />
    </div>
  )
}
