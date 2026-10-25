import React, { useState, useEffect } from 'react';
import { usePatrimonial } from '../context/PatrimonialContext';
import {
  Filial,
  CentroDeCusto,
  Categoria,
  Urgencia,
  StatusChamado,
  ItemChamado,
  Chamado,
} from '../types/patrimonial';
import {
  FILIAIS_LIST,
  CENTROS_DE_CUSTO_LIST,
  CATEGORIAS_LIST,
  SOLICITANTES_LIST,
  CARGOS_SOLICITANTE_LIST,
  URGENCIAS_LIST,
  STATUS_LIST,
} from '../data/mockData';
import {
  calcularPrazoAtendimento,
  formatCurrency,
  formatDate,
  getPrazoAtendimentoDias,
} from '../utils/formatters';
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  AlertCircle,
  Building,
  Briefcase,
  Calendar,
  DollarSign,
  FileText,
  User,
  CreditCard,
  Layers,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface ChamadoFormProps {
  isEditing?: boolean;
}

export const ChamadoForm: React.FC<ChamadoFormProps> = ({ isEditing = false }) => {
  const {
    selectedChamado,
    criarChamado,
    atualizarChamado,
    setActiveView,
    isSaving,
    addToast,
  } = usePatrimonial();

  // Form State
  const [titulo, setTitulo] = useState('');
  const [placaVeiculo, setPlacaVeiculo] = useState('');
  const [tipoVeiculo, setTipoVeiculo] = useState('');
  const [condutorVeiculo, setCondutorVeiculo] = useState('');
  const [filial, setFilial] = useState<Filial>('Matriz Recife - 19.457.137/0001-06');
  const [centroDeCusto, setCentroDeCusto] = useState<CentroDeCusto>('Patrimonio REC');
  const [categoria, setCategoria] = useState<Categoria>('Manutenção de Equipamentos');
  const [urgencia, setUrgencia] = useState<Urgencia>('Alta - Até 3 dias');
  const [status, setStatus] = useState<StatusChamado>('Pendente de Aprovação');
  const [dataAberturaFormulario] = useState(() => new Date().toISOString());
  const dataAbertura = isEditing && selectedChamado
    ? selectedChamado.dataAbertura
    : dataAberturaFormulario;

  // Solicitante
  const [solicitanteNome, setSolicitanteNome] = useState('KLEBER COSTA');
  const [solicitanteEmail, setSolicitanteEmail] = useState('carlos.silveira@bravi.com.br');
  const [solicitanteCargo, setSolicitanteCargo] = useState<(typeof CARGOS_SOLICITANTE_LIST)[number]>('PATRIMONIAL');
  const [solicitanteRamal, setSolicitanteRamal] = useState('R-4010');
  const [solicitanteTelefone, setSolicitanteTelefone] = useState('');
  const solicitanteEhOutro =
    solicitanteNome === 'OUTROS' ||
    !SOLICITANTES_LIST.slice(0, -1).some((nome) => nome === solicitanteNome);

  // Financeiro & Fornecedor
  const [fornecedorSugerido, setFornecedorSugerido] = useState('');
  const [cnpjFornecedor, setCnpjFornecedor] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('Faturamento 28 dias (Boleto)');
  const [limiteOrcamentario, setLimiteOrcamentario] = useState<number>(10000);
  const [justificativa, setJustificativa] = useState('');
  const [observacoesInternas, setObservacoesInternas] = useState('');

  // Itens Dinâmicos
  const [itens, setItens] = useState<ItemChamado[]>([
    {
      id: 'item-initial-1',
      codigo: 'MAN-01',
      descricao: '',
      unidade: 'UN',
      quantidade: 1,
      valorUnitario: 0,
      valorTotal: 0,
    },
  ]);

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Prefill when editing
  useEffect(() => {
    if (isEditing && selectedChamado) {
      setTitulo(selectedChamado.titulo);
      setFilial(selectedChamado.filial);
      setCentroDeCusto(selectedChamado.centroDeCusto);
      setCategoria(selectedChamado.categoria);
      setPlacaVeiculo(selectedChamado.placaVeiculo || '');
      setTipoVeiculo(selectedChamado.tipoVeiculo || '');
      setCondutorVeiculo(selectedChamado.condutorVeiculo || '');
      setUrgencia(selectedChamado.urgencia);
      setStatus(selectedChamado.status);

      setSolicitanteNome(selectedChamado.solicitanteNome);
      setSolicitanteEmail(selectedChamado.solicitanteEmail);
      setSolicitanteCargo(
        CARGOS_SOLICITANTE_LIST.find((cargo) => cargo === selectedChamado.solicitanteCargo) ||
          'PATRIMONIAL'
      );
      setSolicitanteRamal(selectedChamado.solicitanteRamal);
      setSolicitanteTelefone(selectedChamado.solicitanteTelefone || '');
      setFornecedorSugerido(selectedChamado.fornecedorSugerido || '');
      setCnpjFornecedor(selectedChamado.cnpjFornecedor || '');
      setFormaPagamento(selectedChamado.formaPagamento || 'Faturamento 28 dias');
      setLimiteOrcamentario(selectedChamado.limiteOrcamentario || 0);
      setJustificativa(selectedChamado.justificativa || '');
      setObservacoesInternas(selectedChamado.observacoesInternas || '');

      setItens(
        selectedChamado.itens && selectedChamado.itens.length > 0
          ? selectedChamado.itens
          : [
              {
                id: `item-${Date.now()}`,
                codigo: 'SRV-01',
                descricao: '',
                unidade: 'UN',
                quantidade: 1,
                valorUnitario: 0,
                valorTotal: 0,
              },
            ]
      );
    }
  }, [isEditing, selectedChamado]);

  // Calculate live total of items
  const valorTotalCalculado = itens.reduce((acc, item) => {
    return acc + (item.quantidade || 0) * (item.valorUnitario || 0);
  }, 0);

  // Item Table handlers
  const handleAddItem = () => {
    const nextNum = itens.length + 1;
    const prefix = categoria.includes('TI') ? 'TI' : categoria.includes('Manutenção') ? 'MAN' : 'PRD';
    const newItem: ItemChamado = {
      id: `item-${Date.now()}-${Math.random()}`,
      codigo: `${prefix}-0${nextNum}`,
      descricao: '',
      unidade: 'UN',
      quantidade: 1,
      valorUnitario: 0,
      valorTotal: 0,
    };
    setItens((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (itens.length <= 1) {
      addToast('O chamado deve conter pelo menos um item ou serviço especificado.', 'error');
      return;
    }
    setItens((prev) => prev.filter((item) => item.id !== id));
  };

  const handleItemChange = (
    id: string,
    field: keyof ItemChamado,
    value: string | number
  ) => {
    setItens((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };
        if (field === 'quantidade' || field === 'valorUnitario') {
          const qty = field === 'quantidade' ? Number(value) : item.quantidade;
          const price = field === 'valorUnitario' ? Number(value) : item.valorUnitario;
          updated.valorTotal = (qty || 0) * (price || 0);
        }
        return updated;
      })
    );
  };

  // Form Validation
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!titulo.trim()) {
      errs.titulo = 'Informe o título ou objeto do chamado';
    }

    if (!solicitanteNome.trim()) {
      errs.solicitanteNome = 'Informe o nome do solicitante';
    }

    if (categoria === 'Serviços Logísticos / Veículos') {
      if (!placaVeiculo.trim()) errs.placaVeiculo = 'Informe a placa do veículo';
      if (!tipoVeiculo.trim()) errs.tipoVeiculo = 'Informe o tipo do veículo';
      if (!condutorVeiculo.trim()) errs.condutorVeiculo = 'Informe o condutor do veículo';
    }

    if (!justificativa.trim() || justificativa.trim().length < 15) {
      errs.justificativa = 'A justificativa deve ter no mínimo 15 caracteres explicativos';
    }

    if (itens.length === 0) {
      errs.itens = 'Adicione ao menos um item ou serviço ao quadro';
    } else {
      const hasEmptyItem = itens.some((it) => !it.descricao.trim());
      if (hasEmptyItem) {
        errs.itens = 'Todos os itens devem ter descrição preenchida';
      }
      const hasZeroTotal = itens.some((it) => it.quantidade <= 0 || it.valorUnitario <= 0);
      if (hasZeroTotal) {
        errs.itens = 'A quantidade e o valor unitário dos itens devem ser maiores que zero';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      addToast('Por favor, corrija os campos assinalados antes de salvar.', 'error');
      return;
    }

    const payload = {
      titulo: titulo.trim(),
      filial,
      centroDeCusto,
      categoria,
      placaVeiculo:
        categoria === 'Serviços Logísticos / Veículos' ? placaVeiculo.trim() : undefined,
      tipoVeiculo:
        categoria === 'Serviços Logísticos / Veículos' ? tipoVeiculo.trim() : undefined,
      condutorVeiculo:
        categoria === 'Serviços Logísticos / Veículos' ? condutorVeiculo.trim() : undefined,
      urgencia,
      status,
      solicitanteNome: solicitanteNome.trim(),
      solicitanteEmail: solicitanteEmail.trim(),
      solicitanteCargo: solicitanteCargo.trim(),
      solicitanteRamal: solicitanteRamal.trim(),
      solicitanteTelefone: solicitanteTelefone.trim(),
      dataAbertura,
      previsaoConclusao: calcularPrazoAtendimento(dataAbertura, urgencia),
      fornecedorSugerido: fornecedorSugerido.trim() || 'Cotação em aberto / Não definido',
      cnpjFornecedor: cnpjFornecedor.trim(),
      formaPagamento,
      limiteOrcamentario: Number(limiteOrcamentario) || 0,
      justificativa: justificativa.trim(),
      observacoesInternas: observacoesInternas.trim(),
      itens: itens.map((it) => ({
        ...it,
        valorTotal: (it.quantidade || 1) * (it.valorUnitario || 0),
      })),
    };

    if (isEditing && selectedChamado) {
      await atualizarChamado(selectedChamado.id, payload);
      setActiveView('detail');
    } else {
      const criado = await criarChamado(payload);
      setActiveView('detail');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setActiveView(isEditing ? 'detail' : 'dashboard')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancelar e Voltar</span>
        </button>

        <div className="text-right">
          <span className="text-xs text-slate-500 font-medium">
            {isEditing ? `Modo de Edição • Protocolo ${selectedChamado?.id}` : 'Nova Requisição Corporativa'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Header Title */}
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-700" />
              <span>
                {isEditing ? `Editar Chamado ${selectedChamado?.id}` : 'Abertura de Chamado - Bravi Patrimonial'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Preencha os blocos da solicitação para abertura formal de ordem de serviço, manutenção ou aquisição.
            </p>
          </div>

          {/* ====================================================== */}
          {/* BLOCO 1: DETALHES DA SOLICITAÇÃO                       */}
          {/* ====================================================== */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-700"></span>
              1. Detalhes da Solicitação
            </h3>

            {/* Título do Chamado */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Título / Objeto da Requisição <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Manutenção Preventiva e Higienização de Ar-Condicionado - Bloco C"
                className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.titulo ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {errors.titulo && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.titulo}</span>
                </p>
              )}
            </div>

            {/* Grid Filial, Centro de Custo, Categoria, Urgência */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Filial */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unidade / Filial <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={filial}
                    onChange={(e) => setFilial(e.target.value as Filial)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {FILIAIS_LIST.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Centro de Custo */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Centro de Custo / Área Solicitante <span className="text-rose-500">*</span>
                </label>
                <select
                  value={centroDeCusto}
                  onChange={(e) => setCentroDeCusto(e.target.value as CentroDeCusto)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {CENTROS_DE_CUSTO_LIST.map((cc) => (
                    <option key={cc} value={cc}>
                      {cc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Categoria da Requisição <span className="text-rose-500">*</span>
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as Categoria)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIAS_LIST.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Urgência */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nível de Urgência <span className="text-rose-500">*</span>
                </label>
                <select
                  value={urgencia}
                  onChange={(e) => setUrgencia(e.target.value as Urgencia)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {URGENCIAS_LIST.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {categoria === 'Serviços Logísticos / Veículos' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Placa do Veículo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={placaVeiculo}
                    onChange={(e) => setPlacaVeiculo(e.target.value)}
                    required
                    aria-invalid={Boolean(errors.placaVeiculo)}
                    className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      errors.placaVeiculo ? 'border-rose-400' : 'border-slate-300'
                    }`}
                  />
                  {errors.placaVeiculo && (
                    <p className="text-xs text-rose-600 mt-1">{errors.placaVeiculo}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo do Veículo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={tipoVeiculo}
                    onChange={(e) => setTipoVeiculo(e.target.value)}
                    required
                    aria-invalid={Boolean(errors.tipoVeiculo)}
                    className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      errors.tipoVeiculo ? 'border-rose-400' : 'border-slate-300'
                    }`}
                  />
                  {errors.tipoVeiculo && (
                    <p className="text-xs text-rose-600 mt-1">{errors.tipoVeiculo}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Condutor do Veículo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={condutorVeiculo}
                    onChange={(e) => setCondutorVeiculo(e.target.value)}
                    required
                    aria-invalid={Boolean(errors.condutorVeiculo)}
                    className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      errors.condutorVeiculo ? 'border-rose-400' : 'border-slate-300'
                    }`}
                  />
                  {errors.condutorVeiculo && (
                    <p className="text-xs text-rose-600 mt-1">{errors.condutorVeiculo}</p>
                  )}
                </div>
              </div>
            )}

            {/* Solicitante & Datas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Solicitante Responsável <span className="text-rose-500">*</span>
                </label>
                <select
                  value={solicitanteEhOutro ? 'OUTROS' : solicitanteNome}
                  onChange={(e) =>
                    setSolicitanteNome(e.target.value === 'OUTROS' ? '' : e.target.value)
                  }
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {SOLICITANTES_LIST.map((nome) => (
                    <option key={nome} value={nome}>
                      {nome}
                    </option>
                  ))}
                </select>
                {solicitanteEhOutro && (
                  <input
                    type="text"
                    value={solicitanteNome === 'OUTROS' ? '' : solicitanteNome}
                    onChange={(e) => setSolicitanteNome(e.target.value)}
                    placeholder="Digite o nome do solicitante"
                    required
                    aria-label="Nome do solicitante"
                    className={`w-full mt-2 px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                    errors.solicitanteNome ? 'border-rose-400' : 'border-slate-300'
                    }`}
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cargo / Setor
                </label>
                <select
                  value={solicitanteCargo}
                  onChange={(e) =>
                    setSolicitanteCargo(
                      CARGOS_SOLICITANTE_LIST.find((cargo) => cargo === e.target.value) ||
                        'PATRIMONIAL'
                    )
                  }
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {CARGOS_SOLICITANTE_LIST.map((cargo) => (
                    <option key={cargo} value={cargo}>
                      {cargo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={solicitanteTelefone}
                  onChange={(e) => setSolicitanteTelefone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prazo Limite de Atendimento
                </label>
                <p className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-700">
                  {formatDate(calcularPrazoAtendimento(dataAbertura, urgencia))}
                  {' '}(abertura + {getPrazoAtendimentoDias(urgencia)} dias)
                </p>
              </div>
            </div>
          </div>

          {/* ====================================================== */}
          {/* BLOCO 2: DADOS FINANCEIROS / FORNECEDOR                */}
          {/* ====================================================== */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-700"></span>
              2. Dados Financeiros & Fornecedor
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Fornecedor */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fornecedor Homologado / Sugerido
                </label>
                <input
                  type="text"
                  value={fornecedorSugerido}
                  onChange={(e) => setFornecedorSugerido(e.target.value)}
                  placeholder="Ex: ClimaTech Engenharia Térmica"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Forma Pagamento */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Condição / Forma de Pagamento
                </label>
                <input
                  type="text"
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  placeholder="Ex: Faturamento 28 dias / Boleto"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Limite Orçamentário */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Limite Orçamentário Aprovado (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    R$
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={limiteOrcamentario}
                    onChange={(e) => setLimiteOrcamentario(Number(e.target.value))}
                    className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Justificativa */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Justificativa da Solicitação & Impacto Operacional <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                placeholder="Descreva a razão da contratação ou compra, impacto na operação e necessidade de atendimento..."
                className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                  errors.justificativa ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              ></textarea>
              {errors.justificativa && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.justificativa}</span>
                </p>
              )}
            </div>
          </div>

          {/* ====================================================== */}
          {/* BLOCO 3: QUADRO DE ITENS DINÂMICO                      */}
          {/* ====================================================== */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-700"></span>
                3. Quadro Dinâmico de Itens & Serviços
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Linha</span>
              </button>
            </div>

            {errors.itens && (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.itens}</span>
              </p>
            )}

            <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-2.5 px-3 w-28">Código</th>
                    <th className="py-2.5 px-3">Descrição do Produto / Serviço</th>
                    <th className="py-2.5 px-2 w-20 text-center">UN</th>
                    <th className="py-2.5 px-3 w-24 text-right">Qtd</th>
                    <th className="py-2.5 px-3 w-32 text-right">Unitário (R$)</th>
                    <th className="py-2.5 px-3 w-32 text-right">Total (R$)</th>
                    <th className="py-2.5 px-2 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {itens.map((item, index) => {
                    const rowTotal = (item.quantidade || 0) * (item.valorUnitario || 0);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80">
                        {/* Código */}
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.codigo}
                            onChange={(e) => handleItemChange(item.id, 'codigo', e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-medium focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                          />
                        </td>

                        {/* Descrição */}
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder="Descreva o material ou serviço técnico..."
                            value={item.descricao}
                            onChange={(e) => handleItemChange(item.id, 'descricao', e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                          />
                        </td>

                        {/* Unidade */}
                        <td className="py-2 px-2 text-center">
                          <select
                            value={item.unidade}
                            onChange={(e) => handleItemChange(item.id, 'unidade', e.target.value)}
                            className="w-full px-1 py-1 bg-white border border-slate-300 rounded text-[11px] font-mono text-center focus:outline-hidden"
                          >
                            <option value="UN">UN</option>
                            <option value="SERV">SERV</option>
                            <option value="M²">M²</option>
                            <option value="HORAS">HORAS</option>
                            <option value="CX">CX</option>
                            <option value="PCT">PCT</option>
                            <option value="KG">KG</option>
                          </select>
                        </td>

                        {/* Quantidade */}
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={item.quantidade}
                            onChange={(e) =>
                              handleItemChange(item.id, 'quantidade', Math.max(1, Number(e.target.value)))
                            }
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono text-right focus:outline-hidden"
                          />
                        </td>

                        {/* Valor Unitário */}
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={item.valorUnitario}
                            onChange={(e) =>
                              handleItemChange(item.id, 'valorUnitario', Math.max(0, Number(e.target.value)))
                            }
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono text-right focus:outline-hidden"
                          />
                        </td>

                        {/* Total da Linha */}
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(rowTotal)}
                        </td>

                        {/* Delete row */}
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Remover linha"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totalizador Financeiro e Análise Orçamentária */}
            <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                    Total Calculado dos Itens:
                  </span>
                  <span className="text-xl sm:text-2xl font-mono font-black text-sky-400">
                    {formatCurrency(valorTotalCalculado)}
                  </span>
                </div>
              </div>

              {/* Budget check comparison */}
              <div className="text-right text-xs">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-slate-300">Limite Estipulado:</span>
                  <span className="font-mono font-bold">{formatCurrency(limiteOrcamentario)}</span>
                </div>
                {limiteOrcamentario > 0 && (
                  <div className="mt-1">
                    {valorTotalCalculado <= limiteOrcamentario ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1 justify-end">
                        • Dentro do teto orçamentário ({formatCurrency(limiteOrcamentario - valorTotalCalculado)} restante)
                      </span>
                    ) : (
                      <span className="text-rose-400 font-semibold flex items-center gap-1 justify-end">
                        <AlertCircle className="w-3.5 h-3.5" />
                        • Excede limite em {formatCurrency(valorTotalCalculado - limiteOrcamentario)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setActiveView(isEditing ? 'detail' : 'dashboard')}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 rounded-lg shadow-sm hover:shadow transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Salvar Alterações' : 'Emitir Chamado'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
