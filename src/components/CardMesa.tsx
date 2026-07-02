import { Check, CookingPot, CreditCard, UsersRound } from 'lucide-react'
import type { FilaCliente, Mesa, MesaStatus } from '../types/domain'
import { BadgeStatus } from './BadgeStatus'

interface CardMesaProps {
  mesa: Mesa
  sugestao?: FilaCliente
  onStatus?: (mesa: Mesa, status: MesaStatus) => void
  onPreparar?: (mesa: Mesa) => void
  onPronta?: (mesa: Mesa) => void
  onSentar?: (mesa: Mesa) => void
}

export function CardMesa({ mesa, sugestao, onStatus, onPreparar, onPronta, onSentar }: CardMesaProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-slate-500">{mesa.setor_ou_area}</p>
          <h3 className="mt-1 text-2xl font-black text-slate-950">Mesa {mesa.numero_mesa}</h3>
        </div>
        <BadgeStatus status={mesa.status_atual} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-slate-500">Capacidade</p>
          <p className="flex items-center gap-2 text-lg font-black text-slate-950">
            <UsersRound size={17} aria-hidden="true" />
            {mesa.capacidade_maxima}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-slate-500">Ideal</p>
          <p className="text-lg font-black text-slate-950">{mesa.quantidade_ideal_pessoas} pessoas</p>
        </div>
      </div>

      {mesa.status_atual === 'pronta' && (
        <div className="mt-4 rounded-lg bg-teal-50 p-3 text-sm text-teal-950 ring-1 ring-teal-100">
          <p className="font-black">{mesa.observacoes || `Mesa ${mesa.numero_mesa} pronta.`}</p>
          <p className="mt-1">
            Sugestao: {sugestao ? `${sugestao.nome_cliente} (${sugestao.quantidade_pessoas} pessoas)` : 'sem encaixe'}
          </p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        {onPreparar && (
          <button
            type="button"
            onClick={() => onPreparar(mesa)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-100 px-3 py-3 text-sm font-black text-yellow-900"
          >
            <CookingPot size={17} aria-hidden="true" />
            Preparo
          </button>
        )}
        {onPronta && (
          <button
            type="button"
            onClick={() => onPronta(mesa)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-3 py-3 text-sm font-black text-white"
          >
            <Check size={17} aria-hidden="true" />
            Pronta
          </button>
        )}
        {onStatus && (
          <button
            type="button"
            onClick={() => onStatus(mesa, 'em pagamento')}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-50 px-3 py-3 text-sm font-bold text-violet-800 ring-1 ring-violet-100"
          >
            <CreditCard size={17} aria-hidden="true" />
            Pagamento
          </button>
        )}
        {onSentar && mesa.status_atual === 'pronta' && (
          <button
            type="button"
            onClick={() => onSentar(mesa)}
            className="rounded-lg bg-slate-950 px-3 py-3 text-sm font-black text-white"
          >
            Cliente sentado
          </button>
        )}
      </div>
    </article>
  )
}
