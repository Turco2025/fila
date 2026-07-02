import type {
  Chamado,
  ConfiguracoesFila,
  FilaCliente,
  Funcionario,
  HistoricoAtendimento,
  Mesa,
  Restaurante,
} from '../types/domain'

const now = Date.now()
const minutesAgo = (minutes: number) => new Date(now - minutes * 60_000).toISOString()

export const restauranteMock: Restaurante = {
  id: 'rest-1',
  nome: 'Casa Aurora',
  cidade: 'Sao Paulo',
}

export const funcionariosMock: Funcionario[] = [
  {
    id: 'func-rec-1',
    restaurante_id: restauranteMock.id,
    nome: 'Marina',
    cargo: 'recepcao',
    permissoes: ['fila:ler', 'fila:chamar', 'fila:direcionar'],
  },
  {
    id: 'func-gar-1',
    restaurante_id: restauranteMock.id,
    nome: 'Caio',
    cargo: 'garcom',
    permissoes: ['mesas:alterar', 'clientes:sentar'],
  },
  {
    id: 'func-adm-1',
    restaurante_id: restauranteMock.id,
    nome: 'Renata',
    cargo: 'admin',
    permissoes: ['admin:tudo'],
  },
]

export const mesasMock: Mesa[] = [
  mesa(1, 2, 2, 'livre', 'Varanda'),
  mesa(2, 2, 2, 'ocupada', 'Salao'),
  mesa(3, 4, 4, 'pronta', 'Salao', 'Mesa 3 pronta para 4 pessoas.'),
  mesa(4, 4, 4, 'em preparo', 'Salao'),
  mesa(5, 4, 3, 'conta solicitada', 'Jardim'),
  mesa(6, 6, 6, 'em pagamento', 'Jardim'),
  mesa(7, 2, 2, 'pronta', 'Balcao', 'Mesa 7 pronta para 2 pessoas.'),
  mesa(8, 8, 8, 'reservada', 'Salao superior'),
  mesa(9, 6, 5, 'livre', 'Salao superior'),
  mesa(10, 4, 4, 'ocupada', 'Varanda'),
]

export const filaClientesMock: FilaCliente[] = [
  cliente('cli-1', 'Joao Martins', '11999990001', 4, 'Prefere area interna', 28),
  cliente('cli-2', 'Camila Nunes', '11999990002', 2, 'Carrinho de bebe', 23),
  cliente('cli-3', 'Bruno e familia', '11999990003', 6, 'Crianca pequena', 21),
  cliente('cli-4', 'Lara Costa', '11999990004', 3, 'Area externa se possivel', 18),
  cliente('cli-5', 'Rafael Lima', '11999990005', 2, 'Cadeirante', 14),
  cliente('cli-6', 'Patricia Rocha', '11999990006', 5, '', 11),
  cliente('cli-7', 'Mesa da Ana', '11999990007', 8, 'Aniversario', 7),
]

export const chamadosMock: Chamado[] = []

export const configuracoesFilaMock: ConfiguracoesFila = {
  id: 'conf-1',
  restaurante_id: restauranteMock.id,
  permitir_2_em_4: true,
  permitir_4_em_6: true,
  permitir_6_em_8: false,
  diferenca_maxima_permitida: 2,
  aceitar_grupos_menores_em_mesas_maiores: true,
}

export const historicoMock: HistoricoAtendimento[] = [
  historico('hist-1', 'Mesa 3', 4, 34),
  historico('hist-2', 'Mesa 7', 2, 16),
  historico('hist-3', 'Mesa 1', 2, 12),
  historico('hist-4', 'Mesa 6', 6, 41),
]

function mesa(
  numero: number,
  capacidade: number,
  ideal: number,
  status: Mesa['status_atual'],
  setor: string,
  observacoes = '',
): Mesa {
  return {
    id: `mesa-${numero}`,
    restaurante_id: restauranteMock.id,
    numero_mesa: numero,
    nome_ou_identificacao: `Mesa ${numero}`,
    capacidade_maxima: capacidade,
    quantidade_ideal_pessoas: ideal,
    status_atual: status,
    setor_ou_area: setor,
    observacoes,
    criado_em: minutesAgo(240),
    atualizado_em: minutesAgo(status === 'pronta' ? 2 : 20),
  }
}

function cliente(
  id: string,
  nome: string,
  whatsapp: string,
  quantidade: number,
  observacoes: string,
  esperaMinutos: number,
): FilaCliente {
  const horario = minutesAgo(esperaMinutos)

  return {
    id,
    restaurante_id: restauranteMock.id,
    nome_cliente: nome,
    whatsapp,
    quantidade_pessoas: quantidade,
    observacoes,
    status: 'aguardando',
    horario_entrada: horario,
    criado_em: horario,
    atualizado_em: horario,
  }
}

function historico(
  id: string,
  mesaNome: string,
  pessoas: number,
  espera: number,
): HistoricoAtendimento {
  const numero = Number(mesaNome.replace('Mesa ', ''))

  return {
    id,
    cliente_id: `cliente-${id}`,
    mesa_id: `mesa-${numero}`,
    numero_mesa: numero,
    quantidade_pessoas: pessoas,
    horario_entrada_fila: minutesAgo(espera + 90),
    horario_chamada: minutesAgo(90),
    horario_sentou: minutesAgo(88),
    tempo_total_espera: espera,
    status_final: 'atendido',
  }
}
