import { NavLink } from 'react-router-dom'

export default function BottomNav({ onAdd }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0a0f1a]/95 backdrop-blur-xl border-t border-white/5 px-4 py-2 flex items-center justify-around safe-bottom">
      <NavLink to="/" end className={({isActive}) => `flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors ${isActive ? 'text-amber-400' : 'text-slate-500'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
        <span className="text-[10px] font-medium">Dashboard</span>
      </NavLink>
      <NavLink to="/transactions" className={({isActive}) => `flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors ${isActive ? 'text-amber-400' : 'text-slate-500'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span className="text-[10px] font-medium">Transazioni</span>
      </NavLink>
      <button onClick={onAdd} className="flex flex-col items-center gap-0.5 p-2 text-slate-500 hover:text-amber-400 transition-colors">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center text-[#060b14] text-xl shadow-lg shadow-amber-500/25">+</div>
        <span className="text-[10px] font-medium mt-1">Nuova</span>
      </button>
      <NavLink to="/profile" className={({isActive}) => `flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors ${isActive ? 'text-amber-400' : 'text-slate-500'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
        <span className="text-[10px] font-medium">Profilo</span>
      </NavLink>
    </nav>
  )
}