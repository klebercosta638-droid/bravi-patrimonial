import React from 'react';
import { usePatrimonial } from '../context/PatrimonialContext';
import {
  FILIAIS_LIST,
  CENTROS_DE_CUSTO_LIST,
  CATEGORIAS_LIST,
  URGENCIAS_LIST,
} from '../data/mockData';
import { formatCurrency } from '../utils/formatters';
import { correspondeAoPeriodoAbertura } from '../utils/formatters';
import {
  SlidersHorizontal,
  Search,
  PlusCircle,
  Building,
  Filter,
  Layers,
  RotateCcw,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PlayCircle,
  XCircle,
  FileText,
  X,
  Flame,
} from 'lucide-react';
import { StatusChamado } from '../types/patrimonial';

export const ControleSidebar: React.FC = () => {
  const {
    chamados,
    filtros,
    setFiltros,
    setActiveView,
    selectChamado,
    resetarDados,
    stats,
  } = usePatrimonial();

  const handleNovoChamado = () => {
    selectChamado(null);
    setActiveView('create');
  };

  const handleResetFilters = () => {
    setFiltros({
      busca: '',
      filial: 'todas',
      centroDeCusto: 'todos',
      status: 'todos',
      categoria: 'todas',
      urgencia: 'todas',
      ano: 'todos',
      mes: 'todos',
    });
  };

  const chamadosNoPeriodo = chamados.filter((chamado) =>
    correspondeAoPeriodoAbertura(chamado.dataAbertura, filtros.ano, filtros.mes)
  );

  const hasActiveFilters =
    filtros.busca !== '' ||
    filtros.filial !== 'todas' ||
    filtros.centroDeCusto !== 'todos' ||
    filtros.status !== 'todos' ||
    filtros.categoria !== 'todas' ||
    filtros.urgencia !== 'todas' ||
    filtros.ano !== 'todos' ||
    filtros.mes !== 'todos';

  // Count by status
  const countByStatus = (st: StatusChamado | 'todos' | 'Em Andamento') => {
    if (st === 'todos') return chamadosNoPeriodo.length;
    if (st === 'Em Andamento') {
      return chamadosNoPeriodo.filter(
        (c) => c.status === 'Aprovado - Em Cotação' || c.status === 'Em Execução'
      ).length;
    }
    return chamadosNoPeriodo.filter((c) => c.status === st).length;
  };

  return (
    <aside className="w-full lg:w-80 shrink-0 space-y-5 no-print">
      {/* Control Header Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 sm:p-5">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                Menu de Controle
              </h2>
              <p className="text-[11px] text-slate-500">Gestão & Filtros</p>
            </div>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-md transition-colors"
              title="Limpar todos os filtros ativos"
            >
              <X className="w-3 h-3" />
              <span>Limpar</span>
            </button>
          )}
        </div>

        {/* Primary Action Button */}
        <div className="pt-3.5 space-y-2">
          <button
            onClick={handleNovoChamado}
            className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Novo Chamado Corporativo</span>
          </button>

          <button
            onClick={resetarDados}
            className="w-full py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5"
            title="Restaura os dados originais com o chamado ORC-420"
          >
            <RotateCcw className="w-3 h-3 text-slate-500" />
            <span>Restaurar Base Mock Bravi</span>
          </button>
        </div>

        {/* Search Field */}
        <div className="pt-4 mt-4 border-t border-slate-200">
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Busca de Chamado
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Código (ORC-420), título..."
              value={filtros.busca}
              onChange={(e) => setFiltros((prev) => ({ ...prev, busca: e.target.value }))}
              className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            {filtros.busca && (
              <button
                onClick={() => setFiltros((prev) => ({ ...prev, busca: '' }))}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Status Quick Flow */}
        <div className="pt-4 mt-4 border-t border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Status do Chamado
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              Total: {chamadosNoPeriodo.length}
            </span>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setFiltros((prev) => ({ ...prev, status: 'todos' }))}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                filtros.status === 'todos'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>Todos os Chamados</span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  filtros.status === 'todos'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {countByStatus('todos')}
              </span>
            </button>

            <button
              onClick={() => setFiltros((prev) => ({ ...prev, status: 'Em Andamento' }))}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                filtros.status === 'Em Andamento'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-indigo-900 hover:bg-indigo-50'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <PlayCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Em Andamento</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-indigo-100 text-indigo-800">
                {countByStatus('Em Andamento')}
              </span>
            </button>

            {/* Pendente de Aprovação */}
            <button
              onClick={() => setFiltros((prev) => ({ ...prev, status: 'Pendente de Aprovação' }))}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                filtros.status === 'Pendente de Aprovação'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'text-amber-900 hover:bg-amber-50'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">Pendente de Aprovação</span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  filtros.status === 'Pendente de Aprovação'
                    ? 'bg-amber-800 text-white'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {countByStatus('Pendente de Aprovação')}
              </span>
            </button>

            {/* Aprovado - Em Cotação */}
            <button
              onClick={() => setFiltros((prev) => ({ ...prev, status: 'Aprovado - Em Cotação' }))}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                filtros.status === 'Aprovado - Em Cotação'
                  ? 'bg-sky-600 text-white font-semibold'
                  : 'text-sky-900 hover:bg-sky-50'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <span className="truncate">Em Cotação</span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  filtros.status === 'Aprovado - Em Cotação'
                    ? 'bg-sky-800 text-white'
                    : 'bg-sky-100 text-sky-800'
                }`}
              >
                {countByStatus('Aprovado - Em Cotação')}
              </span>
            </button>

            {/* Em Execução */}
            <button
              onClick={() => setFiltros((prev) => ({ ...prev, status: 'Em Execução' }))}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                filtros.status === 'Em Execução'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-indigo-900 hover:bg-indigo-50'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <PlayCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="truncate">Em Execução</span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  filtros.status === 'Em Execução'
                    ? 'bg-indigo-800 text-white'
                    : 'bg-indigo-100 text-indigo-800'
                }`}
              >
                {countByStatus('Em Execução')}
              </span>
            </button>

            {/* Concluído */}
            <button
              onClick={() => setFiltros((prev) => ({ ...prev, status: 'Concluído' }))}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                filtros.status === 'Concluído'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-emerald-900 hover:bg-emerald-50'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">Concluídos</span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  filtros.status === 'Concluído'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {countByStatus('Concluído')}
              </span>
            </button>

            {/* Rejeitados */}
            <button
              onClick={() => setFiltros((prev) => ({ ...prev, status: 'Rejeitado' }))}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                filtros.status === 'Rejeitado'
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'text-rose-900 hover:bg-rose-50'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="truncate">Rejeitados / Ajuste</span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  filtros.status === 'Rejeitado'
                    ? 'bg-rose-800 text-white'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {countByStatus('Rejeitado')}
              </span>
            </button>
          </div>
        </div>

        {/* Filial & Categoria Selectors */}
        <div className="pt-4 mt-4 border-t border-slate-200 space-y-3">
          {/* Filial */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <span>Filial / Unidade</span>
            </label>
            <select
              value={filtros.filial}
              onChange={(e) => setFiltros((prev) => ({ ...prev, filial: e.target.value }))}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="todas">Todas as Filiais</option>
              {FILIAIS_LIST.map((filial) => (
                <option key={filial} value={filial}>
                  {filial}
                </option>
              ))}
            </select>
          </div>

          {/* Centro de Custo */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Centro de Custos</span>
            </label>
            <select
              value={filtros.centroDeCusto}
              onChange={(e) =>
                setFiltros((prev) => ({ ...prev, centroDeCusto: e.target.value }))
              }
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="todos">Todos os Centros de Custos</option>
              {CENTROS_DE_CUSTO_LIST.map((centro) => (
                <option key={centro} value={centro}>
                  {centro}
                </option>
              ))}
            </select>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Categoria</span>
            </label>
            <select
              value={filtros.categoria}
              onChange={(e) => setFiltros((prev) => ({ ...prev, categoria: e.target.value }))}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="todas">Todas as Categorias</option>
              {CATEGORIAS_LIST.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Urgência */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-slate-500" />
              <span>Nível de Urgência</span>
            </label>
            <select
              value={filtros.urgencia}
              onChange={(e) => setFiltros((prev) => ({ ...prev, urgencia: e.target.value }))}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="todas">Todas as Urgências</option>
              {URGENCIAS_LIST.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mini Executive Summary Card */}
      <div className="bg-slate-900 text-white rounded-xl p-4 shadow-xs border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Resumo Operacional
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-1.5">
            <span className="text-slate-400">Pendente de Parecer:</span>
            <span className="font-mono font-bold text-amber-400">
              {formatCurrency(stats.valorPendente)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Alocação Total:</span>
            <span className="font-mono font-bold text-sky-400">
              {formatCurrency(stats.valorTotalGeral)}
            </span>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 leading-tight pt-1">
          Padrão Bravi: ordens críticas têm SLA máximo de atendimento de 24h a 48h úteis.
        </p>
      </div>
    </aside>
  );
};
