import { useState, useRef, useEffect } from 'react'
import { db, ref, update, set, push, remove } from '../firebase'
import { compressImage } from '../utils/compressImage'

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

function ImagenSection({ label, desc, imagen, uploading, onUpload, onDelete }) {
  return (
    <div className="bg-[#1e1e1e] rounded-2xl border border-white/5 p-4 flex flex-col gap-3">
      <div>
        <p className="text-white/70 text-sm font-semibold">{label}</p>
        <p className="text-white/25 text-xs mt-0.5">{desc}</p>
      </div>
      {imagen ? (
        <>
          <div className="relative rounded-xl overflow-hidden border border-white/8">
            <img src={imagen} alt={label} className="w-full object-contain" style={{ maxHeight: '30vh' }} />
            <div className="absolute top-2 right-2 bg-green-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Cargada</div>
          </div>
          <div className="flex gap-2">
            <button onClick={onUpload} disabled={uploading}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold bg-white/8 active:bg-white/15 text-white/60 border border-white/10 disabled:opacity-50">
              {uploading
                ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Procesando...</>
                : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>Reemplazar</>}
            </button>
            <button onClick={onDelete}
              className="flex items-center justify-center gap-1.5 px-4 rounded-xl py-2.5 text-sm font-semibold bg-red-500/15 active:bg-red-500/30 text-red-400 border border-red-500/20">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar
            </button>
          </div>
        </>
      ) : (
        <button onClick={onUpload} disabled={uploading}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold bg-white/8 active:bg-white/15 text-white/60 border border-white/10 disabled:opacity-50">
          {uploading
            ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Procesando...</>
            : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>Subir imagen</>}
        </button>
      )}
    </div>
  )
}

export default function Admin({ data, onSalir }) {
  const [tab, setTab]             = useState('banner')
  const [banner, setBanner]       = useState({ ...data.proximoPartido })
  const [saving, setSaving]       = useState(false)
  const [savingBanner, setSavingBanner] = useState(false)
  const [savedMsg, setSavedMsg]   = useState('')
  const [fechas, setFechas]       = useState(data.fechas || {})
  const [fechaActiva, setFechaActiva] = useState(null)
  const [fechaForm, setFechaForm] = useState({ numFecha: '', rival: '', dia: '', localia: 'local', mapsUrl: '', logoRival: '' })
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const logoRivalFileRef = useRef(null)
  const [bannerImagen, setBannerImagen]   = useState(data.bannerImagen || null)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const bannerFileRef = useRef(null)
  const [fondoImagen, setFondoImagen]     = useState(data.fondoImagen || null)
  const [uploadingFondo, setUploadingFondo] = useState(false)
  const fondoFileRef = useRef(null)
  const [tablasCat, setTablasCat]       = useState('general')
  const [imagenesUrl, setImagenesUrl]   = useState(data.tablasImagenes || {})
  const [uploadingImg, setUploadingImg] = useState(false)
  const [encuestaActiva, setEncuestaActiva] = useState(data.encuesta?.activa === true)
  // Novedades
  const [novedades, setNovedades]           = useState(data.novedades || {})
  const [savingNov, setSavingNov]           = useState({})
  const [uploadingNovImg, setUploadingNovImg] = useState({})
  const novImgRefs = useRef({})
  const novFormsRef = useRef({})

  const toggleEncuesta = async (val) => {
    try {
      await set(ref(db, 'encuesta/activa'), val)
      setEncuestaActiva(val)
    } catch { alert('Error al guardar estado de encuesta.') }
  }

  const resetEncuesta = async () => {
    if (!confirm('¿Borrar todos los votos? Esta acción no se puede deshacer.')) return
    try {
      await set(ref(db, 'encuesta/votos'), { op1: 0, op2: 0, op3: 0 })
      showSaved()
    } catch { alert('Error al resetear votos.') }
  }

  // Sedes
  const [nuevaSedeNombre, setNuevaSedeNombre]       = useState('')
  const [nuevaSedeDireccion, setNuevaSedeDireccion] = useState('')
  const [editingSedeId, setEditingSedeId]           = useState(null)
  const [editingSedeNombre, setEditingSedeNombre]   = useState('')
  const [editingSedeDireccion, setEditingSedeDireccion] = useState('')

  const addSede = async () => {
    const nombre = nuevaSedeNombre.trim()
    const direccion = nuevaSedeDireccion.trim()
    if (!nombre || !direccion) return
    try {
      await push(ref(db, 'sedes'), { nombre, direccion })
      setNuevaSedeNombre('')
      setNuevaSedeDireccion('')
    } catch { alert('Error al agregar la sede.') }
  }

  const deleteSede = async (id) => {
    if (!confirm('¿Eliminar esta sede?')) return
    try { await remove(ref(db, `sedes/${id}`)) }
    catch { alert('Error al eliminar la sede.') }
  }

  const saveEditSede = async (id) => {
    const nombre = editingSedeNombre.trim()
    const direccion = editingSedeDireccion.trim()
    if (!nombre || !direccion) return
    try {
      await set(ref(db, `sedes/${id}`), { nombre, direccion })
      setEditingSedeId(null)
    } catch { alert('Error al guardar la sede.') }
  }

  // Plantel
  const [plantelCat, setPlantelCat]         = useState('2011')
  const [nuevoJugador, setNuevoJugador]     = useState('')
  const [nuevoDni, setNuevoDni]             = useState('')
  const [editingId, setEditingId]           = useState(null)
  const [editingNombre, setEditingNombre]   = useState('')
  const [editingDni, setEditingDni]         = useState('')
  const [plantelFotos, setPlantelFotos]     = useState(data.plantelFotos || {})
  const [uploadingPlantelFoto, setUploadingPlantelFoto] = useState(false)
  const plantelFotoRef = useRef(null)

  const fileRef = useRef(null)
  const showSavedTimerRef = useRef(null)
  const [resultadosForm, setResultadosForm] = useState({})

  const showSaved = () => {
    if (showSavedTimerRef.current) clearTimeout(showSavedTimerRef.current)
    setSavedMsg('Guardado ✓')
    showSavedTimerRef.current = setTimeout(() => setSavedMsg(''), 2500)
  }

  const saveBanner = async () => {
    setSavingBanner(true)
    try { await set(ref(db, 'proximoPartido'), banner); showSaved() }
    catch { alert('Error al guardar el banner.') }
    setSavingBanner(false)
  }

  const uploadBannerImagen = async (file) => {
    setUploadingBanner(true)
    try {
      const base64 = await compressImage(file, 1200, 0.82)
      await set(ref(db, 'bannerImagen'), base64)
      setBannerImagen(base64)
      showSaved()
    } catch (err) {
      alert(`Error al procesar la imagen: ${err.message || 'desconocido'}`)
    } finally {
      setUploadingBanner(false)
    }
  }

  const uploadFondoImagen = async (file) => {
    setUploadingFondo(true)
    try {
      const base64 = await compressImage(file, 1200, 0.82)
      await set(ref(db, 'fondoImagen'), base64)
      setFondoImagen(base64)
      showSaved()
    } catch (err) {
      alert(`Error al procesar la imagen: ${err.message || 'desconocido'}`)
    } finally {
      setUploadingFondo(false)
    }
  }

  const deleteFondoImagen = async () => {
    if (!confirm('¿Eliminar el fondo personalizado? Se volverá a usar la cancha por defecto.')) return
    try {
      await set(ref(db, 'fondoImagen'), null)
      setFondoImagen(null)
      showSaved()
    } catch { alert('Error al eliminar el fondo.') }
  }

  const deleteBannerImagen = async () => {
    if (!confirm('¿Eliminar la foto del banner?')) return
    try {
      await set(ref(db, 'bannerImagen'), null)
      setBannerImagen(null)
      showSaved()
    } catch { alert('Error al eliminar la foto.') }
  }

  const uploadImagen = async (file) => {
    setUploadingImg(true)
    try {
      const base64 = await compressImage(file, 1200, 0.82)
      await set(ref(db, `tablasImagenes/${tablasCat}`), base64)
      setImagenesUrl(prev => ({ ...prev, [tablasCat]: base64 }))
      showSaved()
    } catch (err) {
      alert(`Error al procesar la imagen: ${err.message || 'desconocido'}`)
    } finally {
      setUploadingImg(false)
    }
  }

  const deleteImagen = async () => {
    if (!confirm('¿Eliminar la imagen de tabla?')) return
    try {
      await set(ref(db, `tablasImagenes/${tablasCat}`), null)
      setImagenesUrl(prev => { const n = { ...prev }; delete n[tablasCat]; return n })
      showSaved()
    } catch { alert('Error al eliminar la imagen.') }
  }

  const addJugador = async () => {
    const nombre = nuevoJugador.trim()
    if (!nombre) return
    try {
      await push(ref(db, `jugadores/${plantelCat}`), { nombre, dni: nuevoDni.trim() })
      setNuevoJugador('')
      setNuevoDni('')
    } catch { alert('Error al agregar jugador.') }
  }

  const deleteJugador = async (id) => {
    if (!confirm('¿Eliminar este jugador?')) return
    try { await remove(ref(db, `jugadores/${plantelCat}/${id}`)) }
    catch { alert('Error al eliminar jugador.') }
  }

  const saveEditJugador = async (id) => {
    const nombre = editingNombre.trim()
    if (!nombre) return
    try {
      await set(ref(db, `jugadores/${plantelCat}/${id}`), { nombre, dni: editingDni.trim() })
      setEditingId(null)
    } catch { alert('Error al guardar.') }
  }

  const uploadFotoPlantel = async (file) => {
    setUploadingPlantelFoto(true)
    try {
      const base64 = await compressImage(file, 1200, 0.82)
      await set(ref(db, `plantelFotos/${plantelCat}`), base64)
      setPlantelFotos(prev => ({ ...prev, [plantelCat]: base64 }))
      showSaved()
    } catch (err) {
      alert(`Error al procesar la imagen: ${err.message || 'desconocido'}`)
    } finally {
      setUploadingPlantelFoto(false)
    }
  }

  const deleteFotoPlantel = async () => {
    if (!confirm('¿Eliminar la foto del equipo?')) return
    try {
      await set(ref(db, `plantelFotos/${plantelCat}`), null)
      setPlantelFotos(prev => { const n = { ...prev }; delete n[plantelCat]; return n })
      showSaved()
    } catch { alert('Error al eliminar la foto.') }
  }

  const uploadLogoRival = async (file) => {
    setUploadingLogo(true)
    try {
      const base64 = await compressImage(file, 400, 0.8)
      setFechaForm(f => ({ ...f, logoRival: base64 }))
      if (fechaActiva && fechaActiva !== 'nueva') {
        await set(ref(db, `fechas/${fechaActiva}/logoRival`), base64)
      }
    } catch (err) {
      alert(`Error al procesar la imagen: ${err.message || 'desconocido'}`)
    } finally {
      setUploadingLogo(false)
    }
  }

  const deleteLogoRival = () => {
    setFechaForm(f => ({ ...f, logoRival: '' }))
    if (fechaActiva && fechaActiva !== 'nueva') {
      set(ref(db, `fechas/${fechaActiva}/logoRival`), null)
    }
  }

  const abrirNuevaFecha = () => {
    setFechaForm({ numFecha: '', rival: '', dia: '', localia: 'local', mapsUrl: '', logoRival: '' })
    setResultadosForm({})
    setFechaActiva('nueva')
  }

  const abrirFechaExistente = (id) => {
    const f = (data.fechas || {})[id] || fechas[id] || {}
    setFechaForm({
      numFecha:  f.numFecha  || '',
      rival:     f.rival     || '',
      dia:       f.dia       || '',
      localia:   f.localia   || 'local',
      mapsUrl:   f.mapsUrl   || '',
      logoRival: f.logoRival || '',
    })
    setResultadosForm(f.resultados || {})
    setFechaActiva(id)
  }

  const saveFecha = async () => {
    const resultados = {}
    CATEGORIAS.filter(c => c.key !== 'general').forEach(cat => {
      if (resultadosForm[cat.key]) resultados[cat.key] = resultadosForm[cat.key]
    })
    const fechaToSave = { ...fechaForm, resultados }
    setSaving(true)
    try {
      if (fechaActiva === 'nueva') {
        const newRef = await push(ref(db, 'fechas'), fechaToSave)
        setFechas(prev => ({ ...prev, [newRef.key]: fechaToSave }))
      } else {
        await set(ref(db, `fechas/${fechaActiva}`), fechaToSave)
        setFechas(prev => ({ ...prev, [fechaActiva]: fechaToSave }))
      }
      showSaved()
      setFechaActiva(null)
    } catch { alert('Error al guardar la fecha.') }
    setSaving(false)
  }

  const deleteFecha = async (id) => {
    if (!confirm('¿Eliminar esta fecha?')) return
    try {
      await remove(ref(db, `fechas/${id}`))
      setFechas(prev => { const n = { ...prev }; delete n[id]; return n })
      if (fechaActiva === id) setFechaActiva(null)
    } catch { alert('Error al eliminar.') }
  }

  /* ── NOVEDADES ── */
  const addNovedad = async () => {
    const orden = Date.now()
    try {
      const newRef = await push(ref(db, 'novedades'), { titulo: '', detalle: '', imagen: null, orden })
      await set(ref(db, 'novedadesUpdatedAt'), orden)
      setNovedades(prev => ({ ...prev, [newRef.key]: { titulo: '', detalle: '', imagen: null, orden } }))
    } catch { alert('Error al crear novedad.') }
  }

  const saveNovedad = async (id) => {
    const form = novFormsRef.current[id] || {}
    const titulo  = form.titulo  ?? novedades[id]?.titulo  ?? ''
    const detalle = form.detalle ?? novedades[id]?.detalle ?? ''
    setSavingNov(p => ({ ...p, [id]: true }))
    try {
      const ahora = Date.now()
      await update(ref(db, `novedades/${id}`), { titulo, detalle })
      await set(ref(db, 'novedadesUpdatedAt'), ahora)
      setNovedades(p => ({ ...p, [id]: { ...p[id], titulo, detalle } }))
      showSaved()
    } catch { alert('Error al guardar novedad.') }
    setSavingNov(p => ({ ...p, [id]: false }))
  }

  const deleteNovedad = async (id) => {
    if (!confirm('¿Eliminar esta novedad?')) return
    try {
      await remove(ref(db, `novedades/${id}`))
      setNovedades(p => { const n = { ...p }; delete n[id]; return n })
    } catch { alert('Error al eliminar novedad.') }
  }

  const uploadNovImagen = async (id, file) => {
    setUploadingNovImg(p => ({ ...p, [id]: true }))
    try {
      const base64 = await compressImage(file, 1200, 0.82)
      await set(ref(db, `novedades/${id}/imagen`), base64)
      setNovedades(p => ({ ...p, [id]: { ...p[id], imagen: base64 } }))
      showSaved()
    } catch (err) { alert(`Error al procesar imagen: ${err.message}`) }
    setUploadingNovImg(p => ({ ...p, [id]: false }))
  }

  const deleteNovImagen = async (id) => {
    try {
      await set(ref(db, `novedades/${id}/imagen`), null)
      setNovedades(p => ({ ...p, [id]: { ...p[id], imagen: null } }))
      showSaved()
    } catch { alert('Error al eliminar imagen.') }
  }

  /* ── PANEL ── */
  return (
    <div className="flex flex-col">
      <div className="px-4 pt-10 pb-4" style={{ background: 'rgba(15,92,34,0.85)', backdropFilter: 'blur(8px)' }}>
        <h2 className="text-white font-bold text-xl">Panel Admin</h2>
        <p className="text-white/50 text-sm">CSD La Canilla</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 sticky top-0 z-10" style={{ background: 'rgba(10,2,4,0.95)', backdropFilter: 'blur(12px)' }}>
        {[
          { id: 'banner',    label: 'Banner' },
          { id: 'partidos',  label: 'Partidos' },
          { id: 'tablas',    label: 'Tablas' },
          { id: 'plantel',   label: 'Plantel' },
          { id: 'novedades', label: 'Novedades' },
          { id: 'sedes',     label: 'Sedes' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-3 text-[10px] font-medium transition-colors ${tab === t.id ? 'text-[#f1e9d8] border-b-2 border-[#16a34a]' : 'text-gray-500'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {savedMsg && (
        <div className="mx-3 mt-3 bg-green-500/20 border border-green-500/30 rounded-xl px-4 py-2 text-green-400 text-sm text-center">
          {savedMsg}
        </div>
      )}

      {/* BANNER */}
      {tab === 'banner' && (
        <div className="px-3 py-4 flex flex-col gap-4">
          <p className="text-gray-500 text-xs uppercase tracking-widest">Próximo Partido</p>

          {/* Datos del partido */}
          <div className="bg-[#1e1e1e] rounded-2xl border border-white/5 p-4 flex flex-col gap-3">
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Rival</label>
              <input type="text" value={banner.rival || ''}
                onChange={e => setBanner(b => ({ ...b, rival: e.target.value }))}
                placeholder="Club Atlético Norte"
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#16a34a]" />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Día</label>
              <input
                type="date"
                value={/^\d{4}-\d{2}-\d{2}$/.test(banner.dia || '') ? banner.dia : ''}
                onChange={e => setBanner(b => ({ ...b, dia: e.target.value }))}
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#16a34a] [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Cancha</label>
              <input type="text" value={banner.cancha || ''}
                onChange={e => setBanner(b => ({ ...b, cancha: e.target.value }))}
                placeholder="La Canilla"
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#16a34a]" />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Link Google Maps</label>
              <input type="url" value={banner.mapsUrl || ''}
                onChange={e => setBanner(b => ({ ...b, mapsUrl: e.target.value }))}
                placeholder="https://maps.google.com/..."
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#16a34a]" />
            </div>
            <button onClick={saveBanner} disabled={savingBanner}
              className="w-full bg-[#16a34a] active:bg-[#0f7a37] disabled:opacity-50 text-white font-bold rounded-xl py-3 mt-1 transition-colors">
              {savingBanner ? 'Guardando...' : 'Guardar Banner'}
            </button>
          </div>

          {/* Separador */}
          <div className="flex items-center gap-3 px-1">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-white/20 text-xs">foto del partido</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Foto del banner */}
          <div className="bg-[#1e1e1e] rounded-2xl border border-white/5 p-4 flex flex-col gap-3">
            <div>
              <p className="text-white/70 text-sm font-semibold">Foto</p>
              <p className="text-white/25 text-xs mt-0.5">Se muestra en el Inicio debajo del próximo partido</p>
            </div>
            {bannerImagen ? (
              <>
                <div className="relative rounded-xl overflow-hidden border border-white/8">
                  <img src={bannerImagen} alt="foto banner" className="w-full object-contain" style={{ maxHeight: '25vh' }} />
                  <div className="absolute top-2 right-2 bg-green-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Cargada</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => bannerFileRef.current.click()} disabled={uploadingBanner}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold bg-white/8 active:bg-white/15 text-white/60 border border-white/10 disabled:opacity-50">
                    {uploadingBanner ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Procesando...</> : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>Reemplazar</>}
                  </button>
                  <button onClick={deleteBannerImagen}
                    className="flex items-center justify-center gap-1.5 px-4 rounded-xl py-2.5 text-sm font-semibold bg-red-500/15 active:bg-red-500/30 text-red-400 border border-red-500/20">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar
                  </button>
                </div>
              </>
            ) : (
              <button onClick={() => bannerFileRef.current.click()} disabled={uploadingBanner}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold bg-white/8 active:bg-white/15 text-white/60 border border-white/10 disabled:opacity-50">
                {uploadingBanner ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Procesando...</> : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>Agregar foto</>}
              </button>
            )}
            <input ref={bannerFileRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files[0] && uploadBannerImagen(e.target.files[0])} />
          </div>

          {/* Separador */}
          <div className="flex items-center gap-3 px-1">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-white/20 text-xs">fondo de pantalla</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Fondo de la app */}
          <ImagenSection
            label="Fondo de pantalla"
            desc="Fondo de toda la app. Si no hay ninguno cargado, se usa la cancha por defecto."
            imagen={fondoImagen}
            uploading={uploadingFondo}
            onUpload={() => fondoFileRef.current.click()}
            onDelete={deleteFondoImagen}
          />
          <input ref={fondoFileRef} type="file" accept="image/*" className="hidden"
            onChange={e => e.target.files[0] && uploadFondoImagen(e.target.files[0])} />

        </div>
      )}

      {/* PARTIDOS */}
      {tab === 'partidos' && (
        <div className="px-3 py-4 flex flex-col gap-3">

          {/* ── Editor de fecha activa ── */}
          {fechaActiva ? (
            <>
              <div className="flex items-center gap-2">
                <button onClick={() => setFechaActiva(null)}
                  className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <p className="text-white/50 text-xs uppercase tracking-widest">
                  {fechaActiva === 'nueva' ? 'Nueva fecha' : 'Editar fecha'}
                </p>
              </div>

              {/* Datos generales */}
              <div className="bg-[#1e1e1e] rounded-2xl border border-white/5 p-4 flex flex-col gap-3">
                {[
                  { field: 'numFecha', label: 'Número de fecha', placeholder: 'Fecha 5' },
                  { field: 'rival',    label: 'Rival',           placeholder: 'Club Atlético Norte' },
                  { field: 'mapsUrl',  label: 'Link Google Maps',placeholder: 'https://maps.google.com/...' },
                ].map(({ field, label, placeholder }) => (
                  <div key={field}>
                    <label className="text-gray-500 text-xs mb-1 block">{label}</label>
                    <input type="text" value={fechaForm[field] || ''}
                      onChange={e => setFechaForm(f => ({ ...f, [field]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#16a34a]" />
                  </div>
                ))}
                <div>
                  <label className="text-gray-500 text-xs mb-1 block">Día</label>
                  <input
                    type="date"
                    value={/^\d{4}-\d{2}-\d{2}$/.test(fechaForm.dia || '') ? fechaForm.dia : ''}
                    onChange={e => setFechaForm(f => ({ ...f, dia: e.target.value }))}
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#16a34a] [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="text-gray-500 text-xs mb-1 block">Localía</label>
                  <select value={fechaForm.localia || 'local'}
                    onChange={e => setFechaForm(f => ({ ...f, localia: e.target.value }))}
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#16a34a]">
                    <option value="local">LOCAL</option>
                    <option value="visitante">VISITANTE</option>
                  </select>
                </div>

                {/* Logo del rival */}
                <div>
                  <label className="text-gray-500 text-xs mb-2 block">Logo del rival</label>
                  {fechaForm.logoRival ? (
                    <div className="flex items-center gap-3">
                      <img src={fechaForm.logoRival} alt="logo rival"
                        className="w-14 h-14 object-contain rounded-xl border border-white/10 bg-white/5 p-1 shrink-0" />
                      <div className="flex flex-col gap-2 flex-1">
                        <button onClick={() => logoRivalFileRef.current.click()} disabled={uploadingLogo}
                          className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold bg-white/8 active:bg-white/15 text-white/60 border border-white/10 disabled:opacity-50">
                          {uploadingLogo ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />Procesando...</> : 'Reemplazar'}
                        </button>
                        <button onClick={deleteLogoRival}
                          className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold bg-red-500/15 active:bg-red-500/30 text-red-400 border border-red-500/20">
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => logoRivalFileRef.current.click()} disabled={uploadingLogo}
                      className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold bg-white/8 active:bg-white/15 text-white/60 border border-white/10 disabled:opacity-50">
                      {uploadingLogo
                        ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Procesando...</>
                        : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>Subir logo del rival</>}
                    </button>
                  )}
                  <input ref={logoRivalFileRef} type="file" accept="image/*" className="hidden"
                    onChange={e => e.target.files[0] && uploadLogoRival(e.target.files[0])} />
                </div>
              </div>

              {/* Resultados por categoría */}
              <p className="text-white/40 text-xs uppercase tracking-widest px-1">
                Resultados · La Canilla vs {fechaForm.rival || '...'}
              </p>
              <p className="text-white/20 text-[10px] px-1 -mt-2">Sin selección = Partido NO jugado</p>

              <div className="bg-[#1e1e1e] rounded-2xl border border-white/5 overflow-hidden">
                <div className="flex items-center px-4 py-2 border-b border-white/5">
                  <span className="flex-1 text-white/30 text-[10px] uppercase">Categoría</span>
                  <div className="flex items-center gap-2 mr-1">
                    <span className="w-12 text-center text-[9px] text-green-500/60 font-bold uppercase">G</span>
                    <span className="w-12 text-center text-[9px] text-yellow-400/60 font-bold uppercase">E</span>
                    <span className="w-12 text-center text-[9px] text-red-500/60 font-bold uppercase">P</span>
                  </div>
                </div>
                {CATEGORIAS.filter(c => c.key !== 'general').map(cat => {
                  const val = resultadosForm[cat.key]
                  const toggle = (v) => setResultadosForm(r => ({ ...r, [cat.key]: r[cat.key] === v ? undefined : v }))
                  return (
                    <div key={cat.key} className="flex items-center px-4 py-2.5 border-b border-white/5 last:border-0">
                      <span className="flex-1 text-white/60 text-xs">{cat.label}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggle('ganado')}
                          className={`w-12 h-12 rounded-full border-2 transition-all active:scale-95 ${val === 'ganado' ? 'bg-green-500 border-green-500' : 'bg-transparent border-green-500/35'}`} />
                        <button onClick={() => toggle('empatado')}
                          className={`w-12 h-12 rounded-full border-2 transition-all active:scale-95 ${val === 'empatado' ? 'bg-yellow-400 border-yellow-400' : 'bg-transparent border-yellow-400/35'}`} />
                        <button onClick={() => toggle('perdido')}
                          className={`w-12 h-12 rounded-full border-2 transition-all active:scale-95 ${val === 'perdido' ? 'bg-red-500 border-red-500' : 'bg-transparent border-red-500/35'}`} />
                      </div>
                    </div>
                  )
                })}
              </div>

              <button onClick={saveFecha} disabled={saving}
                className="w-full bg-[#16a34a] active:bg-[#0f7a37] disabled:opacity-50 text-white font-bold rounded-xl py-3.5 transition-colors">
                {saving ? 'Guardando...' : 'Guardar fecha'}
              </button>
            </>
          ) : (
            /* ── Lista de fechas ── */
            <>
              <button onClick={abrirNuevaFecha}
                className="w-full bg-[#16a34a] active:bg-[#0f7a37] text-white font-bold rounded-xl py-3.5 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nueva fecha
              </button>

              {(() => {
                const fechasOrdenadas = Object.entries(fechas)
                  .sort(([, a], [, b]) => {
                    const nA = parseInt((a.numFecha || '').replace(/\D/g, '')) || 0
                    const nB = parseInt((b.numFecha || '').replace(/\D/g, '')) || 0
                    return nA - nB
                  })
                return fechasOrdenadas.length === 0 ? (
                  <p className="text-white/20 text-sm text-center py-4">No hay fechas cargadas</p>
                ) : (
                  fechasOrdenadas.map(([id, f]) => (
                    <div key={id} className="bg-[#1e1e1e] rounded-2xl border border-white/5 px-4 py-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0" onClick={() => abrirFechaExistente(id)}>
                        {f.numFecha && <p className="text-[#16a34a] text-[10px] font-bold uppercase tracking-widest">{f.numFecha}</p>}
                        <p className="text-white text-sm font-semibold truncate">La Canilla vs {f.rival || '—'}</p>
                        <p className="text-white/30 text-xs">{f.dia || '—'}</p>
                      </div>
                      <button onClick={() => abrirFechaExistente(id)}
                        className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => deleteFecha(id)}
                        className="w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))
                )
              })()}
            </>
          )}
        </div>
      )}

      {/* TABLAS */}
      {tab === 'tablas' && (
        <div className="px-3 py-4 flex flex-col gap-4">
          <p className="text-gray-500 text-xs uppercase tracking-widest">Contenido por categoría</p>

          {/* Selector */}
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIAS.map(cat => (
              <button key={cat.key} onClick={() => setTablasCat(cat.key)}
                className={`px-2 py-2 rounded-xl text-xs font-semibold transition-all text-center${cat.key === 'general' ? ' col-span-3' : ''}`}
                style={{
                  background: tablasCat === cat.key ? '#16a34a' : '#1e1e1e',
                  border: tablasCat === cat.key ? '1px solid #16a34a' : '1px solid rgba(255,255,255,0.08)',
                  color: tablasCat === cat.key ? '#fff' : 'rgba(255,255,255,0.4)',
                }}>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Imagen de Tabla */}
          <ImagenSection
            label="Imagen de Tabla"
            desc="Foto de la tabla de posiciones"
            imagen={imagenesUrl[tablasCat] && !imagenesUrl[tablasCat].startsWith('http') ? imagenesUrl[tablasCat] : null}
            uploading={uploadingImg}
            onUpload={() => fileRef.current.click()}
            onDelete={deleteImagen}
          />
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => e.target.files[0] && uploadImagen(e.target.files[0])} />

        </div>
      )}

      {/* PLANTEL */}
      {tab === 'plantel' && (() => {
        const jugadoresCat = data.jugadores?.[plantelCat] || {}
        const isArq = (n) => /\(Arquer[oa]\)/i.test(n)
        const lista = Object.entries(jugadoresCat)
          .map(([id, v]) => ({ id, nombre: typeof v === 'string' ? v : v.nombre, dni: typeof v === 'string' ? '' : (v.dni || '') }))
          .sort((a, b) => {
            const aA = isArq(a.nombre), bA = isArq(b.nombre)
            if (aA && !bA) return -1
            if (!aA && bA) return 1
            return a.nombre.localeCompare(b.nombre)
          })

        return (
          <div className="px-3 py-4 flex flex-col gap-4">
            <p className="text-gray-500 text-xs uppercase tracking-widest">Plantel por categoría</p>

            {/* Selector */}
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIAS.filter(cat => cat.key !== 'general').map(cat => (
                <button key={cat.key}
                  onClick={() => { setPlantelCat(cat.key); setEditingId(null); setNuevoJugador(''); setNuevoDni('') }}
                  className="px-2 py-2 rounded-xl text-xs font-semibold transition-all text-center"
                  style={{
                    background: plantelCat === cat.key ? '#16a34a' : '#1e1e1e',
                    border: plantelCat === cat.key ? '1px solid #16a34a' : '1px solid rgba(255,255,255,0.08)',
                    color: plantelCat === cat.key ? '#fff' : 'rgba(255,255,255,0.4)',
                  }}>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Lista de jugadores */}
            <div className="bg-[#1e1e1e] rounded-2xl border border-white/5 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
                <span className="text-white/50 text-xs uppercase tracking-wide">Jugadores</span>
                <span className="text-white/25 text-xs">{lista.length} cargados</span>
              </div>

              {/* Agregar jugador */}
              <div className="flex gap-2 px-3 py-3 border-b border-white/5">
                <input
                  type="text"
                  value={nuevoJugador}
                  onChange={e => setNuevoJugador(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addJugador()}
                  placeholder="Apellido y nombre..."
                  className="flex-1 bg-[#2a2a2a] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#16a34a]"
                />
                <input
                  type="text"
                  value={nuevoDni}
                  onChange={e => setNuevoDni(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addJugador()}
                  placeholder="DNI"
                  className="w-24 bg-[#2a2a2a] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#16a34a]"
                />
                <button onClick={addJugador}
                  className="bg-[#16a34a] active:bg-[#0f7a37] text-white rounded-xl px-4 py-2 text-sm font-bold shrink-0">
                  +
                </button>
              </div>

              {/* Lista */}
              {lista.length === 0 ? (
                <p className="text-white/20 text-sm text-center py-8">Sin jugadores</p>
              ) : (
                <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
                  {lista.map(({ id, nombre, dni }) => (
                    <div key={id} className="flex items-center gap-2 px-3 py-2.5">
                      {editingId === id ? (
                        <>
                          <input
                            type="text"
                            value={editingNombre}
                            onChange={e => setEditingNombre(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') saveEditJugador(id); if (e.key === 'Escape') setEditingId(null) }}
                            className="flex-1 bg-[#2a2a2a] border border-[#16a34a] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none"
                            autoFocus
                          />
                          <input
                            type="text"
                            value={editingDni}
                            onChange={e => setEditingDni(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') saveEditJugador(id); if (e.key === 'Escape') setEditingId(null) }}
                            placeholder="DNI"
                            className="w-20 bg-[#2a2a2a] border border-[#16a34a] rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none"
                          />
                          <button onClick={() => saveEditJugador(id)}
                            className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button onClick={() => setEditingId(null)}
                            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-white/80 text-sm truncate">
                            {nombre}
                            {dni && <span className="text-white/25 text-xs ml-2">{dni}</span>}
                          </span>
                          <button onClick={() => { setEditingId(id); setEditingNombre(nombre); setEditingDni(dni) }}
                            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                            <svg className="w-3.5 h-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => deleteJugador(id)}
                            className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                            <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Foto del equipo */}
            <ImagenSection
              label="Foto del equipo"
              desc="Se muestra al abrir la categoría en Plantel"
              imagen={plantelFotos[plantelCat] || null}
              uploading={uploadingPlantelFoto}
              onUpload={() => plantelFotoRef.current.click()}
              onDelete={deleteFotoPlantel}
            />
            <input ref={plantelFotoRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files[0] && uploadFotoPlantel(e.target.files[0])} />
          </div>
        )
      })()}

      {/* NOVEDADES */}
      {tab === 'novedades' && (
        <div className="px-3 py-4 flex flex-col gap-4">
          <p className="text-gray-500 text-xs uppercase tracking-widest">Newsletter de novedades</p>

          {/* Botón agregar */}
          <button onClick={addNovedad}
            className="w-full bg-[#16a34a] active:bg-[#0f7a37] text-white font-bold rounded-xl py-3.5 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva novedad
          </button>

          {Object.keys(novedades).length === 0 ? (
            <p className="text-white/20 text-sm text-center py-8">No hay novedades cargadas</p>
          ) : (
            Object.entries(novedades)
              .sort(([, a], [, b]) => (b.orden || 0) - (a.orden || 0))
              .map(([id, nov], idx, arr) => (
                <div key={id} className="flex flex-col gap-0">
                  <div className="bg-[#1e1e1e] rounded-2xl border border-white/5 p-4 flex flex-col gap-3">

                    {/* Título */}
                    <div>
                      <label className="text-gray-500 text-xs mb-1 block">Título</label>
                      <input
                        type="text"
                        defaultValue={nov.titulo || ''}
                        onChange={e => { novFormsRef.current[id] = { ...novFormsRef.current[id], titulo: e.target.value } }}
                        placeholder="Ej: Convocatoria para el torneo..."
                        className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#16a34a]"
                      />
                    </div>

                    {/* Imagen */}
                    <div>
                      <label className="text-gray-500 text-xs mb-2 block">Foto</label>
                      {nov.imagen ? (
                        <div className="flex flex-col gap-2">
                          <div className="relative rounded-xl overflow-hidden border border-white/8">
                            <img src={nov.imagen} alt="novedad" className="w-full object-contain" style={{ maxHeight: '25vh' }} />
                            <div className="absolute top-2 right-2 bg-green-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Cargada</div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => novImgRefs.current[id]?.click()}
                              disabled={uploadingNovImg[id]}
                              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold bg-white/8 active:bg-white/15 text-white/60 border border-white/10 disabled:opacity-50">
                              {uploadingNovImg[id]
                                ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Procesando...</>
                                : 'Reemplazar'}
                            </button>
                            <button onClick={() => deleteNovImagen(id)}
                              className="flex items-center justify-center gap-1.5 px-4 rounded-xl py-2.5 text-sm font-semibold bg-red-500/15 active:bg-red-500/30 text-red-400 border border-red-500/20">
                              Quitar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => novImgRefs.current[id]?.click()}
                          disabled={uploadingNovImg[id]}
                          className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold bg-white/8 active:bg-white/15 text-white/60 border border-white/10 disabled:opacity-50">
                          {uploadingNovImg[id]
                            ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Procesando...</>
                            : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>Examinar...</>}
                        </button>
                      )}
                      <input
                        type="file" accept="image/*" className="hidden"
                        ref={el => novImgRefs.current[id] = el}
                        onChange={e => e.target.files[0] && uploadNovImagen(id, e.target.files[0])}
                      />
                    </div>

                    {/* Detalle */}
                    <div>
                      <label className="text-gray-500 text-xs mb-1 block">Comentario / Detalle</label>
                      <textarea
                        defaultValue={nov.detalle || ''}
                        onChange={e => { novFormsRef.current[id] = { ...novFormsRef.current[id], detalle: e.target.value } }}
                        placeholder="Escribí los detalles de la novedad..."
                        rows={3}
                        className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#16a34a] resize-none"
                      />
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => saveNovedad(id)} disabled={savingNov[id]}
                        className="flex-1 bg-[#16a34a] active:bg-[#0f7a37] disabled:opacity-50 text-white font-bold rounded-xl py-2.5 text-sm transition-colors">
                        {savingNov[id] ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button onClick={() => deleteNovedad(id)}
                        className="w-11 h-10 flex items-center justify-center rounded-xl bg-red-500/15 active:bg-red-500/30 border border-red-500/20 shrink-0">
                        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Separador entre novedades */}
                  {idx < arr.length - 1 && (
                    <div className="flex items-center gap-3 px-1 py-2">
                      <div className="flex-1 h-px bg-white/8" />
                      <span className="text-white/15 text-[10px] uppercase tracking-widest">—</span>
                      <div className="flex-1 h-px bg-white/8" />
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      )}

      {/* SEDES */}
      {tab === 'sedes' && (() => {
        const sedesLista = Object.entries(data.sedes || {})
          .map(([id, v]) => ({ id, nombre: v.nombre || '', direccion: v.direccion || '' }))
          .sort((a, b) => a.nombre.localeCompare(b.nombre))

        return (
          <div className="px-3 py-4 flex flex-col gap-4">
            <p className="text-gray-500 text-xs uppercase tracking-widest">Dirección de los clubes · Súper Liga de Solano</p>

            <div className="bg-[#1e1e1e] rounded-2xl border border-white/5 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
                <span className="text-white/50 text-xs uppercase tracking-wide">Clubes</span>
                <span className="text-white/25 text-xs">{sedesLista.length} cargados</span>
              </div>

              {/* Agregar sede */}
              <div className="flex flex-col gap-2 px-3 py-3 border-b border-white/5">
                <input
                  type="text"
                  value={nuevaSedeNombre}
                  onChange={e => setNuevaSedeNombre(e.target.value)}
                  placeholder="Nombre del club..."
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#16a34a]"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nuevaSedeDireccion}
                    onChange={e => setNuevaSedeDireccion(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addSede()}
                    placeholder="Dirección..."
                    className="flex-1 bg-[#2a2a2a] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#16a34a]"
                  />
                  <button onClick={addSede}
                    className="bg-[#16a34a] active:bg-[#0f7a37] text-white rounded-xl px-4 py-2 text-sm font-bold shrink-0">
                    +
                  </button>
                </div>
              </div>

              {/* Lista */}
              {sedesLista.length === 0 ? (
                <p className="text-white/20 text-sm text-center py-8">Sin sedes cargadas</p>
              ) : (
                <div className="divide-y divide-white/5">
                  {sedesLista.map(({ id, nombre, direccion }) => (
                    <div key={id} className="flex items-center gap-2 px-3 py-2.5">
                      {editingSedeId === id ? (
                        <>
                          <div className="flex-1 flex flex-col gap-1.5">
                            <input
                              type="text"
                              value={editingSedeNombre}
                              onChange={e => setEditingSedeNombre(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Escape') setEditingSedeId(null) }}
                              className="w-full bg-[#2a2a2a] border border-[#16a34a] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none"
                              autoFocus
                            />
                            <input
                              type="text"
                              value={editingSedeDireccion}
                              onChange={e => setEditingSedeDireccion(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') saveEditSede(id); if (e.key === 'Escape') setEditingSedeId(null) }}
                              className="w-full bg-[#2a2a2a] border border-[#16a34a] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none"
                            />
                          </div>
                          <button onClick={() => saveEditSede(id)}
                            className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button onClick={() => setEditingSedeId(null)}
                            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0">
                            <p className="text-white/80 text-sm font-medium truncate">{nombre}</p>
                            <p className="text-white/35 text-xs truncate">{direccion}</p>
                          </div>
                          <button onClick={() => { setEditingSedeId(id); setEditingSedeNombre(nombre); setEditingSedeDireccion(direccion) }}
                            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                            <svg className="w-3.5 h-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => deleteSede(id)}
                            className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                            <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })()}

      <div className="h-6" />
    </div>
  )
}
