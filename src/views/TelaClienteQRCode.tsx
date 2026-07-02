import { useEffect, useMemo, useState } from 'react'
import { BellRing, CheckCircle2, LoaderCircle, MessageCircle, QrCode, TimerReset, UsersRound } from 'lucide-react'
import type { FilaCliente, Restaurante } from '../types/domain'
import { BadgeStatus } from '../components/BadgeStatus'
import { calcularTempoEspera, calcularTempoRestanteChamada } from '../services/queue'
import { ativarPushNotifications, type PushStatus } from '../services/pushNotifications'

interface TelaClienteQRCodeProps {
  restaurante: Restaurante
  clienteAtual?: FilaCliente
  onAdicionar: (payload: Pick<FilaCliente, 'nome_cliente' | 'whatsapp' | 'quantidade_pessoas' | 'observacoes'>) => void
}

export function TelaClienteQRCode({ restaurante, clienteAtual, onAdicionar }: TelaClienteQRCodeProps) {
  const [nome, setNome] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [quantidade, setQuantidade] = useState(2)
  const [observacoes, setObservacoes] = useState('')
  const [pushStatus, setPushStatus] = useState<PushStatus>('default')
  const [pushError, setPushError] = useState('')
  const [agora, setAgora] = useState(() => new Date())
  const mostrarTimerChamada = clienteAtual?.status === 'chamado' && clienteAtual.horario_chamada
  const tempoRestanteChamada = useMemo(
    () => calcularTempoRestanteChamada(clienteAtual?.horario_chamada, agora),
    [agora, clienteAtual?.horario_chamada],
  )
  const chamadaExpirada = mostrarTimerChamada && tempoRestanteChamada === 0

  useEffect(() => {
    if (!mostrarTimerChamada) return undefined

    const intervalId = window.setInterval(() => setAgora(new Date()), 1000)
    return () => window.clearInterval(intervalId)
  }, [mostrarTimerChamada])

  async function handleAtivarPush() {
    if (!clienteAtual) return

    setPushStatus('requesting')
    setPushError('')

    try {
      setPushStatus(await ativarPushNotifications(clienteAtual.id))
    } catch (error) {
      setPushStatus('error')
      setPushError(error instanceof Error ? error.message : 'Nao foi possivel ativar push notification.')
    }
  }

  return (
    <main className="bg-[radial-gradient(circle_at_top_left,#ccfbf1,transparent_34%),linear-gradient(135deg,#f8fafc,#ffffff_45%,#eef2ff)]">
      <div className="mx-auto grid min-h-[calc(100svh-80px)] max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <section className="py-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-teal-800 ring-1 ring-teal-100">
            <QrCode size={17} aria-hidden="true" />
            Acesso sem aplicativo
          </div>
          <h2 className="mt-5 max-w-xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
            Entre na fila digital da {restaurante.nome}
          </h2>
          <p className="mt-4 max-w-lg text-lg font-medium text-slate-600">
            Cadastro rapido, acompanhamento em tempo real e chamada na tela quando a mesa estiver pronta.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {['QR Code', 'WhatsApp futuro', 'Sem download'].map((item) => (
              <div key={item} className="rounded-lg bg-white/80 p-4 shadow-sm ring-1 ring-slate-200">
                <CheckCircle2 size={22} className="text-teal-700" aria-hidden="true" />
                <p className="mt-2 text-sm font-black text-slate-800">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-200 sm:p-6">
          {clienteAtual ? (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Status da espera</p>
                  <h3 className="mt-1 text-3xl font-black text-slate-950">{clienteAtual.nome_cliente}</h3>
                </div>
                <BadgeStatus status={clienteAtual.status} />
              </div>
              <div className="mt-5 rounded-lg bg-slate-950 p-5 text-white">
                <p className="text-sm font-bold text-slate-300">Mensagem para o cliente</p>
                <p className="mt-2 text-2xl font-black">
                  {clienteAtual.status === 'chamado'
                    ? 'Sua mesa esta pronta. Dirija-se a recepcao.'
                    : 'Voce esta aguardando ser chamado.'}
                </p>
              </div>
              {mostrarTimerChamada && (
                <div
                  className={`mt-4 rounded-lg p-4 ring-1 ${
                    chamadaExpirada
                      ? 'bg-rose-50 text-rose-950 ring-rose-100'
                      : 'bg-sky-50 text-sky-950 ring-sky-100'
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide">
                        <TimerReset size={18} aria-hidden="true" />
                        Tempo para chegar
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {chamadaExpirada
                          ? 'Nao conseguimos encontrar voce a tempo, entao liberamos a mesa para o proximo cliente. Para tentar novamente, entre na fila outra vez.'
                          : 'Va ate a recepcao antes do timer zerar.'}
                      </p>
                    </div>
                    <span className="rounded-lg bg-white px-5 py-3 text-3xl font-black tabular-nums text-slate-950">
                      {formatarTempo(tempoRestanteChamada)}
                    </span>
                  </div>
                </div>
              )}
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Info label="Grupo" value={`${clienteAtual.quantidade_pessoas} pessoas`} />
                <Info label="Espera" value={`${calcularTempoEspera(clienteAtual.horario_entrada)} min`} />
                <Info label="Mesa" value={clienteAtual.numero_mesa_destinada ? `Mesa ${clienteAtual.numero_mesa_destinada}` : 'A definir'} />
              </div>
              <div className="mt-4 rounded-lg border border-teal-100 bg-teal-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-teal-950">Push notification</p>
                    <p className="mt-1 text-sm font-semibold text-teal-800">
                      {pushStatus === 'subscribed'
                        ? 'Ativado. Voce sera avisado mesmo se a aba ficar em segundo plano.'
                        : pushStatus === 'denied'
                          ? 'Permissao bloqueada no navegador.'
                          : pushStatus === 'unsupported'
                            ? 'Este navegador nao suporta Web Push.'
                            : 'Ative para receber o aviso quando a mesa estiver pronta.'}
                    </p>
                    {pushError && <p className="mt-1 text-sm font-bold text-rose-700">{pushError}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={handleAtivarPush}
                    disabled={pushStatus === 'requesting' || pushStatus === 'subscribed'}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 text-sm font-black text-white disabled:bg-teal-700"
                  >
                    {pushStatus === 'requesting' ? (
                      <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
                    ) : (
                      <BellRing size={17} aria-hidden="true" />
                    )}
                    {pushStatus === 'subscribed' ? 'Push ativado' : 'Ativar push'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault()
                if (!nome.trim() || !whatsapp.trim()) return
                onAdicionar({
                  nome_cliente: nome,
                  whatsapp,
                  quantidade_pessoas: quantidade,
                  observacoes,
                })
              }}
            >
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Cadastro rapido</p>
                <h3 className="mt-1 text-3xl font-black text-slate-950">Entrar na fila</h3>
              </div>
              <label className="block text-sm font-bold text-slate-700">
                Nome
                <input
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-4 text-base text-slate-950 outline-none focus:border-teal-500"
                  placeholder="Ex.: Joao Martins"
                />
              </label>
              <label className="block text-sm font-bold text-slate-700">
                WhatsApp
                <div className="mt-1 flex items-center rounded-lg border border-slate-200 px-4 py-1 focus-within:border-teal-500">
                  <MessageCircle size={18} className="text-slate-400" aria-hidden="true" />
                  <input
                    value={whatsapp}
                    onChange={(event) => setWhatsapp(event.target.value)}
                    className="w-full px-3 py-3 text-base text-slate-950 outline-none"
                    placeholder="(11) 99999-0000"
                  />
                </div>
              </label>
              <label className="block text-sm font-bold text-slate-700">
                Quantidade de pessoas
                <div className="mt-1 flex items-center rounded-lg border border-slate-200 px-4 py-1 focus-within:border-teal-500">
                  <UsersRound size={18} className="text-slate-400" aria-hidden="true" />
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={quantidade}
                    onChange={(event) => setQuantidade(Number(event.target.value))}
                    className="w-full px-3 py-3 text-base text-slate-950 outline-none"
                  />
                </div>
              </label>
              <label className="block text-sm font-bold text-slate-700">
                Observacoes
                <textarea
                  value={observacoes}
                  onChange={(event) => setObservacoes(event.target.value)}
                  rows={3}
                  className="mt-1 w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-base text-slate-950 outline-none focus:border-teal-500"
                  placeholder="Crianca, cadeirante, carrinho de bebe, area interna..."
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-lg bg-teal-600 px-5 py-4 text-base font-black text-white hover:bg-teal-700"
              >
                Entrar na fila agora
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  )
}

function formatarTempo(milissegundos: number): string {
  const totalSegundos = Math.ceil(milissegundos / 1000)
  const minutos = Math.floor(totalSegundos / 60)
  const segundos = totalSegundos % 60

  return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
    </div>
  )
}
