import { useMemo, useState } from 'react'
import { Plus, Sparkles } from 'lucide-react'
import { CardClienteFila } from '../components/CardClienteFila'
import { CardMesa } from '../components/CardMesa'
import { FiltrosPorQuantidadePessoas } from '../components/FiltrosPorQuantidadePessoas'
import type { ConfiguracoesFila, FilaCliente, Mesa } from '../types/domain'
import { sugerirClienteCompativel } from '../services/queue'

interface PainelRecepcaoProps {
  clientes: FilaCliente[]
  mesas: Mesa[]
  configuracao: ConfiguracoesFila
  onChamar: (cliente: FilaCliente, mesa: Mesa) => void
  onChegou: (cliente: FilaCliente) => void
  onAusente: (cliente: FilaCliente) => void
  onCancelar: (cliente: FilaCliente) => void
  onExcluir: (cliente: FilaCliente) => void
}

export function PainelRecepcao({
  clientes,
  mesas,
  configuracao,
  onChamar,
  onChegou,
  onAusente,
  onCancelar,
  onExcluir,
}: PainelRecepcaoProps) {
  const [filtro, setFiltro] = useState<number | 'todos'>('todos')
  const mesasProntas = mesas.filter((mesa) => mesa.status_atual === 'pronta')
  const filaFiltrada = clientes.filter((cliente) => filtro === 'todos' || cliente.quantidade_pessoas === filtro)
  const sugestoes = useMemo(
    () =>
      mesasProntas.map((mesa) => ({
        mesa,
        cliente: sugerirClienteCompativel(mesa, clientes, configuracao),
      })),
    [clientes, configuracao, mesasProntas],
  )

  return (
    <main className="flex-1 bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="flex flex-col gap-3 rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Painel da recepcao</p>
            <h2 className="mt-1 text-3xl font-black text-slate-950">Fila em tempo real</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-black text-slate-800 ring-1 ring-slate-200">
              <Plus size={17} aria-hidden="true" />
              Encaixe manual
            </button>
            <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-3 text-sm font-black text-white">
              <Sparkles size={17} aria-hidden="true" />
              Sugestoes ativas
            </button>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.95fr_1.4fr]">
          <div className="space-y-3">
            <h3 className="text-lg font-black text-slate-950">Mesas prontas e cliente sugerido</h3>
            {sugestoes.map(({ mesa, cliente }) => (
              <div key={mesa.id} className="rounded-lg border border-teal-100 bg-white p-4 shadow-sm">
                <CardMesa mesa={mesa} sugestao={cliente} />
                {cliente && (
                  <button
                    type="button"
                    onClick={() => onChamar(cliente, mesa)}
                    className="mt-3 w-full rounded-lg bg-teal-600 px-4 py-4 text-sm font-black text-white hover:bg-teal-700"
                  >
                    Chamar {cliente.nome_cliente} para Mesa {mesa.numero_mesa}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-black text-slate-950">Clientes aguardando</h3>
              <FiltrosPorQuantidadePessoas valor={filtro} onChange={setFiltro} />
            </div>
            <div className="space-y-3">
              {filaFiltrada.map((cliente) => {
                const mesa = mesas.find((item) => item.id === cliente.mesa_destinada_id)
                const primeiraMesaPronta = mesasProntas.find((item) => sugerirClienteCompativel(item, [cliente], configuracao))

                return (
                  <CardClienteFila
                    key={cliente.id}
                    cliente={cliente}
                    mesa={mesa}
                    onChamar={primeiraMesaPronta ? () => onChamar(cliente, primeiraMesaPronta) : undefined}
                    onChegou={onChegou}
                    onAusente={onAusente}
                    onCancelar={onCancelar}
                    onExcluir={onExcluir}
                  />
                )
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
