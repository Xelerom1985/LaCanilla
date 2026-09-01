import { useState } from 'react'

const CATEGORIAS_ACTUALES = [
  { key: '2011', label: 'Categoría 2011', short: '2011' },
  { key: '2012', label: 'Categoría 2012', short: '2012' },
  { key: '2013', label: 'Categoría 2013', short: '2013' },
  { key: '2014', label: 'Categoría 2014', short: '2014' },
  { key: '2015', label: 'Categoría 2015', short: '2015' },
  { key: '2016', label: 'Categoría 2016', short: '2016' },
  { key: '2017', label: 'Categoría 2017', short: '2017' },
  { key: '2018', label: 'Categoría 2018', short: '2018' },
  { key: '2019', label: 'Categoría 2019', short: '2019' },
  { key: '2020', label: 'Categoría 2020', short: '2020' },
]

const RES_COLOR = {
  ganado:   { bg: 'bg-green-500',  text: 'text-green-400',  label: 'G' },
  empatado: { bg: 'bg-yellow-400', text: 'text-yellow-400', label: 'E' },
  perdido:  { bg: 'bg-red-500',    text: 'text-red-400',    label: 'P' },
}

function calcStats(fechas, catKey, torneo) {
  const partidos = Object.values(fechas || {})
    .filter(f => {
      const ft = f.torneo || 'apertura2026'
      return ft === torneo && f.resultados?.[catKey]
    })
    .sort((a, b) => {
      if (a.dia && b.dia) return a.dia.localeCompare(b.dia)
      return (a.numFecha || '').localeCompare(b.numFecha || '')
    })
  const PJ = partidos.length
  const PG = partidos.filter(f => f.resultados[catKey] === 'ganado').length
  const PE = partidos.filter(f => f.resultados[catKey] === 'empatado').length
  const PP = partidos.filter(f => f.resultados[catKey] === 'perdido').length
  const pts = PG * 3 + PE
  const pct = PJ > 0 ? Math.round((pts / (PJ * 3)) * 100) : 0
  const local = partidos.filter(f => f.localia === 'local')
  const visit = partidos.filter(f => f.localia === 'visitante')
  const racha = [...partidos].reverse().slice(0, 5)
  return { PJ, PG, PE, PP, pts, pct, local, visit, racha, partidos }
}

function calcGeneralStats(fechas, torneo) {
  const cats = CATEGORIAS_ACTUALES
  let totalPJ = 0, totalPG = 0, totalPE = 0, totalPP = 0
  const porCat = cats.map(cat => {
    const s = calcStats(fechas, cat.key, torneo)
    totalPJ += s.PJ
    totalPG += s.PG
    totalPE += s.PE
    totalPP += s.PP
    return { cat, ...s }
  }).filter(c => c.PJ > 0)
  const totalPts = totalPG * 3 + totalPE
  const totalPct = totalPJ > 0 ? Math.round((totalPts / (totalPJ * 3)) * 100) : 0
  const ranking = [...porCat].sort((a, b) => b.pct - a.pct || b.pts - a.pts)
  return { totalPJ, totalPG, totalPE, totalPP, totalPts, totalPct, ranking }
}

function MiniStat({ label, PG, PE, PP, PJ }) {
  const pts = PG * 3 + PE
  const pct = PJ > 0 ? Math.round((pts / (PJ * 3)) * 100) : 0
  return (
    <div className="flex-1 rounded-xl border border-white/8 p-3 flex flex-col gap-1"
      style={{ background: 'rgba(255,255,255,0.03)' }}>
      <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold">{label}</p>
      <p className="text-white/80 text-xs">{PJ} PJ · {PG}G {PE}E {PP}P</p>
      <p className="text-[#e08090] text-xs font-bold">{pct}% rend.</p>
    </div>
  )
}

function GeneralStats({ fechas, torneo }) {
  const { totalPJ, totalPG, totalPE, totalPP, totalPts, totalPct, ranking } = calcGeneralStats(fechas, torneo)

  if (totalPJ === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <p className="text-white/25 text-sm">Sin partidos registrados</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-white/8 p-4 flex flex-col gap-3"
        style={{ background: 'rgba(7,26,13,0.88)', backdropFilter: 'blur(12px)' }}>
        <p className="text-white/40 text-[10px] uppercase tracking-widest">Resumen del Club</p>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[['PJ', totalPJ, 'text-white'], ['PG', totalPG, 'text-green-400'], ['PE', totalPE, 'text-yellow-400'], ['PP', totalPP, 'text-red-400']].map(([lbl, val, col]) => (
            <div key={lbl} className="flex flex-col gap-0.5">
              <span className={`text-xl font-bold ${col}`}>{val}</span>
              <span className="text-white/30 text-[10px] uppercase">{lbl}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-white/5 pt-3">
          <div className="flex flex-col">
            <span className="text-white font-bold text-lg">{totalPts} <span className="text-white/40 text-sm font-normal">pts</span></span>
            <span className="text-white/40 text-xs">Puntos totales</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[#e08090] font-bold text-lg">{totalPct}%</span>
            <span className="text-white/40 text-xs">Rendimiento</span>
          </div>
        </div>
        <div className="w-full h-2 rounded-full bg-white/8 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${totalPct}%`, background: totalPct >= 60 ? '#22c55e' : totalPct >= 35 ? '#eab308' : '#ef4444' }} />
        </div>
      </div>

      <div className="rounded-2xl border border-white/8 overflow-hidden"
        style={{ background: 'rgba(7,26,13,0.88)', backdropFilter: 'blur(12px)' }}>
        <p className="text-white/40 text-[10px] uppercase tracking-widest px-4 pt-4 pb-2">Ranking por Categoría</p>
        <div className="divide-y divide-white/5">
          {ranking.map((item, i) => (
            <div key={item.cat.key} className="flex items-center gap-3 px-4 py-3">
              <span className="w-6 text-center text-white/25 text-xs font-bold shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{item.cat.label}</p>
                <p className="text-white/30 text-xs">{item.PJ} PJ · {item.PG}G {item.PE}E {item.PP}P · {item.pts} pts</p>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="font-bold text-sm" style={{ color: item.pct >= 60 ? '#22c55e' : item.pct >= 35 ? '#eab308' : '#ef4444' }}>
                  {item.pct}%
                </span>
                <div className="w-16 h-1.5 rounded-full bg-white/8 mt-1 overflow-hidden">
                  <div className="h-full rounded-full"
                    style={{ width: `${item.pct}%`, background: item.pct >= 60 ? '#22c55e' : item.pct >= 35 ? '#eab308' : '#ef4444' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CatStats({ fechas, catKey, torneo }) {
  const { PJ, PG, PE, PP, pts, pct, local, visit, racha, partidos } = calcStats(fechas, catKey, torneo)

  if (PJ === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <p className="text-white/25 text-sm">Sin partidos registrados</p>
      </div>
    )
  }

  const localG = local.filter(f => f.resultados?.[catKey] === 'ganado').length
  const localE = local.filter(f => f.resultados?.[catKey] === 'empatado').length
  const localP = local.filter(f => f.resultados?.[catKey] === 'perdido').length
  const visitG = visit.filter(f => f.resultados?.[catKey] === 'ganado').length
  const visitE = visit.filter(f => f.resultados?.[catKey] === 'empatado').length
  const visitP = visit.filter(f => f.resultados?.[catKey] === 'perdido').length

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-white/8 p-4 flex flex-col gap-3"
        style={{ background: 'rgba(7,26,13,0.88)', backdropFilter: 'blur(12px)' }}>
        <p className="text-white/40 text-[10px] uppercase tracking-widest">Resumen</p>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[['PJ', PJ, 'text-white'], ['PG', PG, 'text-green-400'], ['PE', PE, 'text-yellow-400'], ['PP', PP, 'text-red-400']].map(([lbl, val, col]) => (
            <div key={lbl} className="flex flex-col gap-0.5">
              <span className={`text-xl font-bold ${col}`}>{val}</span>
              <span className="text-white/30 text-[10px] uppercase">{lbl}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-white/5 pt-3">
          <div className="flex flex-col">
            <span className="text-white font-bold text-lg">{pts} <span className="text-white/40 text-sm font-normal">pts</span></span>
            <span className="text-white/40 text-xs">Puntos totales</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[#e08090] font-bold text-lg">{pct}%</span>
            <span className="text-white/40 text-xs">Rendimiento</span>
          </div>
        </div>
        <div className="w-full h-2 rounded-full bg-white/8 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: pct >= 60 ? '#22c55e' : pct >= 35 ? '#eab308' : '#ef4444' }} />
        </div>
      </div>

      <div className="rounded-2xl border border-white/8 p-4 flex flex-col gap-3"
        style={{ background: 'rgba(7,26,13,0.88)', backdropFilter: 'blur(12px)' }}>
        <p className="text-white/40 text-[10px] uppercase tracking-widest">Últimos {racha.length} partidos</p>
        <div className="flex gap-2">
          {racha.map((f, i) => {
            const r = f.resultados[catKey]
            const c = RES_COLOR[r]
            return (
              <div key={i} className={`w-9 h-9 rounded-full ${c.bg} flex items-center justify-center font-bold text-white text-sm shrink-0`}>
                {c.label}
              </div>
            )
          })}
          {Array.from({ length: 5 - racha.length }).map((_, i) => (
            <div key={i} className="w-9 h-9 rounded-full bg-white/5 border border-white/8 flex items-center justify-center text-white/15 text-sm">-</div>
          ))}
        </div>
      </div>

      {(local.length > 0 || visit.length > 0) && (
        <div className="rounded-2xl border border-white/8 p-4 flex flex-col gap-3"
          style={{ background: 'rgba(7,26,13,0.88)', backdropFilter: 'blur(12px)' }}>
          <p className="text-white/40 text-[10px] uppercase tracking-widest">Local vs Visitante</p>
          <div className="flex gap-2">
            <MiniStat label="De local" PJ={local.length} PG={localG} PE={localE} PP={localP} />
            <MiniStat label="De visitante" PJ={visit.length} PG={visitG} PE={visitE} PP={visitP} />
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-white/8 overflow-hidden"
        style={{ background: 'rgba(7,26,13,0.88)', backdropFilter: 'blur(12px)' }}>
        <p className="text-white/40 text-[10px] uppercase tracking-widest px-4 pt-4 pb-2">Historial de partidos</p>
        <div className="divide-y divide-white/5">
          {[...partidos].reverse().map((f, i) => {
            const r = f.resultados[catKey]
            const c = RES_COLOR[r]
            return (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0 ${c.bg}`}>
                  {c.label}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">vs {f.rival || '—'}</p>
                  <p className="text-white/30 text-xs">{f.numFecha || ''} · {f.localia === 'local' ? 'Local' : 'Visitante'}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function VistaStats({ fechas, catActiva, setCatActiva, onBack }) {
  const torneoKey = 'clausura2026'
  const titulo = 'PROXIMAMENTE'

  const cats = CATEGORIAS_ACTUALES

  return (
    <div className="flex flex-col">
      <div className="px-4 pt-10 pb-4" style={{ background: 'rgba(15,92,34,0.85)', backdropFilter: 'blur(8px)' }}>
        <button onClick={onBack} className="flex items-center gap-2 text-white/60 text-sm mb-3">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Estadísticas
        </button>
        <h2 className="text-white font-bold text-xl">{titulo}</h2>
        <p className="text-white/50 text-sm">
          {catActiva === 'general' ? 'Estadísticas del club' : 'Seleccioná una categoría'}
        </p>
      </div>

      <div className="px-3 pt-4">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setCatActiva('general')}
            className="col-span-3 px-2 py-2.5 rounded-xl text-xs font-semibold transition-all text-center active:scale-95"
            style={{
              background: catActiva === 'general' ? '#16a34a' : 'rgba(7,26,13,0.75)',
              border: catActiva === 'general' ? '1px solid #16a34a' : '1px solid rgba(255,255,255,0.08)',
              color: catActiva === 'general' ? '#fff' : 'rgba(255,255,255,0.5)',
            }}>
            General
          </button>
          {cats.map(cat => (
            <button key={cat.key}
              onClick={() => setCatActiva(cat.key)}
              className="px-2 py-2.5 rounded-xl text-xs font-semibold transition-all text-center active:scale-95"
              style={{
                background: catActiva === cat.key ? '#16a34a' : 'rgba(7,26,13,0.75)',
                border: catActiva === cat.key ? '1px solid #16a34a' : '1px solid rgba(255,255,255,0.08)',
                color: catActiva === cat.key ? '#fff' : 'rgba(255,255,255,0.5)',
              }}>
              {cat.short}
            </button>
          ))}
        </div>
      </div>

      <div className="px-3 mt-4">
        {catActiva === 'general'
          ? <GeneralStats fechas={fechas} torneo={torneoKey} />
          : catActiva
            ? <CatStats fechas={fechas} catKey={catActiva} torneo={torneoKey} />
            : (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <p className="text-white/25 text-sm">Elegí una categoría para ver las estadísticas</p>
              </div>
            )
        }
      </div>

      <div className="h-6" />
    </div>
  )
}

export default function Plantel({ data }) {
  const [vista, setVista] = useState('menu')
  const [catActiva, setCatActiva] = useState(null)
  const fechas = data?.fechas || {}

  const countFechas = Object.values(fechas).filter(f => (f.torneo || 'apertura2026') === 'clausura2026' && f.resultados).length

  if (vista === 'stats') {
    return (
      <VistaStats
        fechas={fechas}
        catActiva={catActiva}
        setCatActiva={setCatActiva}
        onBack={() => { setVista('menu'); setCatActiva(null) }}
      />
    )
  }

  return (
    <div className="flex flex-col">
      <div className="px-4 pt-10 pb-6" style={{ background: 'rgba(15,92,34,0.85)', backdropFilter: 'blur(8px)' }}>
        <h2 className="text-white font-bold text-xl">Estadísticas</h2>
        <p className="text-white/50 text-sm">CSD La Canilla</p>
      </div>

      <div className="px-3 mt-5 flex flex-col gap-3">
        <button onClick={() => { setVista('stats'); setCatActiva(null) }}
          className="rounded-2xl border border-[#16a34a]/40 p-5 flex items-center justify-between text-left active:opacity-80 transition-opacity"
          style={{ background: 'rgba(22,163,74,0.12)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#16a34a] rounded-full" />
            <div>
              <h3 className="text-white font-bold text-base">PROXIMAMENTE</h3>
              <p className="text-white/40 text-xs mt-0.5">
                {countFechas > 0 ? `${countFechas} fechas cargadas` : 'Sin fechas cargadas todavía'}
              </p>
            </div>
          </div>
          <svg className="w-5 h-5 text-white/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="h-6" />
    </div>
  )
}
