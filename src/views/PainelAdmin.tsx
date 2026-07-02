import type { ConfiguracoesFila, Funcionario, Mesa, HistoricoAtendimento } from '../types/domain'
import { BadgeStatus } from '../components/BadgeStatus'
import { DashboardRelatorios } from '../components/DashboardRelatorios'

interface PainelAdminProps {
  mesas: Mesa[]
  funcionarios: Funcionario[]
  configuracao: ConfiguracoesFila
  historico: HistoricoAtendimento[]
  onConfigurar: (patch: Partial<ConfiguracoesFila>) => void
}

export function PainelAdmin({ mesas, funcionarios, configuracao, historico, onConfigurar }: PainelAdminProps) {
  return (
    <main className="flex-1 bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Painel administrativo</p>
          <h2 className="mt-1 text-3xl font-black text-slate-950">Configuracoes e relatorios</h2>
        </section>

        <DashboardRelatorios historico={historico} />

        <section className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-black text-slate-950">Cadastro e edicao de mesas</h3>
              <button type="button" className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-black text-white">
                Nova mesa
              </button>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-left text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Numero</th>
                    <th className="px-3 py-2">Identificacao</th>
                    <th className="px-3 py-2">Capacidade</th>
                    <th className="px-3 py-2">Setor</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mesas.map((mesa) => (
                    <tr key={mesa.id} className="bg-slate-50">
                      <td className="rounded-l-lg px-3 py-3 font-black text-slate-950">{mesa.numero_mesa}</td>
                      <td className="px-3 py-3">{mesa.nome_ou_identificacao}</td>
                      <td className="px-3 py-3">{mesa.capacidade_maxima}</td>
                      <td className="px-3 py-3">{mesa.setor_ou_area}</td>
                      <td className="rounded-r-lg px-3 py-3">
                        <BadgeStatus status={mesa.status_atual} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-xl font-black text-slate-950">Regras de encaixe</h3>
              <div className="mt-4 space-y-3">
                <Toggle
                  label="Permitir 2 pessoas em mesa de 4"
                  checked={configuracao.permitir_2_em_4}
                  onChange={(checked) => onConfigurar({ permitir_2_em_4: checked })}
                />
                <Toggle
                  label="Permitir 4 pessoas em mesa de 6"
                  checked={configuracao.permitir_4_em_6}
                  onChange={(checked) => onConfigurar({ permitir_4_em_6: checked })}
                />
                <Toggle
                  label="Permitir 6 pessoas em mesa de 8"
                  checked={configuracao.permitir_6_em_8}
                  onChange={(checked) => onConfigurar({ permitir_6_em_8: checked })}
                />
                <label className="block text-sm font-bold text-slate-700">
                  Diferenca maxima permitida
                  <input
                    type="range"
                    min="0"
                    max="4"
                    value={configuracao.diferenca_maxima_permitida}
                    onChange={(event) => onConfigurar({ diferenca_maxima_permitida: Number(event.target.value) })}
                    className="mt-2 w-full accent-teal-600"
                  />
                  <span className="mt-1 block text-slate-950">{configuracao.diferenca_maxima_permitida} lugares</span>
                </label>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-xl font-black text-slate-950">Funcionarios</h3>
              <div className="mt-4 space-y-2">
                {funcionarios.map((funcionario) => (
                  <div key={funcionario.id} className="rounded-lg bg-slate-50 p-3">
                    <p className="font-black text-slate-950">{funcionario.nome}</p>
                    <p className="text-sm font-semibold text-slate-500">{funcionario.cargo}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 text-sm font-bold text-slate-700">
      {label}
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-teal-600"
      />
    </label>
  )
}
