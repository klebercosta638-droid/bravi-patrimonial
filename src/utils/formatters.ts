import { Urgencia } from '../types/patrimonial';

export const formatCurrency = (val: number | undefined | null): string => {
  if (val === undefined || val === null || isNaN(val)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(val);
};

export const correspondeAoPeriodoAbertura = (
  dataAbertura: string,
  ano: string,
  mes: string
): boolean => {
  if (ano === 'todos' && mes === 'todos') return true;
  if (!/^\d{4}-\d{2}/.test(dataAbertura)) return false;
  const [anoAbertura, mesAbertura] = dataAbertura.slice(0, 7).split('-');
  return (ano === 'todos' || anoAbertura === ano) && (mes === 'todos' || mesAbertura === mes);
};

const PRAZOS_URGENCIA: Record<Urgencia, number> = {
  'Baixa - Até 7 dias': 7,
  'Média - Até 5 dias': 5,
  'Alta - Até 3 dias': 3,
  'Crítica/Emergencial - Até 1 dia': 1,
};

export const getPrazoAtendimentoDias = (urgencia: Urgencia): number =>
  PRAZOS_URGENCIA[urgencia];

export const calcularPrazoAtendimento = (dataAbertura: string, urgencia: Urgencia): string => {
  const prazo = new Date(dataAbertura);
  if (Number.isNaN(prazo.getTime())) {
    throw new RangeError('Data de abertura inválida para calcular o prazo de atendimento.');
  }

  prazo.setDate(prazo.getDate() + getPrazoAtendimentoDias(urgencia));
  return prazo.toISOString();
};

export type EstadoPrazoAtendimento = 'vencido' | 'proximo' | 'normal';

export const classificarPrazoAtendimento = (
  prazoAtendimento: string,
  agora = Date.now()
): EstadoPrazoAtendimento => {
  const prazo = new Date(prazoAtendimento).getTime();
  if (Number.isNaN(prazo)) {
    throw new RangeError('Data de prazo inválida para classificação do atendimento.');
  }
  if (prazo <= agora) return 'vencido';
  if (prazo <= agora + 2 * 24 * 60 * 60 * 1000) return 'proximo';
  return 'normal';
};

export const normalizarUrgencia = (urgencia: string): Urgencia => {
  const urgenciasLegadas: Record<string, Urgencia> = {
    Baixa: 'Baixa - Até 7 dias',
    Média: 'Média - Até 5 dias',
    Alta: 'Alta - Até 3 dias',
    'Crítica/Emergencial': 'Crítica/Emergencial - Até 1 dia',
  };
  if (
    urgencia === 'Baixa - Até 7 dias' ||
    urgencia === 'Média - Até 5 dias' ||
    urgencia === 'Alta - Até 3 dias' ||
    urgencia === 'Crítica/Emergencial - Até 1 dia'
  ) {
    return urgencia;
  }
  const normalizada = urgenciasLegadas[urgencia];
  if (!normalizada) throw new RangeError(`Nível de urgência inválido: ${urgencia}`);
  return normalizada;
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
};
