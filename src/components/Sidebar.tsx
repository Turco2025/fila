import { BarChart3, ClipboardList, Settings, Table2, UsersRound } from 'lucide-react'

const items = [
  { label: 'Fila', icon: ClipboardList },
  { label: 'Mesas', icon: Table2 },
  { label: 'Equipe', icon: UsersRound },
  { label: 'Relatorios', icon: BarChart3 },
  { label: 'Regras', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-4 lg:block">
      <div className="rounded-lg bg-slate-950 p-4 text-white">
        <p className="text-sm text-slate-300">Operacao ativa</p>
        <p className="mt-1 text-2xl font-black">Casa Aurora</p>
      </div>
      <div className="mt-5 space-y-1">
        {items.map(({ label, icon: Icon }, index) => (
          <button
            key={label}
            type="button"
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-bold ${
              index === 0 ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Icon size={18} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
    </aside>
  )
}
