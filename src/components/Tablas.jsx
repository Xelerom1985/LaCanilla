import { useState, useEffect, useRef, useCallback } from 'react'

const CATEGORIAS = [
  { key: 'general', label: 'Tabla General' },
  { key: '2011',    label: 'Categoría 2011' },
  { key: '2012',    label: 'Categoría 2012' },
  { key: '2013',    label: 'Categoría 2013' },
  { key: '2014',    label: 'Categoría 2014' },
  { key: '2015',    label: 'Categoría 2015' },
  { key: '2016',    label: 'Categoría 2016' },
  { key: '2017',    label: 'Categoría 2017' },
  { key: '2018',    label: 'Categoría 2018' },
  { key: '2019',    label: 'Categoría 2019' },
  { key: '2020',    label: 'Categoría 2020' },
]

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
        if (scale > 1) { setScale(1); setPos({ x: 0, y: 0 }) }
        else setScale(2.5)
        lastTap.current = 0
      } else {
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
    >
      {/* Botón cerrar */}
      <button
        className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center z-10"
        style={{ background: 'rgba(255,255,255,0.15)' }}
        onClick={onClose}
      >
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Imagen con zoom */}
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

      {/* Hint */}
      <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-1 pointer-events-none">
        <p className="text-white/30 text-xs">{alt}</p>
        <p className="text-white/20 text-[10px]">
          {scale > 1 ? 'Doble tap para resetear' : 'Pellizco para zoom · Doble tap 2.5x'}
        </p>
      </div>
    </div>
  )
}

const isArquero = (nombre) => /\(Arquer[oa]\)/i.test(nombre)

const toList = (obj) =>
  Object.entries(obj || {})
    .map(([id, v]) => ({ id, nombre: typeof v === 'string' ? v : v.nombre }))
    .sort((a, b) => {
      const aA = isArquero(a.nombre), bA = isArquero(b.nombre)
      if (aA && !bA) return -1
      if (!aA && bA) return 1
      return a.nombre.localeCompare(b.nombre)
    })

export default function Tablas({ data }) {
  const [catActiva, setCatActiva] = useState('general')
  const [zoom, setZoom] = useState(null) // null | 'tabla' | 'equipo'

  // Botón atrás cierra el lightbox antes de salir de la sección
  useEffect(() => {
    if (!zoom) return
    window.history.pushState({ zoom: true }, '')
    const handlePop = () => setZoom(null)
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  }, [zoom])

  const tablasImagenes = data.tablasImagenes || {}
  const tablasUrls     = data.tablasUrls     || {}
  const tablasEquipos  = data.tablasEquipos  || {}
  const plantelFotos   = data.plantelFotos   || {}
  const jugadoresDB    = data.jugadores      || {}
  const labelActiva    = CATEGORIAS.find(c => c.key === catActiva)?.label

  const esUrlWeb        = (v) => typeof v === 'string' && v.startsWith('http')
  const esImagenDirecta = (v) => esUrlWeb(v) && /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(v)

  const imgVal       = tablasImagenes[catActiva]
  const urlActiva    = tablasUrls[catActiva]
    || (esUrlWeb(imgVal) && !esImagenDirecta(imgVal) ? imgVal : null)
  const imagenTabla  = (imgVal && (!esUrlWeb(imgVal) || esImagenDirecta(imgVal))) ? imgVal : null
  const imagenEquipo = tablasEquipos[catActiva] || null

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-4 pt-10 pb-5 relative overflow-hidden" style={{ background: 'rgba(15,92,34,0.85)', backdropFilter: 'blur(8px)' }}>
        <h2 className="text-white font-bold text-xl">Tablas y Plantel</h2>
        <p className="text-white/50 text-sm">Temporada actual</p>
      </div>

      {/* Selector de categoría */}
      <div className="px-3 pt-4">
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIAS.map(cat => (
            <button
              key={cat.key}
              onClick={() => { setCatActiva(cat.key); setZoom(null) }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 text-center${cat.key === 'general' ? ' col-span-2' : ''}`}
              style={{
                background: catActiva === cat.key ? '#16a34a' : 'rgba(7,26,13,0.75)',
                border: catActiva === cat.key ? '1px solid #16a34a' : '1px solid rgba(255,255,255,0.08)',
                color: catActiva === cat.key ? '#fff' : 'rgba(255,255,255,0.5)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido tabla */}
      <div className="px-3 mt-3 flex flex-col gap-3">
        {!urlActiva && !imagenTabla && !imagenEquipo ? (
          <div className="rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center py-12 gap-3"
            style={{ background: 'rgba(7,26,13,0.6)' }}>
            <svg className="w-10 h-10 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-white/25 text-sm">Sin tabla cargada</p>
            <p className="text-white/15 text-xs">{labelActiva}</p>
          </div>
        ) : (
          <>
            {urlActiva && (
              <a href={urlActiva} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-2xl border border-white/10 px-5 py-4 active:opacity-80 transition-opacity"
                style={{ background: 'rgba(7,26,13,0.82)', backdropFilter: 'blur(10px)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(22,163,74,0.25)', border: '1px solid rgba(22,163,74,0.4)' }}>
                  <svg className="w-5 h-5" style={{ color: '#16a34a' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">Ver {labelActiva}</p>
                  <p className="text-white/35 text-xs mt-0.5">Abre en el navegador</p>
                </div>
                <svg className="w-4 h-4 text-white/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
            {imagenTabla && (
              <div>
                <p className="text-white/20 text-[10px] uppercase tracking-widest text-center mb-2">Tabla de posiciones</p>
                <button onClick={() => setZoom('tabla')}
                  className="w-full rounded-2xl overflow-hidden border border-white/10 block active:opacity-80 transition-opacity">
                  <img src={imagenTabla} alt={labelActiva} className="w-full object-contain" style={{ maxHeight: '65vh' }} />
                </button>
                <p className="text-white/20 text-xs text-center mt-2">Tocá la imagen para ampliar</p>
              </div>
            )}
            {imagenEquipo && (
              <div>
                <p className="text-white/20 text-[10px] uppercase tracking-widest text-center mb-2">Foto del equipo</p>
                <button onClick={() => setZoom('equipo')}
                  className="w-full rounded-2xl overflow-hidden border border-white/10 block active:opacity-80 transition-opacity">
                  <img src={imagenEquipo} alt="Equipo" className="w-full object-contain" style={{ maxHeight: '65vh' }} />
                </button>
                <p className="text-white/20 text-xs text-center mt-2">Tocá la imagen para ampliar</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Plantel */}
      {catActiva !== 'general' && (plantelFotos[catActiva] || toList(jugadoresDB[catActiva]).length > 0) && (
        <div className="px-3 mt-3 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-1">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-white/20 text-[10px] uppercase tracking-widest">Plantel</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {plantelFotos[catActiva] && (
            <button onClick={() => setZoom('plantel')}
              className="w-full rounded-2xl overflow-hidden border border-white/10 block active:opacity-80 transition-opacity">
              <img src={plantelFotos[catActiva]} alt={`Foto ${labelActiva}`} className="w-full object-contain" style={{ maxHeight: '55vh' }} />
            </button>
          )}

          {toList(jugadoresDB[catActiva]).length > 0 && (
            <div className="rounded-2xl border border-white/5 overflow-hidden"
              style={{ background: 'rgba(7,26,13,0.92)', backdropFilter: 'blur(12px)' }}>
              <div className="divide-y divide-white/5">
                {toList(jugadoresDB[catActiva]).map((j, i) => (
                  <div key={j.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="w-7 h-7 rounded-full bg-[#16a34a]/20 flex items-center justify-center text-[#16a34a] text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-white text-sm">{j.nombre}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="h-6" />

      {/* Lightbox con pinch-zoom */}
      {zoom === 'tabla' && imagenTabla && (
        <PinchZoomImage src={imagenTabla} alt={labelActiva} onClose={() => setZoom(null)} />
      )}
      {zoom === 'equipo' && imagenEquipo && (
        <PinchZoomImage src={imagenEquipo} alt="Foto del equipo" onClose={() => setZoom(null)} />
      )}
      {zoom === 'plantel' && plantelFotos[catActiva] && (
        <PinchZoomImage src={plantelFotos[catActiva]} alt={`Foto ${labelActiva}`} onClose={() => setZoom(null)} />
      )}
    </div>
  )
}
