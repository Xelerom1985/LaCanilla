import { useMemo } from 'react'

export default function Navbar({ seccion, setSeccion, authed, novedadesUpdatedAt }) {
  const hayNovedades = useMemo(() => {
    if (!novedadesUpdatedAt) return false
    const lastSeen = parseInt(localStorage.getItem('novedadesLastSeen') || '0', 10)
    return novedadesUpdatedAt > lastSeen
  }, [novedadesUpdatedAt])
  const items = [
    {
      id: 'home',
      label: 'Inicio',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'novedades',
      label: 'Novedades',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
    },
    {
      id: 'partidos',
      label: 'Partidos',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'tablas',
      label: 'Tab. y Plantel',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M10 3v18M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6z" />
        </svg>
      ),
    },
    {
      id: 'plantel',
      label: 'Estadísticas',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V11M11 16V8M15 16V5" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 14l9-9m0 0h-3m3 0v3" />
        </svg>
      ),
    },
    {
      id: 'sedes',
      label: 'Sedes',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    ...(authed ? [{
      id: 'admin',
      label: 'Admin',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    }] : []),
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom" style={{ background: 'rgba(10,2,4,0.92)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(241,233,216,0.08)' }}>
      <div className="flex">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => setSeccion(item.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 px-1 transition-colors duration-150 relative ${
              seccion === item.id
                ? 'text-[#f1e9d8]'
                : 'text-[#f1e9d8]/30 active:text-[#f1e9d8]/60'
            }`}
          >
            <div className="relative">
              {item.icon}
              {item.id === 'novedades' && hayNovedades && seccion !== 'novedades' && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#0a0204]" />
              )}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
            {seccion === item.id && (
              <span className="absolute bottom-0 w-8 h-0.5 bg-[#f1e9d8]/60 rounded-t-full" />
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}
