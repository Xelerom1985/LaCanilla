import { useState, useMemo } from 'react'

function PinchZoomImage({ src, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.97)' }}
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
      <img src={src} alt="" className="max-w-full max-h-full object-contain" />
    </div>
  )
}

export default function Novedades({ data }) {
  const [zoom, setZoom] = useState(null)

  const lista = useMemo(() => {
    const novedades = data.novedades || {}
    return Object.entries(novedades)
      .sort(([, a], [, b]) => (b.orden || 0) - (a.orden || 0))
      .filter(([, n]) => n.titulo || n.detalle || n.imagen)
  }, [data.novedades])

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-4 pt-10 pb-4" style={{ background: 'rgba(15,92,34,0.85)', backdropFilter: 'blur(8px)' }}>
        <h2 className="text-white font-bold text-xl">Novedades</h2>
        <p className="text-white/50 text-sm">CSD La Canilla</p>
      </div>

      {lista.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 gap-4">
          <svg className="w-12 h-12 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          <p className="text-white/25 text-sm text-center">No hay novedades por el momento</p>
        </div>
      ) : (
        <div className="px-3 py-4 flex flex-col gap-0">
          {lista.map(([id, nov], idx) => (
            <div key={id} className="flex flex-col gap-0">
              <div
                className="rounded-2xl border border-white/8 overflow-hidden"
                style={{ background: 'rgba(7,26,13,0.88)', backdropFilter: 'blur(12px)' }}
              >
                {/* Imagen */}
                {nov.imagen && (
                  <div className="w-full overflow-hidden" style={{ maxHeight: '45vw' }}>
                    <img
                      src={nov.imagen}
                      alt={nov.titulo}
                      className="w-full object-cover cursor-zoom-in"
                      style={{ maxHeight: '45vw' }}
                      onClick={() => setZoom(nov.imagen)}
                    />
                  </div>
                )}

                {/* Contenido */}
                <div className="p-4 flex flex-col gap-2">
                  {nov.titulo && (
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-[#16a34a] rounded-full shrink-0" />
                      <h3 className="text-white font-bold text-base leading-tight">{nov.titulo}</h3>
                    </div>
                  )}
                  {nov.detalle && (
                    <p className="text-white/60 text-sm leading-relaxed">{nov.detalle}</p>
                  )}
                </div>
              </div>

              {/* Separador */}
              {idx < lista.length - 1 && (
                <div className="flex items-center gap-3 px-1 py-3">
                  <div className="flex-1 h-px bg-white/8" />
                  <div className="w-1 h-1 rounded-full bg-[#16a34a]/40" />
                  <div className="flex-1 h-px bg-white/8" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {zoom && <PinchZoomImage src={zoom} onClose={() => setZoom(null)} />}

      <div className="h-6" />
    </div>
  )
}
