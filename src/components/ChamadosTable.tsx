import React, { useMemo, useState } from 'react';
import { usePatrimonial } from '../context/PatrimonialContext';
import { StatusBadge } from './StatusBadge';
import { UrgenciaBadge } from './UrgenciaBadge';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Eye,
  Edit3,
  Copy,
  Trash2,
  FileText,
  AlertCircle,
  ArrowUpDown,
  Filter,
  X,
} from 'lucide-react';
import { Chamado } from '../types/patrimonial';

interface ChamadosTableProps {
  onDeleteRequest: (chamado: Chamado) => void;
}

export const ChamadosTable: React.FC<ChamadosTableProps> = ({ onDeleteRequest }) => {
  const {
    chamados,
    filtros,
    setFiltros,
    selectChamado,
    duplicarChamado,
    isLoading,
  } = usePatrimonial();

  const [sortField, setSortField] = useState<'id' | 'dataAbertura' | 'valorTotalGeral' | 'urgencia'>('dataAbertura');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Filtered and Sorted tickets
  const filteredChamados = useMemo(() => {
    return chamados
      .filter((c) => {
        // Search query
        if (filtros.busca.trim()) {
          const q = filtros.busca.toLowerCase();
          const matchId = c.id.toLowerCase().includes(q);
          const matchTitulo = c.titulo.toLowerCase().includes(q);
          const matchSolicitante = c.solicitanteNome.toLowerCase().includes(q);
          const matchJustificativa = c.justificativa.toLowerCase().includes(q);
          const matchFornecedor = c.fornecedorSugerido?.toLowerCase().includes(q);
          if (!matchId && !matchTitulo && !matchSolicitante && !matchJustificativa && !matchFornecedor) {
            return false;
          }
        }

        // Filial filter
        if (filtros.filial !== 'todas' && c.filial !== filtros.filial) {
          return false;
        }

        // Status filter
        if (filtros.status !== 'todos' && c.status !== filtros.status) {
          return false;
        }

        // Categoria filter
        if (filtros.categoria !== 'todas' && c.categoria !== filtros.categoria) {
          return false;
        }

        // Urgencia filter
        if (filtros.urgencia !== 'todas' && c.urgencia !== filtros.urgencia) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'id') {
          const numA = parseInt(a.id.replace(/\D/g, '') || '0', 10);
          const numB = parseInt(b.id.replace(/\D/g, '') || '0', 10);
          diff = numA - numB;
        } else if (sortField === 'valorTotalGeral') {
          diff = a.valorTotalGeral - b.valorTotalGeral;
        } else if (sortField === 'urgencia') {
          const weights: Record<string, number> = {
            'Crítica/Emergencial': 4,
            Alta: 3,
            Média: 2,
            Baixa: 1,
          };
          diff = (weights[a.urgencia] || 0) - (weights[b.urgencia] || 0);
        } else {
          diff = new Date(a.dataAbertura).getTime() - new Date(b.dataAbertura).getTime();
        }
        return sortAsc ? diff : -diff;
      });
  }, [chamados, filtros, sortField, sortAsc]);

  const handleSort = (field: 'id' | 'dataAbertura' | 'valorTotalGeral' | 'urgencia') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleResetFilters = () => {
    setFiltros({
      busca: '',
      filial: 'todas',
      status: 'todos',
      categoria: 'todas',
      urgencia: 'todas',
    });
  };

  const hasActiveFilters =
    filtros.busca !== '' ||
    filtros.filial !== 'todas' ||
    filtros.status !== 'todos' ||
    filtros.categoria !== 'todas' ||
    filtros.urgencia !== 'todas';

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Table Header with status summaries & active filter indicators */}
      <div className="p-4 sm:px-5 border-b border-slate-200/80 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Quadro de Requisições
            </h3>
            <span className="text-xs bg-slate-200/80 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
              {filteredChamados.length} {filteredChamados.length === 1 ? 'chamado' : 'chamados'}
            </span>
          </div>

          {/* Active Filters Badges */}
          {hasActiveFilters && (
            <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
              {filtros.busca && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">
                  Busca: "{filtros.busca}"
                  <button onClick={() => setFiltros((p) => ({ ...p, busca: '' }))}>
                    <X className="w-3 h-3 hover:text-blue-900" />
                  </button>
                </span>
              )}
              {filtros.filial !== 'todas' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">
                  Filial: {filtros.filial.split(' - ')[0]}
                  <button onClick={() => setFiltros((p) => ({ ...p, filial: 'todas' }))}>
                    <X className="w-3 h-3 hover:text-blue-900" />
                  </button>
                </span>
              )}
              {filtros.status !== 'todos' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">
                  Status: {filtros.status}
                  <button onClick={() => setFiltros((p) => ({ ...p, status: 'todos' }))}>
                    <X className="w-3 h-3 hover:text-amber-900" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Clear Filters / Actions */}
        <div className="flex items-center gap-2 text-xs">
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="font-semibold text-blue-700 hover:text-blue-900 transition-colors"
            >
              Limpar filtros
            </button>
          )}
          <span className="text-slate-400 hidden sm:inline">•</span>
          <span className="text-slate-500 text-[11px] hidden sm:inline">
            Clique no título da coluna para ordenar
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/90 text-slate-600 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
              <th
                onClick={() => handleSort('id')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>ID / Protocolo</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 whitespace-nowrap">Filial & Centro de Custo</th>
              <th className="py-3 px-4">Solicitante & Título</th>
              <th className="py-3 px-4 whitespace-nowrap">Categoria</th>
              <th className="py-3 px-4 whitespace-nowrap">Status</th>
              <th
                onClick={() => handleSort('urgencia')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>Urgência</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('valorTotalGeral')}
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 select-none whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Valor Total</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-center whitespace-nowrap">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80 text-sm">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-4">
                    <div className="h-5 bg-slate-200 rounded w-16"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-slate-200 rounded w-28 mb-1"></div>
                    <div className="h-3 bg-slate-100 rounded w-20"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-slate-200 rounded w-44 mb-1"></div>
                    <div className="h-3 bg-slate-100 rounded w-24"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-slate-200 rounded w-24"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-6 bg-slate-200 rounded-full w-24"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="h-5 bg-slate-200 rounded w-20 ml-auto"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-8 bg-slate-200 rounded w-20 mx-auto"></div>
                  </td>
                </tr>
              ))
            ) : filteredChamados.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  <AlertCircle className="w-9 h-9 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">Nenhum chamado encontrado</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Tente ajustar seus termos de busca ou filtros no menu de controle à direita.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-3 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                  >
                    Redefinir filtros
                  </button>
                </td>
              </tr>
            ) : (
              filteredChamados.map((chamado) => {
                const isOrc420 = chamado.id === 'ORC-420';
                return (
                  <tr
                    key={chamado.id}
                    className={`hover:bg-blue-50/40 transition-colors group ${
                      isOrc420 ? 'bg-amber-50/15' : ''
                    }`}
                  >
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      <button
                        onClick={() => selectChamado(chamado, 'detail')}
                        className="flex items-center gap-1.5 text-blue-700 hover:text-blue-900 hover:underline group-hover:translate-x-0.5 transition-transform"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                        <span>{chamado.id}</span>
                      </button>
                    </td>

                    {/* Filial & Centro de Custo */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 text-xs sm:text-sm">
                        {chamado.filial}
                      </div>
                      <div className="text-[11px] text-slate-500 font-normal">
                        {chamado.centroDeCusto}
                      </div>
                    </td>

                    {/* Solicitante & Titulo */}
                    <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                      <div className="font-semibold text-slate-900 text-xs sm:text-sm line-clamp-1">
                        {chamado.titulo}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-medium text-slate-700">{chamado.solicitanteNome}</span>
                        <span>•</span>
                        <span>{formatDate(chamado.dataAbertura)}</span>
                      </div>
                    </td>

                    {/* Categoria */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-700 font-medium">
                      {chamado.categoria}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={chamado.status} size="sm" />
                    </td>

                    {/* Urgência */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <UrgenciaBadge urgencia={chamado.urgencia} size="sm" />
                    </td>

                    {/* Valor Total */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-semibold text-slate-900">
                      {formatCurrency(chamado.valorTotalGeral)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {/* Visualizar Documento */}
                        <button
                          onClick={() => selectChamado(chamado, 'detail')}
                          title="Visualizar documento oficial"
                          className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-100/70 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Editar */}
                        <button
                          onClick={() => selectChamado(chamado, 'edit')}
                          title="Editar chamado"
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Duplicar */}
                        <button
                          onClick={() => duplicarChamado(chamado.id)}
                          title="Duplicar chamado"
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {/* Excluir */}
                        <button
                          onClick={() => onDeleteRequest(chamado)}
                          title="Excluir chamado"
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Summary */}
      <div className="p-3.5 px-5 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div>
          Mostrando <strong className="text-slate-800">{filteredChamados.length}</strong> de{' '}
          <strong className="text-slate-800">{chamados.length}</strong> chamados registrados
        </div>
        <div className="flex items-center gap-3">
          <span>
            Total listado:{' '}
            <strong className="text-slate-900 font-mono text-sm">
              {formatCurrency(
                filteredChamados.reduce((acc, c) => acc + (c.valorTotalGeral || 0), 0)
              )}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
};
