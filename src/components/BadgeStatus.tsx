import clsx from 'clsx'

const statusClasses: Record<string, string> = {
  aguardando: 'bg-amber-100 text-amber-800 ring-amber-200',
  chamado: 'bg-sky-100 text-sky-800 ring-sky-200',
  chegou: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  sentado: 'bg-stone-100 text-stone-700 ring-stone-200',
  ausente: 'bg-rose-100 text-rose-800 ring-rose-200',
  cancelado: 'bg-zinc-100 text-zinc-700 ring-zinc-200',
  livre: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  ocupada: 'bg-zinc-900 text-white ring-zinc-800',
  'conta solicitada': 'bg-orange-100 text-orange-800 ring-orange-200',
  'em pagamento': 'bg-violet-100 text-violet-800 ring-violet-200',
  'em preparo': 'bg-yellow-100 text-yellow-900 ring-yellow-200',
  pronta: 'bg-teal-100 text-teal-800 ring-teal-200',
  reservada: 'bg-indigo-100 text-indigo-800 ring-indigo-200',
}

interface BadgeStatusProps {
  status: string
  className?: string
}

export function BadgeStatus({ status, className }: BadgeStatusProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1',
        statusClasses[status] ?? 'bg-slate-100 text-slate-700 ring-slate-200',
        className,
      )}
    >
      {status}
    </span>
  )
}
