export default function Sedes({ data }) {
  const sedes = Object.values(data?.sedes || {}).sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))

  return (
    <div className="flex flex-col">
      <div className="px-4 pt-10 pb-6" style={{ background: 'rgba(15,92,34,0.85)', backdropFilter: 'blur(8px)' }}>
        <h2 className="text-white font-bold text-xl">Sedes</h2>
        <p className="text-white/50 text-sm">Dirección de los clubes · Súper Liga de Solano</p>
      </div>

      <div className="px-3 mt-4">
        {sedes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center py-12 gap-3"
            style={{ background: 'rgba(7,26,13,0.6)' }}>
            <p className="text-white/25 text-sm">Sin sedes cargadas</p>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-white/5 overflow-hidden"
              style={{ background: 'rgba(7,26,13,0.92)', backdropFilter: 'blur(12px)' }}>
              <div className="divide-y divide-white/5">
                {sedes.map(({ nombre, direccion }) => (
                  <a
                    key={nombre}
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${direccion}, Solano, Buenos Aires`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 active:bg-white/5 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${nombre === 'La Canilla' ? 'text-[#16a34a]' : 'text-white/85'}`}>{nombre}</p>
                      <p className="text-white/35 text-xs mt-0.5">{direccion}</p>
                    </div>
                    <svg className="w-4 h-4 text-white/25 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
            <p className="text-white/20 text-xs text-center mt-3">Tocá un club para abrir la dirección en Google Maps</p>
          </>
        )}
      </div>

      <div className="h-6" />
    </div>
  )
}
