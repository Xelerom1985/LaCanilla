import { useState, useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { db, ref, onValue, runTransaction } from './firebase'
import Navbar from './components/Navbar'
import Home from './components/Home'
import Partidos from './components/Partidos'
import Tablas from './components/Tablas'
import Admin from './components/Admin'
import Plantel from './components/Plantel'
import Novedades from './components/Novedades'

const PASS = '1883'

const defaultData = {
  proximoPartido: { rival: '', dia: '', cancha: '', mapsUrl: '' },
  categorias: {
    "1ra":        { jugando: false },
    "3ra":        { jugando: false },
    "4ta":        { jugando: false },
    "5ta":        { jugando: false },
    "6ta":        { jugando: false },
    reservaMasc:  { jugando: false },
    reservaFem:   { jugando: false },
    mas33:        { jugando: false },
    mas40:        { jugando: false },
  },
}

function AppBackground({ fondoImagen }) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none select-none">
      <div className="absolute top-0 left-0 right-0" style={{ height: '52%' }}>
        <img
          src={fondoImagen || "/cancha.png"}
          alt=""
          className="w-full h-full object-cover"
          style={{
            objectPosition: 'center 65%',
            filter: 'saturate(0.7) brightness(0.55) contrast(1.05)',
          }}
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, transparent 0%, transparent 55%, #0f5c22aa 85%, #0f5c22 100%)'
        }} />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, #0f5c2230, transparent 40%)'
        }} />
      </div>
      <div className="absolute left-0 right-0 bottom-0" style={{ top: '52%' }}>
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, #0f5c22 0%, #071a0d 100%)'
        }} />
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.07 }}>
          <defs>
            <pattern id="diag" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
              <line x1="0" y1="0" x2="0" y2="14" stroke="#f1e9d8" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diag)" />
        </svg>
      </div>
    </div>
  )
}

export default function App() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()
  const [seccion, setSeccion] = useState('home')
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showInstall, setShowInstall] = useState(false)
  const [data, setData] = useState(defaultData)
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(() => localStorage.getItem('lacanilla_admin') === '1')
  const [showLogin, setShowLogin] = useState(false)
  const [passInput, setPassInput] = useState('')
  const [passError, setPassError] = useState(false)
  const [showToastNovedades, setShowToastNovedades] = useState(false)

  useEffect(() => {
    window.history.pushState({ section: 'home' }, '')
    const handlePopState = () => {
      setSeccion('home')
      window.history.pushState({ section: 'home' }, '')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      setShowInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  useEffect(() => {
    if (!data.novedadesUpdatedAt) return
    const lastSeen = parseInt(localStorage.getItem('novedadesLastSeen') || '0', 10)
    if (data.novedadesUpdatedAt > lastSeen) {
      const t = setTimeout(() => setShowToastNovedades(true), 800)
      return () => clearTimeout(t)
    }
  }, [data.novedadesUpdatedAt])

  useEffect(() => {
    if (!showToastNovedades) return
    const t = setTimeout(() => setShowToastNovedades(false), 5000)
    return () => clearTimeout(t)
  }, [showToastNovedades])

  const navegarSeccion = (s) => {
    if (s !== 'home') window.history.pushState({ section: s }, '')
    if (s === 'novedades') localStorage.setItem('novedadesLastSeen', Date.now())
    if (s !== 'admin') runTransaction(ref(db, `analytics/secciones/${s}`), v => (v || 0) + 1)
    setSeccion(s)
  }

  useEffect(() => {
    const dbRef = ref(db, '/')
    const unsub = onValue(dbRef, (snapshot) => {
      const val = snapshot.val()
      if (val) {
        setData(prev => ({
          ...prev,
          ...val,
          categorias: { ...prev.categorias, ...(val.categorias || {}) },
          proximoPartido: val.proximoPartido || prev.proximoPartido,
          fechas: val.fechas || prev.fechas || {},
        }))
      }
      setLoading(false)
    }, () => setLoading(false))
    return () => unsub()
  }, [])

  const handleLogin = () => {
    if (passInput.trim() === PASS) {
      localStorage.setItem('lacanilla_admin', '1')
      setAuthed(true)
      setShowLogin(false)
      setPassInput('')
      setPassError(false)
    } else {
      setPassError(true)
      setPassInput('')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('lacanilla_admin')
    setAuthed(false)
    navegarSeccion('home')
  }

  const handleLockClick = () => {
    if (authed) {
      handleLogout()
    } else {
      setShowLogin(true)
      setPassInput('')
      setPassError(false)
    }
  }

  return (
    <div className="flex flex-col min-h-dvh text-white" style={{ background: '#071a0d' }}>
      <AppBackground fondoImagen={data.fondoImagen} />

      <main className="flex-1 overflow-y-auto pb-20 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-screen gap-4">
            <img src="/escudo.png" alt="" className="w-20 opacity-80 animate-pulse" />
            <div className="w-8 h-8 rounded-full border-2 border-[#f1e9d8]/30 border-t-[#f1e9d8] animate-spin" />
          </div>
        ) : (
          <>
            {seccion === 'home' && <Home data={data} />}
            {seccion === 'novedades' && <Novedades data={data} />}
            {seccion === 'partidos' && <Partidos data={data} />}
            {seccion === 'tablas' && <Tablas data={data} />}
            {seccion === 'plantel' && <Plantel data={data} />}
            {seccion === 'admin' && authed && <Admin data={data} />}
          </>
        )}
      </main>

      <Navbar seccion={seccion} setSeccion={navegarSeccion} authed={authed} novedadesUpdatedAt={data.novedadesUpdatedAt} />

      {/* Candado global — visible en todas las secciones */}
      {!loading && (
        <button
          onClick={handleLockClick}
          className={`fixed top-3 right-3 z-40 w-11 h-11 flex items-center justify-center transition-colors ${authed ? 'text-white/60 active:text-white/90' : 'text-white/35 active:text-white/60'}`}
        >
          {authed ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )}
        </button>
      )}

      {/* Modal de login */}
      {showLogin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) { setShowLogin(false); setPassInput(''); setPassError(false) } }}
        >
          <div className="w-full max-w-xs bg-[#071a0d] border border-white/10 rounded-2xl p-6 flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-[#16a34a]/20 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-[#16a34a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Acceso Admin</h3>
            <p className="text-gray-500 text-sm mb-5 text-center">Ingresá la contraseña</p>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              value={passInput}
              onChange={e => { setPassInput(e.target.value); setPassError(false) }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Contraseña"
              autoFocus
              className={`w-full bg-[#2a2a2a] border ${passError ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white text-center text-lg tracking-widest focus:outline-none focus:border-[#16a34a] mb-2`}
            />
            {passError && <p className="text-red-400 text-xs text-center mb-2">Contraseña incorrecta</p>}
            <button onClick={handleLogin} className="w-full bg-[#16a34a] active:bg-[#0f7a37] text-white font-bold rounded-xl py-3 mt-1 transition-colors">
              Ingresar
            </button>
            <button
              onClick={() => { setShowLogin(false); setPassInput(''); setPassError(false) }}
              className="mt-3 text-white/30 text-sm active:text-white/60"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Toast novedades */}
      {showToastNovedades && (
        <div
          className="fixed top-4 left-3 right-3 z-50 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl"
          style={{ background: 'rgba(22,163,74,0.95)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)' }}
        >
          <span className="text-lg shrink-0">🔔</span>
          <p className="flex-1 text-white text-sm font-semibold">¡Hay novedades nuevas!</p>
          <button
            onClick={() => { setShowToastNovedades(false); navegarSeccion('novedades') }}
            className="text-white/80 text-xs font-bold border border-white/30 rounded-lg px-2.5 py-1 active:bg-white/20 shrink-0"
          >
            Ver →
          </button>
          <button
            onClick={() => setShowToastNovedades(false)}
            className="text-white/50 active:text-white shrink-0 ml-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Banner de nueva versión disponible */}
      {needRefresh && (
        <div className="fixed bottom-20 left-3 right-3 z-50 bg-[#16a34a] rounded-2xl px-4 py-3 flex items-center justify-between shadow-xl">
          <p className="text-white text-sm font-medium">Nueva versión disponible</p>
          <button
            onClick={() => updateServiceWorker(true)}
            className="bg-white text-[#16a34a] text-xs font-bold px-3 py-1.5 rounded-xl active:opacity-80"
          >
            Actualizar
          </button>
        </div>
      )}

      {/* Banner de instalación PWA */}
      {showInstall && (
        <div className="fixed bottom-20 left-3 right-3 z-50 rounded-2xl px-4 py-3 flex items-center justify-between shadow-xl" style={{ background: 'rgba(7,26,13,0.96)', border: '1px solid rgba(241,233,216,0.15)' }}>
          <div className="flex items-center gap-3">
            <img src="/escudo.png" alt="" className="w-8 h-8 object-contain" />
            <p className="text-white text-sm font-medium">Instalar CSD La Canilla</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInstall(false)}
              className="text-white/30 text-xs px-2 py-1.5 active:text-white/60"
            >
              Ahora no
            </button>
            <button
              onClick={async () => {
                if (!installPrompt) return
                await installPrompt.prompt()
                setShowInstall(false)
                setInstallPrompt(null)
              }}
              className="bg-[#16a34a] text-white text-xs font-bold px-3 py-1.5 rounded-xl active:opacity-80"
            >
              Instalar
            </button>
          </div>
        </div>
      )}


    </div>
  )
}
