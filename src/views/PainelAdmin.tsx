import { useMemo, useState, type FormEvent } from 'react'
import { BadgeStatus } from '../components/BadgeStatus'
import { DashboardRelatorios } from '../components/DashboardRelatorios'
import type { ConfiguracoesFila, Funcionario, HistoricoAtendimento, Mesa, MesaStatus } from '../types/domain'

type MesaPayload = Pick<
  Mesa,
  | 'numero_mesa'
  | 'nome_ou_identificacao'
  | 'capacidade_maxima'
  | 'quantidade_ideal_pessoas'
  | 'status_atual'
  | 'setor_ou_area'
  | 'observacoes'
>

interface MesaFormState {
  numero_mesa: string
  nome_ou_identificacao: string
  capacidade_maxima: string
  quantidade_ideal_pessoas: string
  status_atual: MesaStatus
  setor_ou_area: string
  observacoes: string
}

interface PainelAdminProps {
  mesas: Mesa[]
  funcionarios: Funcionario[]
  configuracao: ConfiguracoesFila
  historico: HistoricoAtendimento[]
  onConfigurar: (patch: Partial<ConfiguracoesFila>) => void
  onAdicionarMesa: (payload: MesaPayload) => void
  onEditarMesa: (mesaId: string, payload: MesaPayload) => void
  onRemoverMesa: (mesaId: string) => void
}

const statusMesa: MesaStatus[] = [
  'livre',
  'ocupada',
  'conta solicitada',
  'em pagamento',
  'em preparo',
  'pronta',
  'reservada',
]

const formularioVazio: MesaFormState = {
  numero_mesa: '',
  nome_ou_identificacao: '',
  capacidade_maxima: '',
  quantidade_ideal_pessoas: '',
  status_atual: 'livre',
  setor_ou_area: '',
  observacoes: '',
}

export function PainelAdmin({
  mesas,
  funcionarios,
  configuracao,
  historico,
  onConfigurar,
  onAdicionarMesa,
  onEditarMesa,
  onRemoverMesa,
}: PainelAdminProps) {
  const linkClienteQr = `${window.location.origin}/#/cliente/rest-1`
  const [mesaEmEdicaoId, setMesaEmEdicaoId] = useState<string>()
  const [formulario, setFormulario] = useState<MesaFormState>(formularioVazio)
  const [erroFormulario, setErroFormulario] = useState('')
  const mesasOrdenadas = useMemo(
    () => [...mesas].sort((a, b) => a.numero_mesa - b.numero_mesa),
    [mesas],
  )

  function limparFormulario() {
    setMesaEmEdicaoId(undefined)
    setFormulario(formularioVazio)
    setErroFormulario('')
  }

  function carregarMesa(mesa: Mesa) {
    setMesaEmEdicaoId(mesa.id)
    setErroFormulario('')
    setFormulario({
      numero_mesa: String(mesa.numero_mesa),
      nome_ou_identificacao: mesa.nome_ou_identificacao,
      capacidade_maxima: String(mesa.capacidade_maxima),
      quantidade_ideal_pessoas: String(mesa.quantidade_ideal_pessoas),
      status_atual: mesa.status_atual,
      setor_ou_area: mesa.setor_ou_area,
      observacoes: mesa.observacoes,
    })
  }

  function removerMesa(mesa: Mesa) {
    const confirmar = window.confirm(`Excluir a Mesa ${mesa.numero_mesa}?`)

    if (!confirmar) return

    onRemoverMesa(mesa.id)
    if (mesaEmEdicaoId === mesa.id) limparFormulario()
  }

  function salvarMesa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const payload = montarPayloadMesa(formulario)
    if (!payload) {
      setErroFormulario('Preencha numero, identificacao, capacidade, quantidade ideal e setor.')
      return
    }

    if (mesaEmEdicaoId) {
      onEditarMesa(mesaEmEdicaoId, payload)
    } else {
      onAdicionarMesa(payload)
    }

    limparFormulario()
  }

  return (
    <main className="flex-1 bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Painel administrativo</p>
          <h2 className="mt-1 text-3xl font-black text-slate-950">Configuracoes e relatorios</h2>
        </section>

        <DashboardRelatorios historico={historico} />

        <section className="rounded-lg border border-teal-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-teal-700">QR Code do estabelecimento</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">Tela publica isolada do cliente</h3>
          <p className="mt-2 max-w-3xl text-sm font-semibold text-slate-600">
            Use este link para gerar o QR Code que fica na porta. Quem abrir esta URL ve apenas a tela do cliente,
            sem acesso aos paineis de recepcao, garcom ou administrador.
          </p>
          <div className="mt-4 flex flex-col gap-3 rounded-lg bg-slate-50 p-3 sm:flex-row sm:items-center">
            <code className="min-w-0 flex-1 overflow-x-auto rounded-lg bg-white px-3 py-3 text-sm font-bold text-slate-800 ring-1 ring-slate-200">
              {linkClienteQr}
            </code>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(linkClienteQr)}
              className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-black text-white"
            >
              Copiar link
            </button>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
          <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={salvarMesa}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-teal-700">
                  {mesaEmEdicaoId ? 'Editar mesa' : 'Cadastrar mesa'}
                </p>
                <h3 className="mt-1 text-xl font-black text-slate-950">Dados da mesa</h3>
              </div>
              <button
                type="button"
                onClick={limparFormulario}
                className="rounded-lg bg-slate-100 px-4 py-3 text-sm font-black text-slate-700"
              >
                Novo cadastro
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <CampoTexto
                label="Numero da mesa"
                type="number"
                value={formulario.numero_mesa}
                onChange={(value) => setFormulario((atual) => ({ ...atual, numero_mesa: value }))}
              />
              <CampoTexto
                label="Identificacao"
                value={formulario.nome_ou_identificacao}
                onChange={(value) => setFormulario((atual) => ({ ...atual, nome_ou_identificacao: value }))}
              />
              <CampoTexto
                label="Capacidade maxima"
                type="number"
                value={formulario.capacidade_maxima}
                onChange={(value) => setFormulario((atual) => ({ ...atual, capacidade_maxima: value }))}
              />
              <CampoTexto
                label="Quantidade ideal"
                type="number"
                value={formulario.quantidade_ideal_pessoas}
                onChange={(value) => setFormulario((atual) => ({ ...atual, quantidade_ideal_pessoas: value }))}
              />
              <label className="block text-sm font-bold text-slate-700">
                Status
                <select
                  value={formulario.status_atual}
                  onChange={(event) =>
                    setFormulario((atual) => ({ ...atual, status_atual: event.target.value as MesaStatus }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-slate-950 outline-none focus:border-teal-500"
                >
                  {statusMesa.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <CampoTexto
                label="Setor ou area"
                value={formulario.setor_ou_area}
                onChange={(value) => setFormulario((atual) => ({ ...atual, setor_ou_area: value }))}
              />
              <label className="block text-sm font-bold text-slate-700 sm:col-span-2">
                Observacoes
                <textarea
                  value={formulario.observacoes}
                  onChange={(event) => setFormulario((atual) => ({ ...atual, observacoes: event.target.value }))}
                  rows={3}
                  className="mt-1 w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-slate-950 outline-none focus:border-teal-500"
                />
              </label>
            </div>

            {erroFormulario && <p className="mt-3 text-sm font-black text-rose-700">{erroFormulario}</p>}

            <button
              type="submit"
              className="mt-5 w-full rounded-lg bg-teal-600 px-5 py-4 text-sm font-black text-white hover:bg-teal-700"
            >
              {mesaEmEdicaoId ? 'Salvar alteracoes' : 'Cadastrar mesa'}
            </button>
          </form>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-xl font-black text-slate-950">Mesas cadastradas</h3>
              <p className="text-sm font-bold text-slate-500">{mesasOrdenadas.length} mesas</p>
            </div>
            <div className="mt-4 overflow-x-auto">
              <div className="space-y-3">
                {mesasOrdenadas.map((mesa) => (
                  <article
                    key={mesa.id}
                    className="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-100"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-lg font-black text-slate-950">Mesa {mesa.numero_mesa}</h4>
                          <BadgeStatus status={mesa.status_atual} />
                        </div>
                        <p className="mt-1 text-sm font-bold text-slate-600">{mesa.nome_ou_identificacao}</p>
                        <div className="mt-3 grid gap-2 text-sm font-semibold text-slate-700 sm:grid-cols-4">
                          <span>Capacidade: {mesa.capacidade_maxima}</span>
                          <span>Ideal: {mesa.quantidade_ideal_pessoas}</span>
                          <span>Setor: {mesa.setor_ou_area}</span>
                          <span>{mesa.observacoes || 'Sem observacoes'}</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
                        <button
                          type="button"
                          onClick={() => carregarMesa(mesa)}
                          className="rounded-lg bg-white px-4 py-3 text-sm font-black text-slate-800 ring-1 ring-slate-200"
                        >
                          Editar mesa
                        </button>
                        <button
                          type="button"
                          onClick={() => removerMesa(mesa)}
                          className="rounded-lg bg-rose-600 px-4 py-3 text-sm font-black text-white hover:bg-rose-700"
                        >
                          Excluir mesa
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
                {mesasOrdenadas.length === 0 && (
                  <div className="rounded-lg bg-slate-50 px-3 py-8 text-center font-bold text-slate-500">
                    Nenhuma mesa cadastrada.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.8fr_1fr]">
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
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {funcionarios.map((funcionario) => (
                <div key={funcionario.id} className="rounded-lg bg-slate-50 p-3">
                  <p className="font-black text-slate-950">{funcionario.nome}</p>
                  <p className="text-sm font-semibold text-slate-500">{funcionario.cargo}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function montarPayloadMesa(formulario: MesaFormState): MesaPayload | undefined {
  const numeroMesa = Number(formulario.numero_mesa)
  const capacidadeMaxima = Number(formulario.capacidade_maxima)
  const quantidadeIdeal = Number(formulario.quantidade_ideal_pessoas)
  const identificacao = formulario.nome_ou_identificacao.trim()
  const setor = formulario.setor_ou_area.trim()

  if (!numeroMesa || !capacidadeMaxima || !quantidadeIdeal || !identificacao || !setor) {
    return undefined
  }

  return {
    numero_mesa: numeroMesa,
    nome_ou_identificacao: identificacao,
    capacidade_maxima: capacidadeMaxima,
    quantidade_ideal_pessoas: Math.min(quantidadeIdeal, capacidadeMaxima),
    status_atual: formulario.status_atual,
    setor_ou_area: setor,
    observacoes: formulario.observacoes.trim(),
  }
}

function CampoTexto({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'number'
}) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}
      <input
        type={type}
        min={type === 'number' ? '1' : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-3 text-slate-950 outline-none focus:border-teal-500"
      />
    </label>
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
