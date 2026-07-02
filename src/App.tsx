import { useMemo, useState } from 'react'
import { Header } from './components/Header'
import { ModalChamarCliente } from './components/ModalChamarCliente'
import { ModalMesaPronta } from './components/ModalMesaPronta'
import { Sidebar } from './components/Sidebar'
import {
  chamadosMock,
  configuracoesFilaMock,
  filaClientesMock,
  funcionariosMock,
  historicoMock,
  mesasMock,
  restauranteMock,
} from './data/mockData'
import {
  adicionarClienteNaFila,
  alterarStatusMesa,
  chamarCliente,
  configurarRegrasDeEncaixe,
  confirmarChegadaCliente,
  confirmarClienteSentado,
  direcionarClienteParaMesa,
  marcarMesaEmPreparo,
  marcarMesaPronta,
  removerClienteDaFila,
  sugerirClienteCompativel,
} from './services/queue'
import { enviarPushMesaPronta } from './services/pushNotifications'
import type { Chamado, ConfiguracoesFila, FilaCliente, HistoricoAtendimento, Mesa, MesaStatus, Perfil } from './types/domain'
import { PainelAdmin } from './views/PainelAdmin'
import { PainelGarcom } from './views/PainelGarcom'
import { PainelRecepcao } from './views/PainelRecepcao'
import { TelaClienteQRCode } from './views/TelaClienteQRCode'

interface ChamadaPendente {
  cliente: FilaCliente
  mesa: Mesa
}

function App() {
  const [perfil, setPerfil] = useState<Perfil>('recepcao')
  const [clientes, setClientes] = useState<FilaCliente[]>(filaClientesMock)
  const [mesas, setMesas] = useState<Mesa[]>(mesasMock)
  const [chamados, setChamados] = useState<Chamado[]>(chamadosMock)
  const [configuracao, setConfiguracao] = useState<ConfiguracoesFila>(configuracoesFilaMock)
  const [historico, setHistorico] = useState<HistoricoAtendimento[]>(historicoMock)
  const [clienteAtualId, setClienteAtualId] = useState<string>()
  const [chamadaPendente, setChamadaPendente] = useState<ChamadaPendente>()
  const [mesaPronta, setMesaPronta] = useState<Mesa>()

  const clienteAtual = useMemo(
    () => clientes.find((cliente) => cliente.id === clienteAtualId),
    [clienteAtualId, clientes],
  )
  const telaPublicaCliente = isTelaPublicaCliente()

  function handleAdicionarCliente(payload: Pick<FilaCliente, 'nome_cliente' | 'whatsapp' | 'quantidade_pessoas' | 'observacoes'>) {
    const proximaFila = adicionarClienteNaFila(clientes, payload, restauranteMock.id)
    const novoCliente = proximaFila.at(-1)
    setClientes(proximaFila)
    setClienteAtualId(novoCliente?.id)
  }

  function handleChamar(cliente: FilaCliente, mesa: Mesa) {
    setChamadaPendente({ cliente, mesa })
  }

  async function confirmarChamada() {
    if (!chamadaPendente) return

    const resultado = chamarCliente(
      direcionarClienteParaMesa(clientes, chamadaPendente.cliente.id, chamadaPendente.mesa),
      chamados,
      chamadaPendente.cliente.id,
      chamadaPendente.mesa,
      'func-rec-1',
    )

    setClientes(resultado.clientes)
    setChamados(resultado.chamados)
    setClienteAtualId(chamadaPendente.cliente.id)
    setChamadaPendente(undefined)

    try {
      await enviarPushMesaPronta(chamadaPendente.cliente.id, chamadaPendente.mesa)
    } catch (error) {
      console.warn('Push notification indisponivel no momento.', error)
    }
  }

  function handleChegada(cliente: FilaCliente) {
    const resultado = confirmarChegadaCliente(clientes, chamados, cliente.id)
    setClientes(resultado.clientes)
    setChamados(resultado.chamados)
  }

  function handleStatusCliente(cliente: FilaCliente, status: FilaCliente['status']) {
    setClientes((atuais) =>
      atuais.map((item) =>
        item.id === cliente.id ? { ...item, status, atualizado_em: new Date().toISOString() } : item,
      ),
    )
  }

  function handleExcluirCliente(cliente: FilaCliente) {
    setClientes((atuais) => removerClienteDaFila(atuais, cliente.id))
    setChamados((atuais) => atuais.filter((chamado) => chamado.cliente_id !== cliente.id))
    if (clienteAtualId === cliente.id) setClienteAtualId(undefined)
  }

  function handleSentarCliente(mesa: Mesa) {
    const clienteChamado =
      clientes.find((cliente) => cliente.mesa_destinada_id === mesa.id && cliente.status === 'chegou') ??
      clientes.find((cliente) => cliente.mesa_destinada_id === mesa.id && cliente.status === 'chamado') ??
      sugerirClienteCompativel(mesa, clientes, configuracao)

    if (!clienteChamado) return

    const resultado = confirmarClienteSentado(
      direcionarClienteParaMesa(clientes, clienteChamado.id, mesa),
      mesas,
      chamados,
      historico,
      clienteChamado.id,
      mesa.id,
      'func-gar-1',
    )

    setClientes(resultado.clientes)
    setMesas(resultado.mesas)
    setChamados(resultado.chamados)
    setHistorico(resultado.historico)
    if (clienteAtualId === clienteChamado.id) setClienteAtualId(undefined)
  }

  function handlePrepararMesa(mesa: Mesa) {
    setMesas((atuais) => marcarMesaEmPreparo(atuais, mesa.id))
  }

  function handleMesaPronta(ideal: number, setor: string) {
    if (!mesaPronta) return
    setMesas((atuais) => marcarMesaPronta(atuais, mesaPronta.id, ideal, setor))
    setMesaPronta(undefined)
    setPerfil('recepcao')
  }

  function handleAlterarStatusMesa(mesa: Mesa, status: MesaStatus) {
    setMesas((atuais) => alterarStatusMesa(atuais, mesa.id, status))
  }

  function handleAdicionarMesa(
    payload: Pick<
      Mesa,
      | 'numero_mesa'
      | 'nome_ou_identificacao'
      | 'capacidade_maxima'
      | 'quantidade_ideal_pessoas'
      | 'status_atual'
      | 'setor_ou_area'
      | 'observacoes'
    >,
  ) {
    const agora = new Date().toISOString()

    setMesas((atuais) =>
      [
        ...atuais,
        {
          id: crypto.randomUUID(),
          restaurante_id: restauranteMock.id,
          criado_em: agora,
          atualizado_em: agora,
          ...payload,
        },
      ].sort((a, b) => a.numero_mesa - b.numero_mesa),
    )
  }

  function handleEditarMesa(
    mesaId: string,
    payload: Pick<
      Mesa,
      | 'numero_mesa'
      | 'nome_ou_identificacao'
      | 'capacidade_maxima'
      | 'quantidade_ideal_pessoas'
      | 'status_atual'
      | 'setor_ou_area'
      | 'observacoes'
    >,
  ) {
    const agora = new Date().toISOString()

    setMesas((atuais) =>
      atuais
        .map((mesa) => (mesa.id === mesaId ? { ...mesa, ...payload, atualizado_em: agora } : mesa))
        .sort((a, b) => a.numero_mesa - b.numero_mesa),
    )
  }

  function handleRemoverMesa(mesaId: string) {
    setMesas((atuais) => atuais.filter((mesa) => mesa.id !== mesaId))
    setChamados((atuais) => atuais.filter((chamado) => chamado.mesa_id !== mesaId))
    setClientes((atuais) =>
      atuais.map((cliente) =>
        cliente.mesa_destinada_id === mesaId
          ? {
              ...cliente,
              mesa_destinada_id: undefined,
              numero_mesa_destinada: undefined,
              atualizado_em: new Date().toISOString(),
            }
          : cliente,
      ),
    )
    if (mesaPronta?.id === mesaId) setMesaPronta(undefined)
  }

  function renderPerfil() {
    if (perfil === 'cliente') {
      return (
        <TelaClienteQRCode
          restaurante={restauranteMock}
          clienteAtual={clienteAtual}
          onAdicionar={handleAdicionarCliente}
        />
      )
    }

    const conteudo =
      perfil === 'recepcao' ? (
        <PainelRecepcao
          clientes={clientes}
          mesas={mesas}
          configuracao={configuracao}
          onChamar={handleChamar}
          onChegou={handleChegada}
          onAusente={(cliente) => handleStatusCliente(cliente, 'ausente')}
          onCancelar={(cliente) => handleStatusCliente(cliente, 'cancelado')}
          onExcluir={handleExcluirCliente}
        />
      ) : perfil === 'garcom' ? (
        <PainelGarcom
          mesas={mesas}
          clientes={clientes}
          configuracao={configuracao}
          onStatus={handleAlterarStatusMesa}
          onPreparar={handlePrepararMesa}
          onPronta={setMesaPronta}
          onSentar={handleSentarCliente}
        />
      ) : (
        <PainelAdmin
          mesas={mesas}
          funcionarios={funcionariosMock}
          configuracao={configuracao}
          historico={historico}
          onConfigurar={(patch) => setConfiguracao((atual) => configurarRegrasDeEncaixe(atual, patch))}
          onAdicionarMesa={handleAdicionarMesa}
          onEditarMesa={handleEditarMesa}
          onRemoverMesa={handleRemoverMesa}
        />
      )

    return (
      <div className="flex min-h-[calc(100svh-81px)]">
        <Sidebar />
        {conteudo}
      </div>
    )
  }

  return (
    <>
      {telaPublicaCliente ? (
        <TelaClienteQRCode
          restaurante={restauranteMock}
          clienteAtual={clienteAtual}
          onAdicionar={handleAdicionarCliente}
        />
      ) : (
        <>
          <Header active={perfil} onChange={setPerfil} />
          {renderPerfil()}
        </>
      )}
      {chamadaPendente && (
        <ModalChamarCliente
          cliente={chamadaPendente.cliente}
          mesa={chamadaPendente.mesa}
          onConfirm={confirmarChamada}
          onClose={() => setChamadaPendente(undefined)}
        />
      )}
      {mesaPronta && (
        <ModalMesaPronta
          mesa={mesaPronta}
          onConfirm={handleMesaPronta}
          onClose={() => setMesaPronta(undefined)}
        />
      )}
    </>
  )
}

function isTelaPublicaCliente(): boolean {
  const params = new URLSearchParams(window.location.search)

  return (
    window.location.hash.startsWith('#/cliente') ||
    window.location.pathname.startsWith('/cliente') ||
    params.get('view') === 'cliente'
  )
}

export default App
