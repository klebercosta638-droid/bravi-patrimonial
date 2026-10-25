export type Filial =
  | 'Matriz Recife - 19.457.137/0001-06'
  | 'Filial Paraíba - 19.457.137/0003-60'
  | 'Filial Natal - 19.457.137/0002-89';

export type CentroDeCusto =
  | 'Patrimonio REC'
  | 'Patrimonio PB'
  | 'Patrimonio RN';

export type Categoria =
  | 'Manutenção Predial'
  | 'Manutenção de Equipamentos'
  | 'Compra de Suprimentos'
  | 'Ativos de TI & Hardware'
  | 'Serviços Terceirizados'
  | 'Reformas & Adequações'
  | 'Serviços Logísticos / Veículos';

export type Urgencia =
  | 'Baixa - Até 7 dias'
  | 'Média - Até 5 dias'
  | 'Alta - Até 3 dias'
  | 'Crítica/Emergencial - Até 1 dia';

export type StatusChamado =
  | 'Rascunho'
  | 'Pendente de Aprovação'
  | 'Aprovado - Em Cotação'
  | 'Em Execução'
  | 'Concluído'
  | 'Rejeitado'
  | 'Cancelado';

export interface ItemChamado {
  id: string;
  codigo: string;
  descricao: string;
  unidade: 'UN' | 'M²' | 'KG' | 'HORAS' | 'SERV' | 'CX' | 'PCT';
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export type EtapaAssinatura =
  | 'Solicitante'
  | 'Gestor da Área'
  | 'Diretoria Financeira'
  | 'Controle Patrimonial';

export interface AssinaturaRoteiro {
  id: string;
  etapa: EtapaAssinatura;
  nomeResponsavel: string;
  cargo: string;
  status: 'Aprovado' | 'Pendente' | 'Rejeitado' | 'Aguardando';
  dataAssinatura?: string;
  observacao?: string;
  rubricaCodigo?: string;
}

export interface HistoricoEvento {
  id: string;
  dataHora: string;
  usuario: string;
  cargo: string;
  acao: string;
  comentario?: string;
  tipo: 'criacao' | 'aprovacao' | 'rejeicao' | 'edicao' | 'status' | 'conclusao';
}

export interface Chamado {
  id: string; // Ex: ORC-420
  titulo: string;
  filial: Filial;
  centroDeCusto: CentroDeCusto;
  categoria: Categoria;
  placaVeiculo?: string;
  tipoVeiculo?: string;
  condutorVeiculo?: string;
  urgencia: Urgencia;
  status: StatusChamado;
  
  // Solicitante
  solicitanteNome: string;
  solicitanteEmail: string;
  solicitanteCargo: string;
  solicitanteRamal: string;
  solicitanteTelefone?: string;
  dataAbertura: string;
  previsaoConclusao: string;
  
  // Financeiro & Fornecedor
  fornecedorSugerido: string;
  cnpjFornecedor?: string;
  formaPagamento: string;
  prazoFaturamento?: string;
  parcelasCartao?: number;
  limiteOrcamentario: number;
  justificativa: string;
  observacoesInternas?: string;
  
  // Itens & Valores
  itens: ItemChamado[];
  valorTotalGeral: number;
  
  // Roteiro & Auditoria
  roteiroAssinaturas: AssinaturaRoteiro[];
  historico: HistoricoEvento[];
  
  // Anexos
  anexos?: {
    id: string;
    nome: string;
    tamanho: string;
    tipo: string;
    dataUpload: string;
  }[];
}

export interface FiltrosChamado {
  busca: string;
  filial: string;
  status: string;
  categoria: string;
  urgencia: string;
}
