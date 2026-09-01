import { useState, useMemo } from 'react'

const formatDia = (dia) => {
  if (!dia) return '—'
  if (/^\d{4}-\d{2}-\d{2}$/.test(dia)) {
    const d = new Date(dia + 'T12:00:00')
    return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }
  return dia
}

const CATEGORIAS_ACTUALES = [
  { key: '2011', label: 'Categoría 2011' },
  { key: '2012', label: 'Categoría 2012' },
  { key: '2013', label: 'Categoría 2013' },
  { key: '2014', label: 'Categoría 2014' },
  { key: '2015', label: 'Categoría 2015' },
  { key: '2016', label: 'Categoría 2016' },
  { key: '2017', label: 'Categoría 2017' },
  { key: '2018', label: 'Categoría 2018' },
  { key: '2019', label: 'Categoría 2019' },
  { key: '2020', label: 'Categoría 2020' },
]

function IconCalendar() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function IconPin() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

/* ── Pantalla de resultados de una fecha ── */
function DetalleFecha({ fecha, onBack }) {
  const rival      = fecha.rival     || '—'
  const localia    = fecha.localia   || 'local'
  const logoRival  = fecha.logoRival || null
  const resultados = fecha.resultados || {}
  const cats       = CATEGORIAS_ACTUALES

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-4 pt-10 pb-4 flex items-start gap-3"
        style={{ background: 'rgba(15,92,34,0.85)', backdropFilter: 'blur(8px)' }}>
        <button onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center mt-0.5 shrink-0"
          style={{ background: 'rgba(255,255,255,0.1)' }}>
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          {fecha.numFecha && (
            <p className="text-[#f1e9d8]/50 text-xs uppercase tracking-widest">
              {/^\d+$/.test((fecha.numFecha || '').trim()) ? `Fecha ${fecha.numFecha}` : fecha.numFecha}
            </p>
          )}
          <p className="text-white font-bold text-lg leading-tight">La Canilla vs {rival}</p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-white/40 text-xs">
              <IconCalendar /> {formatDia(fecha.dia)}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              localia === 'local' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
            }`}>
              {localia === 'local' ? 'LOCAL' : 'VISITANTE'}
            </span>
            {fecha.mapsUrl && (
              <a href={fecha.mapsUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg"
                style={{ background: 'rgba(22,163,74,0.3)', color: '#f1e9d8cc' }}>
                <IconPin /> Ver en Maps
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Resultados por categoría */}
      <div className="px-3 pt-4 pb-6 flex flex-col gap-2">
        {cats.map(cat => {
          const res = resultados[cat.key]
          const jugado = res === 'ganado' || res === 'perdido' || res === 'empatado'

          const colorClass = res === 'ganado' ? 'text-green-400'
            : res === 'perdido' ? 'text-red-400'
            : 'text-yellow-400'

          const pillClass = res === 'ganado'
            ? 'bg-green-500/20 text-green-400'
            : res === 'perdido'
            ? 'bg-red-500/20 text-red-400'
            : 'bg-yellow-500/20 text-yellow-400'

          const labelResultado = res === 'ganado' ? 'VICTORIA'
            : res === 'perdido' ? 'DERROTA'
            : 'EMPATE'

          const textoResultado = res === 'ganado' ? 'GANADO'
            : res === 'perdido' ? 'PERDIDO'
            : 'EMPATADO'

          return (
            <div key={cat.key} className="rounded-2xl border border-white/8 overflow-hidden"
              style={{ background: 'rgba(7,26,13,0.82)', backdropFilter: 'blur(10px)' }}>
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/5"
                style={{ background: 'rgba(22,163,74,0.2)' }}>
                <span className="text-[#f1e9d8]/70 text-xs font-semibold uppercase tracking-wide">{cat.label}</span>
                {jugado && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pillClass}`}>
                    {labelResultado}
                  </span>
                )}
              </div>

              <div className="px-4 py-3 flex items-center gap-2">
                {/* La Canilla */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <img src="/escudo.png" alt="" className="w-7 h-7 object-contain shrink-0"
                    onError={e => e.target.style.display = 'none'} />
                  <span className="text-white text-sm font-semibold truncate">La Canilla</span>
                </div>

                {/* Resultado */}
                <div className="flex flex-col items-center shrink-0 text-center px-1">
                  {jugado ? (
                    <>
                      <span className={`text-[10px] font-semibold leading-tight ${colorClass}`}>PARTIDO</span>
                      <span className={`text-sm font-bold leading-tight ${colorClass}`}>{textoResultado}</span>
                    </>
                  ) : (
                    <span className="text-white/20 text-[10px] leading-tight">Partido<br/>NO jugado</span>
                  )}
                </div>

                {/* Rival */}
                <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                  <span className="text-white/60 text-sm font-semibold truncate text-right">{rival}</span>
                  {logoRival ? (
                    <img src={logoRival} alt={rival} className="w-7 h-7 object-contain shrink-0"
                      onError={e => e.target.style.display = 'none'} />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-white/10 shrink-0 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Pantalla principal: lista de fechas ── */
export default function Partidos({ data }) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null)
  const fechasObj = data.fechas || {}

  const { fechasList, jugadas } = useMemo(() => {
    const hoy = new Date(); hoy.setHours(23, 59, 59, 999)
    const list = Object.entries(fechasObj)
      .map(([id, f]) => ({ id, ...f }))
      .sort((a, b) => {
        const nA = parseInt((a.numFecha || '').replace(/\D/g, '')) || 0
        const nB = parseInt((b.numFecha || '').replace(/\D/g, '')) || 0
        return nB - nA
      })
    const jugadas = list.filter(f =>
      /^\d{4}-\d{2}-\d{2}$/.test(f.dia || '') && new Date(f.dia + 'T23:59:59') <= hoy
    ).length
    return { fechasList: list, jugadas }
  }, [fechasObj])

  if (fechaSeleccionada) {
    const fechaData = fechasObj[fechaSeleccionada]
    if (fechaData) {
      return <DetalleFecha fecha={fechaData} onBack={() => setFechaSeleccionada(null)} />
    }
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-4 pt-10 pb-4"
        style={{ background: 'rgba(15,92,34,0.85)', backdropFilter: 'blur(8px)' }}>
        <h2 className="text-white font-bold text-xl">Partidos</h2>
        <p className="text-white/50 text-sm">
          {jugadas > 0 ? `${jugadas} fecha${jugadas > 1 ? 's' : ''} jugada${jugadas > 1 ? 's' : ''}` : 'Historial de fechas'}
        </p>
      </div>

      <div className="px-3 pt-4 pb-6 flex flex-col gap-3">
        {fechasList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-white/15 text-5xl">⚽</p>
            <p className="text-white/30 text-sm">No hay fechas cargadas</p>
            <p className="text-white/20 text-xs">Cargalas desde Admin → Partidos</p>
          </div>
        ) : (
          fechasList.map(fecha => (
            <button key={fecha.id} onClick={() => setFechaSeleccionada(fecha.id)}
              className="w-full text-left rounded-2xl border border-white/8 overflow-hidden active:opacity-75 transition-opacity"
              style={{ background: 'rgba(7,26,13,0.82)', backdropFilter: 'blur(10px)' }}>

              <div className="px-4 py-4 flex items-center gap-3">
                {/* Número de fecha */}
                <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0"
                  style={{ background: 'rgba(22,163,74,0.25)', border: '1px solid rgba(22,163,74,0.4)' }}>
                  <span className="text-[#16a34a] text-[9px] font-bold uppercase leading-none">Fecha</span>
                  <span className="text-white font-bold text-lg leading-tight">
                    {(fecha.numFecha || '').replace(/\D/g, '') || '—'}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-base leading-tight truncate">
                    La Canilla <span className="text-white/40 font-normal text-sm">vs</span> {fecha.rival || '—'}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-white/35 text-xs">
                      <IconCalendar /> {formatDia(fecha.dia)}
                    </span>
                    {fecha.localia && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        fecha.localia === 'local' ? 'bg-green-500/15 text-green-400' : 'bg-blue-500/15 text-blue-400'
                      }`}>
                        {fecha.localia === 'local' ? 'LOCAL' : 'VISIT.'}
                      </span>
                    )}
                  </div>
                </div>

                <svg className="w-4 h-4 text-white/20 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
