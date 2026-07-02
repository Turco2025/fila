import type {
  Chamado,
  ConfiguracoesFila,
  FilaCliente,
  HistoricoAtendimento,
  Mesa,
  MesaStatus,
} from '../types/domain'

export const TEMPO_LIMITE_CHAMADA_MS = 5 * 60 * 1000

export function adicionarClienteNaFila(
  clientes: FilaCliente[],
  payload: Pick<FilaCliente, 'nome_cliente' | 'whatsapp' | 'quantidade_pessoas' | 'observacoes'>,
  restauranteId: string,
): FilaCliente[] {
  const agora = new Date().toISOString()

  return [
    ...clientes,
    {
      id: crypto.randomUUID(),
      restaurante_id: restauranteId,
      status: 'aguardando',
      horario_entrada: agora,
      criado_em: agora,
      atualizado_em: agora,
      ...payload,
    },
  ]
}

export function calcularTempoEspera(horarioEntrada: string, referencia = new Date()): number {
  return Math.max(0, Math.floor((referencia.getTime() - new Date(horarioEntrada).getTime()) / 60_000))
}

export function calcularTempoRestanteChamada(
  horarioChamada: string | undefined,
  referencia = new Date(),
): number {
  if (!horarioChamada) return TEMPO_LIMITE_CHAMADA_MS

  const fimDaTolerancia = new Date(horarioChamada).getTime() + TEMPO_LIMITE_CHAMADA_MS
  return Math.max(0, fimDaTolerancia - referencia.getTime())
}

export function alterarStatusMesa(mesas: Mesa[], mesaId: string, status: MesaStatus): Mesa[] {
  return mesas.map((mesa) =>
    mesa.id === mesaId
      ? { ...mesa, status_atual: status, atualizado_em: new Date().toISOString() }
      : mesa,
  )
}

export function marcarMesaEmPreparo(mesas: Mesa[], mesaId: string): Mesa[] {
  return alterarStatusMesa(mesas, mesaId, 'em preparo')
}

export function marcarMesaPronta(
  mesas: Mesa[],
  mesaId: string,
  ideal: number,
  setor: string,
): Mesa[] {
  return mesas.map((mesa) =>
    mesa.id === mesaId
      ? {
          ...mesa,
          status_atual: 'pronta',
          quantidade_ideal_pessoas: ideal,
          setor_ou_area: setor,
          observacoes: `Mesa ${mesa.numero_mesa} pronta para ${ideal} pessoas.`,
          atualizado_em: new Date().toISOString(),
        }
      : mesa,
  )
}

export function configurarRegrasDeEncaixe(
  configuracao: ConfiguracoesFila,
  patch: Partial<ConfiguracoesFila>,
): ConfiguracoesFila {
  return { ...configuracao, ...patch }
}

export function sugerirClienteCompativel(
  mesa: Mesa,
  clientes: FilaCliente[],
  configuracao: ConfiguracoesFila,
): FilaCliente | undefined {
  const candidatos = clientes
    .filter((cliente) => cliente.status === 'aguardando')
    .filter((cliente) => cliente.quantidade_pessoas <= mesa.capacidade_maxima)
    .filter((cliente) => clienteCompativel(cliente.quantidade_pessoas, mesa.capacidade_maxima, configuracao))
    .map((cliente) => ({
      cliente,
      aproveitamento: cliente.quantidade_pessoas / mesa.capacidade_maxima,
      diferenca: mesa.capacidade_maxima - cliente.quantidade_pessoas,
      entrada: new Date(cliente.horario_entrada).getTime(),
    }))
    .sort((a, b) => {
      if (a.diferenca !== b.diferenca) return a.diferenca - b.diferenca
      if (b.aproveitamento !== a.aproveitamento) return b.aproveitamento - a.aproveitamento
      return a.entrada - b.entrada
    })

  return candidatos[0]?.cliente
}

export function chamarCliente(
  clientes: FilaCliente[],
  chamados: Chamado[],
  clienteId: string,
  mesa: Mesa,
  funcionarioRecepcaoId: string,
): { clientes: FilaCliente[]; chamados: Chamado[] } {
  const agora = new Date().toISOString()
  const cliente = clientes.find((item) => item.id === clienteId)

  if (!cliente) return { clientes, chamados }

  return {
    clientes: clientes.map((item) =>
      item.id === clienteId
        ? {
            ...item,
            status: 'chamado',
            horario_chamada: agora,
            mesa_destinada_id: mesa.id,
            numero_mesa_destinada: mesa.numero_mesa,
            atualizado_em: agora,
          }
        : item,
    ),
    chamados: [
      ...chamados,
      {
        id: crypto.randomUUID(),
        cliente_id: cliente.id,
        mesa_id: mesa.id,
        numero_mesa: mesa.numero_mesa,
        capacidade_mesa: mesa.capacidade_maxima,
        quantidade_pessoas_cliente: cliente.quantidade_pessoas,
        status_chamado: 'ativo',
        horario_chamada: agora,
        funcionario_recepcao_id: funcionarioRecepcaoId,
      },
    ],
  }
}

export function confirmarChegadaCliente(
  clientes: FilaCliente[],
  chamados: Chamado[],
  clienteId: string,
): { clientes: FilaCliente[]; chamados: Chamado[] } {
  const agora = new Date().toISOString()

  return {
    clientes: clientes.map((cliente) =>
      cliente.id === clienteId
        ? { ...cliente, status: 'chegou', horario_chegada_recepcao: agora, atualizado_em: agora }
        : cliente,
    ),
    chamados: chamados.map((chamado) =>
      chamado.cliente_id === clienteId
        ? { ...chamado, status_chamado: 'confirmado', horario_confirmacao: agora }
        : chamado,
    ),
  }
}

export function direcionarClienteParaMesa(
  clientes: FilaCliente[],
  clienteId: string,
  mesa: Mesa,
): FilaCliente[] {
  const agora = new Date().toISOString()

  return clientes.map((cliente) =>
    cliente.id === clienteId
      ? {
          ...cliente,
          mesa_destinada_id: mesa.id,
          numero_mesa_destinada: mesa.numero_mesa,
          atualizado_em: agora,
        }
      : cliente,
  )
}

export function confirmarClienteSentado(
  clientes: FilaCliente[],
  mesas: Mesa[],
  chamados: Chamado[],
  historico: HistoricoAtendimento[],
  clienteId: string,
  mesaId: string,
  garcomId: string,
): {
  clientes: FilaCliente[]
  mesas: Mesa[]
  chamados: Chamado[]
  historico: HistoricoAtendimento[]
} {
  const cliente = clientes.find((item) => item.id === clienteId)
  const mesa = mesas.find((item) => item.id === mesaId)

  if (!cliente || !mesa) return { clientes, mesas, chamados, historico }

  const agora = new Date().toISOString()
  const chamado = chamados.find((item) => item.cliente_id === clienteId && item.mesa_id === mesaId)

  return {
    clientes: removerClienteDaFila(clientes, clienteId),
    mesas: alterarStatusMesa(mesas, mesaId, 'ocupada'),
    chamados: chamados.map((item) =>
      item.id === chamado?.id ? { ...item, status_chamado: 'sentado', garcom_id: garcomId } : item,
    ),
    historico: registrarHistoricoAtendimento(historico, cliente, mesa, chamado?.horario_chamada ?? agora, agora),
  }
}

export function removerClienteDaFila(clientes: FilaCliente[], clienteId: string): FilaCliente[] {
  return clientes.filter((cliente) => cliente.id !== clienteId)
}

export function registrarHistoricoAtendimento(
  historico: HistoricoAtendimento[],
  cliente: FilaCliente,
  mesa: Mesa,
  horarioChamada: string,
  horarioSentou: string,
): HistoricoAtendimento[] {
  return [
    ...historico,
    {
      id: crypto.randomUUID(),
      cliente_id: cliente.id,
      mesa_id: mesa.id,
      numero_mesa: mesa.numero_mesa,
      quantidade_pessoas: cliente.quantidade_pessoas,
      horario_entrada_fila: cliente.horario_entrada,
      horario_chamada: horarioChamada,
      horario_sentou: horarioSentou,
      tempo_total_espera: calcularTempoEspera(cliente.horario_entrada, new Date(horarioSentou)),
      status_final: 'atendido',
    },
  ]
}

export function clienteCompativel(
  quantidadePessoas: number,
  capacidadeMesa: number,
  configuracao: ConfiguracoesFila,
): boolean {
  if (quantidadePessoas > capacidadeMesa) return false
  if (quantidadePessoas === capacidadeMesa) return true

  const diferenca = capacidadeMesa - quantidadePessoas
  if (diferenca > configuracao.diferenca_maxima_permitida) return false

  if (capacidadeMesa === 4 && quantidadePessoas === 2) return configuracao.permitir_2_em_4
  if (capacidadeMesa === 6 && quantidadePessoas === 4) return configuracao.permitir_4_em_6
  if (capacidadeMesa === 8 && quantidadePessoas === 6) return configuracao.permitir_6_em_8

  return configuracao.aceitar_grupos_menores_em_mesas_maiores
}
