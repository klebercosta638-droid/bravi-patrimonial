import React from 'react';
import { usePatrimonial } from '../context/PatrimonialContext';
import { formatCurrency } from '../utils/formatters';
import { FileText, Clock, PlayCircle, CheckCircle2, DollarSign } from 'lucide-react';

export const KpiMetrics: React.FC = () => {
  const { stats, filtros, setFiltros } = usePatrimonial();

  const handleCardClick = (statusFilter: string) => {
    setFiltros((prev) => ({
      ...prev,
      status: prev.status === statusFilter ? 'todos' : statusFilter,
    }));
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 mb-5 no-print">
      {/* Total de Chamados */}
      <div
        onClick={() => handleCardClick('todos')}
        className={`p-4 bg-white rounded-xl border transition-all cursor-pointer hover:shadow-sm ${
          filtros.status === 'todos'
            ? 'border-slate-400 ring-2 ring-slate-200'
            : 'border-slate-200/90'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Registrado
          </span>
          <div className="p-1.5 rounded-md bg-slate-100 text-slate-700">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{stats.total}</span>
          <span className="text-xs text-slate-500">processos</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Todas as filiais</p>
      </div>

      {/* Pendentes de Aprovação */}
      <div
        onClick={() => handleCardClick('Pendente de Aprovação')}
        className={`p-4 bg-white rounded-xl border transition-all cursor-pointer hover:shadow-sm ${
          filtros.status === 'Pendente de Aprovação'
            ? 'border-amber-400 ring-2 ring-amber-100 bg-amber-50/20'
            : 'border-slate-200/90'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            Pendentes
          </span>
          <div className="p-1.5 rounded-md bg-amber-100 text-amber-800">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-900">{stats.pendentes}</span>
          <span className="text-xs text-amber-700">aguardando</span>
        </div>
        <p className="text-[11px] text-amber-600/80 mt-1">Requer aprovação imediata</p>
      </div>

      {/* Em Execução */}
      <div
        onClick={() => handleCardClick('Em Andamento')}
        className={`p-4 bg-white rounded-xl border transition-all cursor-pointer hover:shadow-sm ${
          filtros.status === 'Em Andamento'
            ? 'border-indigo-400 ring-2 ring-indigo-100 bg-indigo-50/20'
            : 'border-slate-200/90'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
            Em Andamento
          </span>
          <div className="p-1.5 rounded-md bg-indigo-100 text-indigo-800">
            <PlayCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-indigo-900">{stats.emExecucao}</span>
          <span className="text-xs text-indigo-700">ativos</span>
        </div>
        <p className="text-[11px] text-indigo-600/80 mt-1">Cotação ou execução</p>
      </div>

      {/* Concluídos */}
      <div
        onClick={() => handleCardClick('Concluído')}
        className={`p-4 bg-white rounded-xl border transition-all cursor-pointer hover:shadow-sm ${
          filtros.status === 'Concluído'
            ? 'border-emerald-400 ring-2 ring-emerald-100 bg-emerald-50/20'
            : 'border-slate-200/90'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            Concluídos
          </span>
          <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-900">{stats.concluidos}</span>
          <span className="text-xs text-emerald-700">finalizados</span>
        </div>
        <p className="text-[11px] text-emerald-600/80 mt-1">Entregas auditadas</p>
      </div>

      {/* Volume Financeiro */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/90 col-span-2 sm:col-span-1 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Volume Global
          </span>
          <div className="p-1.5 rounded-md bg-blue-100 text-blue-800">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight block truncate">
            {formatCurrency(stats.valorTotalGeral)}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1 truncate">
          Pendente: {formatCurrency(stats.valorPendente)}
        </p>
      </div>
    </div>
  );
};
