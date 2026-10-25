import React, { useMemo } from 'react';
import { usePatrimonial } from '../context/PatrimonialContext';

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const DashboardPeriodFilters: React.FC = () => {
  const { chamados, filtros, setFiltros } = usePatrimonial();
  const anos = useMemo(() => {
    const anosChamados = chamados
      .map((chamado) => chamado.dataAbertura.slice(0, 4))
      .filter((ano) => /^\d{4}$/.test(ano));
    return [...new Set([...anosChamados, String(new Date().getFullYear())])].sort(
      (a, b) => Number(b) - Number(a)
    );
  }, [chamados]);

  return (
    <div className="flex flex-wrap items-end gap-3" aria-label="Filtros por período">
      <div>
        <label
          htmlFor="dashboard-year-filter"
          className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
        >
          Ano
        </label>
        <select
          id="dashboard-year-filter"
          value={filtros.ano}
          onChange={(event) => setFiltros((prev) => ({ ...prev, ano: event.target.value }))}
          className="min-w-32 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        >
          <option value="todos">Todos os anos</option>
          {anos.map((ano) => (
            <option key={ano} value={ano}>
              {ano}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="dashboard-month-filter"
          className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
        >
          Mês
        </label>
        <select
          id="dashboard-month-filter"
          value={filtros.mes}
          onChange={(event) => setFiltros((prev) => ({ ...prev, mes: event.target.value }))}
          className="min-w-36 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        >
          <option value="todos">Todos os meses</option>
          {MESES.map((mes, index) => {
            const valor = String(index + 1).padStart(2, '0');
            return (
              <option key={valor} value={valor}>
                {mes}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
};
