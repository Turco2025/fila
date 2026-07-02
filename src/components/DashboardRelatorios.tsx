import { BarChart3, Clock, Table2, UserCheck, UserX } from 'lucide-react'
import type { HistoricoAtendimento, RelatorioResumo } from '../types/domain'

interface DashboardRelatoriosProps {
  historico: HistoricoAtendimento[]
}

export function DashboardRelatorios({ historico }: DashboardRelatoriosProps) {
  const resumo = calcularResumo(historico)
  const cards = [
    { label: 'Tempo medio', value: `${resumo.tempoMedioEspera} min`, icon: Clock },
    { label: 'Atendidos', value: resumo.clientesAtendidos, icon: UserCheck },
    { label: 'Ausentes', value: resumo.clientesAusentes, icon: UserX },
    { label: 'Mesa destaque', value: resumo.mesaMaisUtilizada, icon: Table2 },
    { label: 'Pico', value: resumo.horarioMaiorMovimento, icon: BarChart3 },
  ]

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(({ label, value, icon: Icon }) => (
        <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-slate-500">{label}</p>
            <Icon size={18} className="text-teal-700" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-black text-slate-950">{value}</p>
        </div>
      ))}
    </section>
  )
}

function calcularResumo(historico: HistoricoAtendimento[]): RelatorioResumo {
  const atendidos = historico.filter((item) => item.status_final === 'atendido')
  const ausentes = historico.filter((item) => item.status_final === 'ausente')
  const totalEspera = atendidos.reduce((sum, item) => sum + item.tempo_total_espera, 0)
  const mesaMaisUtilizada = moda(atendidos.map((item) => `Mesa ${item.numero_mesa}`)) ?? 'Sem dados'

  return {
    tempoMedioEspera: atendidos.length ? Math.round(totalEspera / atendidos.length) : 0,
    clientesAtendidos: atendidos.length,
    clientesAusentes: ausentes.length,
    mesaMaisUtilizada,
    horarioMaiorMovimento: '20h - 21h',
  }
}

function moda(items: string[]): string | undefined {
  const ranking = new Map<string, number>()
  items.forEach((item) => ranking.set(item, (ranking.get(item) ?? 0) + 1))
  return [...ranking.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
}
