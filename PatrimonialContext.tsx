import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Chamado,
  FiltrosChamado,
  StatusChamado,
  AssinaturaRoteiro,
  HistoricoEvento,
} from '../types/patrimonial';
import { INITIAL_MOCK_CHAMADOS } from '../data/mockData';
import { calcularPrazoAtendimento, normalizarUrgencia } from '../utils/formatters';

const LOCAL_STORAGE_KEY = 'bravi_patrimonial_chamados_v1';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface PatrimonialContextType {
  chamados: Chamado[];
  selectedChamado: Chamado | null;
  activeView: 'dashboard' | 'create' | 'edit' | 'detail';
  filtros: FiltrosChamado;
  isLoading: boolean;
  isSaving: boolean;
  toasts: ToastItem[];
  setActiveView: (view: 'dashboard' | 'create' | 'edit' | 'detail') => void;
  setFiltros: React.Dispatch<React.SetStateAction<FiltrosChamado>>;
  selectChamado: (chamado: Chamado | null, targetView?: 'detail' | 'edit') => void;
  criarChamado: (
    novo: Omit<Chamado, 'id' | 'valorTotalGeral' | 'roteiroAssinaturas' | 'historico'>
  ) => Promise<Chamado>;
  atualizarChamado: (id: string, dados: Partial<Chamado>) => Promise<Chamado>;
  deletarChamado: (id: string) => Promise<boolean>;
  duplicarChamado: (id: string) => Promise<Chamado>;
  avancarStatus: (
    id: string,
    novoStatus: StatusChamado,
    observacao?: string,
    responsavelNome?: string
  ) => Promise<void>;
  rejeitarChamado: (
    id: string,
    motivo: string,
    responsavelNome?: string
  ) => Promise<void>;
  resetarDados: () => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  stats: {
    total: number;
    pendentes: number;
    emExecucao: number;
    concluidos: number;
    rejeitados: number;
    valorTotalGeral: number;
    valorPendente: number;
  };
}

const defaultFiltros: FiltrosChamado = {
  busca: '',
  filial: 'todas',
  status: 'todos',
  categoria: 'todas',
  urgencia: 'todas',
};

const PatrimonialContext = createContext<PatrimonialContextType | undefined>(undefined);

export const PatrimonialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [chamados, setChamados] = useState<Chamado[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const chamadosSalvos = JSON.parse(saved) as Chamado[];
        return chamadosSalvos.map((chamado) => {
          const urgencia = normalizarUrgencia(chamado.urgencia);
          return {
            ...chamado,
            urgencia,
            previsaoConclusao: calcularPrazoAtendimento(chamado.dataAbertura, urgencia),
          };
        });
      }
    } catch (e) {
      console.error('Falha ao recuperar do localStorage', e);
    }
    return INITIAL_MOCK_CHAMADOS;
  });

  const [selectedChamadoId, setSelectedChamadoId] = useState<string | null>('ORC-420');
  const [activeView, setActiveView] = useState<'dashboard' | 'create' | 'edit' | 'detail'>('dashboard');
  const [filtros, setFiltros] = useState<FiltrosChamado>(defaultFiltros);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(chamados));
    } catch (e) {
      console.error('Erro ao salvar no localStorage', e);
    }
  }, [chamados]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const selectedChamado = useMemo(() => {
    return chamados.find((c) => c.id === selectedChamadoId) || null;
  }, [chamados, selectedChamadoId]);

  const selectChamado = (chamado: Chamado | null, targetView: 'detail' | 'edit' = 'detail') => {
    if (chamado) {
      setSelectedChamadoId(chamado.id);
      setActiveView(targetView);
    } else {
      setSelectedChamadoId(null);
    }
  };

  // Generate next sequential ticket ID (e.g., ORC-422)
  const getNextId = (): string => {
    const numbers = chamados
      .map((c) => {
        const match = c.id.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 400;
    return `ORC-${maxNum + 1}`;
  };

  const criarChamado = async (
    novoData: Omit<Chamado, 'id' | 'valorTotalGeral' | 'roteiroAssinaturas' | 'historico'>
  ): Promise<Chamado> => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 600)); // Simulate corporate API latency

    const id = getNextId();
    const totalItens = novoData.itens.reduce((acc, item) => acc + (item.valorTotal || item.quantidade * item.valorUnitario), 0);

    const novoRoteiro: AssinaturaRoteiro[] = [
      {
        id: `sig-${Date.now()}-1`,
        etapa: 'Solicitante',
        nomeResponsavel: novoData.solicitanteNome || 'Carlos Silveira',
        cargo: novoData.solicitanteCargo || 'Colaborador Solicitante',
        status: 'Aprovado',
        dataAssinatura: new Date().toISOString(),
        rubricaCodigo: `BRV-AUT-${Math.floor(10000 + Math.random() * 90000)}`,
        observacao: 'Solicitação gerada e assinada pelo autor.',
      },
      {
        id: `sig-${Date.now()}-2`,
        etapa: 'Gestor da Área',
        nomeResponsavel: 'Mariana Duarte Fontes',
        cargo: 'Gerente Geral de Operações',
        status: novoData.status === 'Rascunho' ? 'Aguardando' : 'Pendente',
      },
      {
        id: `sig-${Date.now()}-3`,
        etapa: 'Diretoria Financeira',
        nomeResponsavel: 'Dr. Henrique V. Vasconcellos',
        cargo: 'Diretor Financeiro (CFO)',
        status: 'Aguardando',
      },
      {
        id: `sig-${Date.now()}-4`,
        etapa: 'Controle Patrimonial',
        nomeResponsavel: 'Juliana Siqueira Prado',
        cargo: 'Coordenadora de Ativos & Patrimônio',
        status: 'Aguardando',
      },
    ];

    const novoHistorico: HistoricoEvento[] = [
      {
        id: `hist-${Date.now()}`,
        dataHora: new Date().toISOString(),
        usuario: novoData.solicitanteNome || 'Carlos Silveira',
        cargo: novoData.solicitanteCargo || 'Colaborador Solicitante',
        acao: novoData.status === 'Rascunho' ? 'Rascunho do chamado criado' : 'Chamado aberto e submetido para aprovação',
        tipo: 'criacao',
      },
    ];

    const novoChamadoCompleto: Chamado = {
      ...novoData,
      id,
      valorTotalGeral: totalItens,
      roteiroAssinaturas: novoRoteiro,
      historico: novoHistorico,
      anexos: [
        {
          id: `att-${Date.now()}`,
          nome: `Requisicao_Assinada_${id}.pdf`,
          tamanho: '1.2 MB',
          tipo: 'PDF',
          dataUpload: new Date().toISOString().split('T')[0],
        },
      ],
    };

    setChamados((prev) => [novoChamadoCompleto, ...prev]);
    setSelectedChamadoId(novoChamadoCompleto.id);
    setIsSaving(false);
    addToast(`Chamado ${id} cadastrado com sucesso!`, 'success');
    return novoChamadoCompleto;
  };

  const atualizarChamado = async (id: string, dados: Partial<Chamado>): Promise<Chamado> => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    let atualizado: Chamado | null = null;

    setChamados((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const valorTotalGeral = dados.itens
            ? dados.itens.reduce((acc, it) => acc + (it.valorTotal || it.quantidade * it.valorUnitario), 0)
            : dados.valorTotalGeral !== undefined
            ? dados.valorTotalGeral
            : item.valorTotalGeral;

          const updatedHist: HistoricoEvento = {
            id: `hist-${Date.now()}`,
            dataHora: new Date().toISOString(),
            usuario: 'Gestão Patrimonial Bravi',
            cargo: 'Sistema Integrado',
            acao: 'Dados do chamado atualizados',
            tipo: 'edicao',
          };

          atualizado = {
            ...item,
            ...dados,
            valorTotalGeral,
            historico: [updatedHist, ...item.historico],
          };
          return atualizado;
        }
        return item;
      })
    );

    setIsSaving(false);
    addToast(`Chamado ${id} atualizado com êxito!`, 'success');
    return atualizado!;
  };

  const deletarChamado = async (id: string): Promise<boolean> => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 350));
    setChamados((prev) => prev.filter((c) => c.id !== id));
    if (selectedChamadoId === id) {
      setSelectedChamadoId(null);
      setActiveView('dashboard');
    }
    setIsSaving(false);
    addToast(`Chamado ${id} excluído permanentemente`, 'info');
    return true;
  };

  const duplicarChamado = async (id: string): Promise<Chamado> => {
    const original = chamados.find((c) => c.id === id);
    if (!original) throw new Error('Chamado não encontrado');

    const novoId = getNextId();
    const dataAbertura = new Date().toISOString();
    const duplicado: Chamado = {
      ...original,
      id: novoId,
      titulo: `${original.titulo} (Cópia)`,
      status: 'Rascunho',
      dataAbertura,
      previsaoConclusao: calcularPrazoAtendimento(dataAbertura, original.urgencia),
      itens: original.itens.map((it) => ({ ...it, id: `item-${Date.now()}-${Math.random()}` })),
      roteiroAssinaturas: [
        {
          id: `sig-${Date.now()}-1`,
          etapa: 'Solicitante',
          nomeResponsavel: original.solicitanteNome,
          cargo: original.solicitanteCargo,
          status: 'Pendente',
        },
        {
          id: `sig-${Date.now()}-2`,
          etapa: 'Gestor da Área',
          nomeResponsavel: 'Mariana Duarte Fontes',
          cargo: 'Gerente Geral',
          status: 'Aguardando',
        },
        {
          id: `sig-${Date.now()}-3`,
          etapa: 'Diretoria Financeira',
          nomeResponsavel: 'Dr. Henrique V. Vasconcellos',
          cargo: 'Diretor Financeiro',
          status: 'Aguardando',
        },
        {
          id: `sig-${Date.now()}-4`,
          etapa: 'Controle Patrimonial',
          nomeResponsavel: 'Juliana Siqueira Prado',
          cargo: 'Coordenadora de Ativos',
          status: 'Aguardando',
        },
      ],
      historico: [
        {
          id: `hist-${Date.now()}`,
          dataHora: new Date().toISOString(),
          usuario: 'Carlos Silveira',
          cargo: 'Gestor Patrimonial',
          acao: `Chamado duplicado a partir do protocolo ${id}`,
          tipo: 'criacao',
        },
      ],
    };

    setChamados((prev) => [duplicado, ...prev]);
    setSelectedChamadoId(duplicado.id);
    setActiveView('detail');
    addToast(`Chamado clonado com sucesso como ${novoId}!`, 'success');
    return duplicado;
  };

  const avancarStatus = async (
    id: string,
    novoStatus: StatusChamado,
    observacao?: string,
    responsavelNome: string = 'Carlos Silveira'
  ) => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    setChamados((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        // Update signatures workflow according to status advancement
        const novoRoteiro = item.roteiroAssinaturas.map((sig) => {
          if (novoStatus === 'Aprovado - Em Cotação' && sig.etapa === 'Gestor da Área') {
            return {
              ...sig,
              status: 'Aprovado' as const,
              dataAssinatura: new Date().toISOString(),
              rubricaCodigo: `BRV-AUT-${Math.floor(10000 + Math.random() * 90000)}`,
              observacao: observacao || 'Aprovado pelo gestor responsável.',
            };
          }
          if (novoStatus === 'Em Execução' && (sig.etapa === 'Diretoria Financeira' || sig.etapa === 'Gestor da Área')) {
            return {
              ...sig,
              status: 'Aprovado' as const,
              dataAssinatura: sig.dataAssinatura || new Date().toISOString(),
              rubricaCodigo: sig.rubricaCodigo || `BRV-AUT-${Math.floor(10000 + Math.random() * 90000)}`,
              observacao: observacao || sig.observacao || 'Orçamento e faturamento aprovados.',
            };
          }
          if (novoStatus === 'Concluído') {
            return {
              ...sig,
              status: 'Aprovado' as const,
              dataAssinatura: sig.dataAssinatura || new Date().toISOString(),
              rubricaCodigo: sig.rubricaCodigo || `BRV-AUT-${Math.floor(10000 + Math.random() * 90000)}`,
              observacao: sig.observacao || 'Processo auditado e encerrado.',
            };
          }
          return sig;
        });

        const novoHist: HistoricoEvento = {
          id: `hist-${Date.now()}`,
          dataHora: new Date().toISOString(),
          usuario: responsavelNome,
          cargo: 'Gestão Bravi Patrimonial',
          acao: `Status alterado para: ${novoStatus}`,
          comentario: observacao,
          tipo: novoStatus === 'Concluído' ? 'conclusao' : 'status',
        };

        return {
          ...item,
          status: novoStatus,
          roteiroAssinaturas: novoRoteiro,
          historico: [novoHist, ...item.historico],
        };
      })
    );

    setIsSaving(false);
    addToast(`Status do chamado ${id} atualizado para "${novoStatus}"`, 'success');
  };

  const rejeitarChamado = async (
    id: string,
    motivo: string,
    responsavelNome: string = 'Diretoria Financeira Bravi'
  ) => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    setChamados((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const roteiro = item.roteiroAssinaturas.map((sig) => {
          if (sig.status === 'Pendente' || sig.etapa === 'Gestor da Área' || sig.etapa === 'Diretoria Financeira') {
            return {
              ...sig,
              status: 'Rejeitado' as const,
              dataAssinatura: new Date().toISOString(),
              observacao: motivo,
            };
          }
          return sig;
        });

        const hist: HistoricoEvento = {
          id: `hist-${Date.now()}`,
          dataHora: new Date().toISOString(),
          usuario: responsavelNome,
          cargo: 'Comitê de Aprovação',
          acao: 'Chamado Rejeitado / Ajuste Solicitado',
          comentario: motivo,
          tipo: 'rejeicao',
        };

        return {
          ...item,
          status: 'Rejeitado',
          roteiroAssinaturas: roteiro,
          historico: [hist, ...item.historico],
        };
      })
    );

    setIsSaving(false);
    addToast(`Chamado ${id} rejeitado. Justificativa registrada.`, 'info');
  };

  const resetarDados = () => {
    setIsLoading(true);
    setTimeout(() => {
      setChamados(INITIAL_MOCK_CHAMADOS);
      setSelectedChamadoId('ORC-420');
      setFiltros(defaultFiltros);
      setIsLoading(false);
      addToast('Base de dados restaurada para o padrão inicial da Bravi!', 'info');
    }, 400);
  };

  const stats = useMemo(() => {
    const total = chamados.length;
    const pendentes = chamados.filter((c) => c.status === 'Pendente de Aprovação').length;
    const emExecucao = chamados.filter((c) => c.status === 'Em Execução' || c.status === 'Aprovado - Em Cotação').length;
    const concluidos = chamados.filter((c) => c.status === 'Concluído').length;
    const rejeitados = chamados.filter((c) => c.status === 'Rejeitado' || c.status === 'Cancelado').length;

    const valorTotalGeral = chamados.reduce((acc, c) => acc + (c.valorTotalGeral || 0), 0);
    const valorPendente = chamados
      .filter((c) => c.status === 'Pendente de Aprovação')
      .reduce((acc, c) => acc + (c.valorTotalGeral || 0), 0);

    return {
      total,
      pendentes,
      emExecucao,
      concluidos,
      rejeitados,
      valorTotalGeral,
      valorPendente,
    };
  }, [chamados]);

  return (
    <PatrimonialContext.Provider
      value={{
        chamados,
        selectedChamado,
        activeView,
        filtros,
        isLoading,
        isSaving,
        toasts,
        setActiveView,
        setFiltros,
        selectChamado,
        criarChamado,
        atualizarChamado,
        deletarChamado,
        duplicarChamado,
        avancarStatus,
        rejeitarChamado,
        resetarDados,
        addToast,
        removeToast,
        stats,
      }}
    >
      {children}
    </PatrimonialContext.Provider>
  );
};

export const usePatrimonial = () => {
  const context = useContext(PatrimonialContext);
  if (!context) {
    throw new Error('usePatrimonial must be used within a PatrimonialProvider');
  }
  return context;
};
