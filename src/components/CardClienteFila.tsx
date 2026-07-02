import { useEffect, useMemo, useState } from 'react'
import { Clock, MessageCircle, TimerReset, Trash2, UsersRound } from 'lucide-react'
import { BadgeStatus } from './BadgeStatus'
import type { FilaCliente, Mesa } from '../types/domain'
import { calcularTempoEspera, calcularTempoRestanteChamada } from '../services/queue'

interface CardClienteFilaProps {
  cliente: FilaCliente
  mesa?: Mesa
  onChamar?: (cliente: FilaCliente) => void
  onChegou?: (cliente: FilaCliente) => void
  onAusente?: (cliente: FilaCliente) => void
  onCancelar?: (cliente: FilaCliente) => void
  onExcluir?: (cliente: FilaCliente) => void
}

export function CardClienteFila({
  cliente,
  mesa,
  onChamar,
  onChegou,
  onAusente,
  onCancelar,
  onExcluir,
}: CardClienteFilaProps) {
  const [agora, setAgora] = useState(() => new Date())
  const tempoRestanteChamada = useMemo(
    () => calcularTempoRestanteChamada(cliente.horario_chamada, agora),
    [agora, cliente.horario_chamada],
  )
  const chamadaExpirada = cliente.status === 'chamado' && tempoRestanteChamada === 0
  const mostrarTimerChamada = cliente.status === 'chamado' && cliente.horario_chamada

  useEffect(() => {
    if (!mostrarTimerChamada) return undefined

    const intervalId = window.setInterval(() => setAgora(new Date()), 1000)
    return () => window.clearInterval(intervalId)
  }, [mostrarTimerChamada])

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-black text-slate-950">{cliente.nome_cliente}</h3>
            <BadgeStatus status={cliente.status} />
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1">
              <UsersRound size={16} aria-hidden="true" />
              {cliente.quantidade_pessoas} pessoas
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={16} aria-hidden="true" />
              {calcularTempoEspera(cliente.horario_entrada)} min
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle size={16} aria-hidden="true" />
              {cliente.whatsapp}
            </span>
          </div>
          {cliente.observacoes && <p className="mt-3 text-sm text-slate-600">{cliente.observacoes}</p>}
          {mesa && (
            <p className="mt-3 rounded-lg bg-teal-50 px-3 py-2 text-sm font-bold text-teal-900">
              Direcionar {cliente.nome_cliente} - {cliente.quantidade_pessoas} pessoas - para a Mesa{' '}
              {mesa.numero_mesa}.
            </p>
          )}
          {mostrarTimerChamada && (
            <div
              className={`mt-3 rounded-lg p-3 text-sm ring-1 ${
                chamadaExpirada
                  ? 'bg-rose-50 text-rose-900 ring-rose-100'
                  : 'bg-sky-50 text-sky-900 ring-sky-100'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 font-black">
                  <TimerReset size={17} aria-hidden="true" />
                  Timer de chegada
                </span>
                <span className="rounded-lg bg-white px-3 py-1 font-black">
                  {formatarTempo(tempoRestanteChamada)}
                </span>
              </div>
              <p className="mt-2 font-semibold">
                {chamadaExpirada
                  ? 'Tempo esgotado. Se o cliente nao apareceu, exclua-o da fila.'
                  : 'A recepcao tem 5 minutos para confirmar que o cliente apareceu.'}
              </p>
              {chamadaExpirada && onExcluir && (
                <button
                  type="button"
                  onClick={() => onExcluir(cliente)}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-3 text-sm font-black text-white hover:bg-rose-700 sm:w-auto"
                >
                  <Trash2 size={17} aria-hidden="true" />
                  Excluir cliente
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          {onChamar && cliente.status === 'aguardando' && (
            <button
              type="button"
              onClick={() => onChamar(cliente)}
              className="rounded-lg bg-teal-600 px-4 py-3 text-sm font-black text-white hover:bg-teal-700"
            >
              Chamar cliente
            </button>
          )}
          {onChegou && cliente.status === 'chamado' && (
            <button
              type="button"
              onClick={() => onChegou(cliente)}
              className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-slate-800"
            >
              Cliente chegou
            </button>
          )}
          {onAusente && (
            <button
              type="button"
              onClick={() => onAusente(cliente)}
              className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-100"
            >
              Ausente
            </button>
          )}
          {onCancelar && (
            <button
              type="button"
              onClick={() => onCancelar(cliente)}
              className="rounded-lg bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

function formatarTempo(milissegundos: number): string {
  const totalSegundos = Math.ceil(milissegundos / 1000)
  const minutos = Math.floor(totalSegundos / 60)
  const segundos = totalSegundos % 60

  return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`
}
