import { useMemo } from 'react'
import { CardMesa } from '../components/CardMesa'
import type { ConfiguracoesFila, FilaCliente, Mesa, MesaStatus } from '../types/domain'
import { sugerirClienteCompativel } from '../services/queue'

interface PainelGarcomProps {
  mesas: Mesa[]
  clientes: FilaCliente[]
  configuracao: ConfiguracoesFila
  onStatus: (mesa: Mesa, status: MesaStatus) => void
  onPreparar: (mesa: Mesa) => void
  onPronta: (mesa: Mesa) => void
  onSentar: (mesa: Mesa) => void
}

export function PainelGarcom({ mesas, clientes, configuracao, onStatus, onPreparar, onPronta, onSentar }: PainelGarcomProps) {
  const indicadores = useMemo(
    () => [
      { label: 'Livres', value: mesas.filter((mesa) => mesa.status_atual === 'livre').length },
      { label: 'Em preparo', value: mesas.filter((mesa) => mesa.status_atual === 'em preparo').length },
      { label: 'Prontas', value: mesas.filter((mesa) => mesa.status_atual === 'pronta').length },
      { label: 'Ocupadas', value: mesas.filter((mesa) => mesa.status_atual === 'ocupada').length },
    ],
    [mesas],
  )

  return (
    <main className="flex-1 bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Painel do garcom</p>
          <h2 className="mt-1 text-3xl font-black text-slate-950">Mapa de mesas</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {indicadores.map((item) => (
              <div key={item.label} className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-500">{item.label}</p>
                <p className="text-2xl font-black text-slate-950">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {mesas.map((mesa) => (
            <CardMesa
              key={mesa.id}
              mesa={mesa}
              sugestao={sugerirClienteCompativel(mesa, clientes, configuracao)}
              onStatus={onStatus}
              onPreparar={onPreparar}
              onPronta={onPronta}
              onSentar={onSentar}
            />
          ))}
        </section>
      </div>
    </main>
  )
}
