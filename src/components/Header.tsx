import { BellRing, QrCode, ShieldCheck } from 'lucide-react'
import type { Perfil } from '../types/domain'

interface HeaderProps {
  active: Perfil
  onChange: (perfil: Perfil) => void
}

const tabs: Array<{ id: Perfil; label: string }> = [
  { id: 'cliente', label: 'Cliente QR' },
  { id: 'recepcao', label: 'Recepcao' },
  { id: 'garcom', label: 'Garcom' },
  { id: 'admin', label: 'Admin' },
]

export function Header({ active, onChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white">
            <QrCode size={23} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Fila inteligente</p>
            <h1 className="text-xl font-black text-slate-950 sm:text-2xl">MesaCerta Operacoes</h1>
          </div>
        </div>

        <nav className="grid grid-cols-2 gap-2 sm:flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`rounded-lg px-4 py-3 text-sm font-bold transition ${
                active === tab.id
                  ? 'bg-slate-950 text-white shadow-lg shadow-slate-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800 ring-1 ring-emerald-100 xl:flex">
          <BellRing size={17} aria-hidden="true" />
          Tempo real local
          <ShieldCheck size={17} aria-hidden="true" />
        </div>
      </div>
    </header>
  )
}
