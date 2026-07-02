export type Perfil = 'cliente' | 'recepcao' | 'garcom' | 'admin'

export type MesaStatus =
  | 'livre'
  | 'ocupada'
  | 'conta solicitada'
  | 'em pagamento'
  | 'em preparo'
  | 'pronta'
  | 'reservada'

export type ClienteStatus =
  | 'aguardando'
  | 'chamado'
  | 'chegou'
  | 'sentado'
  | 'ausente'
  | 'cancelado'

export type StatusChamado = 'ativo' | 'confirmado' | 'sentado' | 'cancelado'

export interface Restaurante {
  id: string
  nome: string
  cidade: string
}

export interface Usuario {
  id: string
  nome: string
  perfil: Perfil
}

export interface Funcionario {
  id: string
  restaurante_id: string
  nome: string
  cargo: 'recepcao' | 'garcom' | 'admin'
  permissoes: string[]
}

export interface Mesa {
  id: string
  restaurante_id: string
  numero_mesa: number
  nome_ou_identificacao: string
  capacidade_maxima: number
  quantidade_ideal_pessoas: number
  status_atual: MesaStatus
  setor_ou_area: string
  observacoes: string
  criado_em: string
  atualizado_em: string
}

export interface FilaCliente {
  id: string
  restaurante_id: string
  nome_cliente: string
  whatsapp: string
  quantidade_pessoas: number
  observacoes: string
  status: ClienteStatus
  horario_entrada: string
  horario_chamada?: string
  horario_chegada_recepcao?: string
  mesa_destinada_id?: string
  numero_mesa_destinada?: number
  criado_em: string
  atualizado_em: string
}

export interface Chamado {
  id: string
  cliente_id: string
  mesa_id: string
  numero_mesa: number
  capacidade_mesa: number
  quantidade_pessoas_cliente: number
  status_chamado: StatusChamado
  horario_chamada: string
  horario_confirmacao?: string
  funcionario_recepcao_id: string
  garcom_id?: string
}

export interface ConfiguracoesFila {
  id: string
  restaurante_id: string
  permitir_2_em_4: boolean
  permitir_4_em_6: boolean
  permitir_6_em_8: boolean
  diferenca_maxima_permitida: number
  aceitar_grupos_menores_em_mesas_maiores: boolean
}

export interface HistoricoAtendimento {
  id: string
  cliente_id: string
  mesa_id: string
  numero_mesa: number
  quantidade_pessoas: number
  horario_entrada_fila: string
  horario_chamada: string
  horario_sentou: string
  tempo_total_espera: number
  status_final: 'atendido' | 'ausente' | 'cancelado'
}

export interface RelatorioResumo {
  tempoMedioEspera: number
  clientesAtendidos: number
  clientesAusentes: number
  mesaMaisUtilizada: string
  horarioMaiorMovimento: string
}
