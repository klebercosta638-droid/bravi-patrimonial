import React, { useMemo } from 'react';
import { usePatrimonial } from '../context/PatrimonialContext';
import { FILIAIS_LIST } from '../data/mockData';
import {
  calcularPrazoAtendimento,
  classificarPrazoAtendimento,
} from '../utils/formatters';
import { AlertTriangle, Building2, Clock3 } from 'lucide-react';

const STATUS_EM_ANDAMENTO = ['Aprovado - Em Cotação', 'Em Execução'];
const STATUS_ABERTOS = [
  'Pendente de Aprovação',
  'Aprovado - Em Cotação',
  'Em Execução',
];

export const DashboardInsights: React.FC = () => {
  const { chamados, filtros, setFiltros } = usePatrimonial();

  const chamadosBase = useMemo(
    () =>
      chamados.filter(
        (chamado) =>
          (filtros.centroDeCusto === 'todos' ||
            chamado.centroDeCusto === filtros.centroDeCusto) &&
          (filtros.categoria === 'todas' || chamado.categoria === filtros.categoria)
      ),
    [chamados, filtros.centroDeCusto, filtros.categoria]
  );

  const dadosFiliais = useMemo(
    () =>
      FILIAIS_LIST.map((filial) => {
        const destaFilial = chamadosBase.filter((chamado) => chamado.filial === filial);
        return {
          filial,
          pendentes: destaFilial.filter((chamado) => chamado.status === 'Pendente de Aprovação')
            .length,
          emAndamento: destaFilial.filter((chamado) =>
            STATUS_EM_ANDAMENTO.includes(chamado.status)
          ).length,
          concluidos: destaFilial.filter((chamado) => chamado.status === 'Concluído').length,
        };
      }),
    [chamadosBase]
  );

  const maioresVolumes = dadosFiliais.reduce(
    (maiores, filial) => ({
      pendentes: Math.max(maiores.pendentes, filial.pendentes),
      emAndamento: Math.max(maiores.emAndamento, filial.emAndamento),
      concluidos: Math.max(maiores.concluidos, filial.concluidos),
    }),
    { pendentes: 0, emAndamento: 0, concluidos: 0 }
  );

  const chamadosParaAlertas = useMemo(
    () =>
      chamadosBase.filter((chamado) => {
        const consulta = filtros.busca.trim().toLowerCase();
        if (
          consulta &&
          !chamado.id.toLowerCase().includes(consulta) &&
          !chamado.titulo.toLowerCase().includes(consulta) &&
          !chamado.solicitanteNome.toLowerCase().includes(consulta)
        ) {
          return false;
        }
        if (filtros.filial !== 'todas' && chamado.filial !== filtros.filial) return false;
        if (filtros.urgencia !== 'todas' && chamado.urgencia !== filtros.urgencia) return false;
        if (filtros.status === 'Em Andamento' && !STATUS_EM_ANDAMENTO.includes(chamado.status)) {
          return false;
        }
        if (
          filtros.status !== 'todos' &&
          filtros.status !== 'Em Andamento' &&
          chamado.status !== filtros.status
        ) {
          return false;
        }
        return STATUS_ABERTOS.includes(chamado.status);
      }),
    [chamadosBase, filtros.busca, filtros.filial, filtros.status, filtros.urgencia]
  );

  const alertasPrazo = useMemo(() => {
    const agora = Date.now();
    return chamadosParaAlertas.reduce(
      (totais, chamado) => {
        const prazo = calcularPrazoAtendimento(chamado.dataAbertura, chamado.urgencia);
        const estado = classificarPrazoAtendimento(prazo, agora);
        if (estado === 'vencido') totais.vencidos += 1;
        if (estado === 'proximo') totais.proximos += 1;
        return totais;
      },
      { vencidos: 0, proximos: 0 }
    );
  }, [chamadosParaAlertas]);

  const filtrarPorFilialEStatus = (filial: string, status: string) => {
    setFiltros((prev) => ({ ...prev, filial, status }));
  };

  return (
    <div className="space-y-4 no-print">
      <section className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-700" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Requisições por Filial e Estado</h2>
            <p className="text-[11px] text-slate-500">
              Selecione uma célula para filtrar a tabela. Os totais acompanham Centro de Custos e Categoria.
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-2 font-bold">Filial</th>
                <th className="px-3 py-2 text-center font-bold">Pendentes</th>
                <th className="px-3 py-2 text-center font-bold">Em Andamento</th>
                <th className="px-3 py-2 text-center font-bold">Concluídos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dadosFiliais.map(({ filial, pendentes, emAndamento, concluidos }) => (
                  <tr key={filial} className="hover:bg-slate-50">
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-700">
                      {filial}
                    </th>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => filtrarPorFilialEStatus(filial, 'Pendente de Aprovação')}
                        aria-label={`${pendentes} pendentes em ${filial}`}
                        className={`min-w-10 rounded-md px-2 py-1 font-bold ${
                          filtros.filial === filial && filtros.status === 'Pendente de Aprovação'
                            ? 'bg-amber-600 text-white'
                            : `bg-amber-50 text-amber-800 hover:bg-amber-100 ${
                                pendentes > 0 && pendentes === maioresVolumes.pendentes
                                  ? 'ring-2 ring-amber-300 font-black'
                                  : ''
                              }`
                        }`}
                      >
                        {pendentes}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => filtrarPorFilialEStatus(filial, 'Em Andamento')}
                        aria-label={`${emAndamento} em andamento em ${filial}`}
                        className={`min-w-10 rounded-md px-2 py-1 font-bold ${
                          filtros.filial === filial && filtros.status === 'Em Andamento'
                            ? 'bg-indigo-600 text-white'
                            : `bg-indigo-50 text-indigo-800 hover:bg-indigo-100 ${
                                emAndamento > 0 && emAndamento === maioresVolumes.emAndamento
                                  ? 'ring-2 ring-indigo-300 font-black'
                                  : ''
                              }`
                        }`}
                      >
                        {emAndamento}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => filtrarPorFilialEStatus(filial, 'Concluído')}
                        aria-label={`${concluidos} concluídos em ${filial}`}
                        className={`min-w-10 rounded-md px-2 py-1 font-bold ${
                          filtros.filial === filial && filtros.status === 'Concluído'
                            ? 'bg-emerald-600 text-white'
                            : `bg-emerald-50 text-emerald-800 hover:bg-emerald-100 ${
                                concluidos > 0 && concluidos === maioresVolumes.concluidos
                                  ? 'ring-2 ring-emerald-300 font-black'
                                  : ''
                              }`
                        }`}
                      >
                        {concluidos}
                      </button>
                    </td>
                  </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-slate-200 bg-slate-50 text-xs font-bold text-slate-700">
              <tr>
                <th className="px-4 py-2.5 text-left">Total</th>
                <td className="px-3 py-2.5 text-center">
                  {dadosFiliais.reduce((total, filial) => total + filial.pendentes, 0)}
                </td>
                <td className="px-3 py-2.5 text-center">
                  {dadosFiliais.reduce((total, filial) => total + filial.emAndamento, 0)}
                </td>
                <td className="px-3 py-2.5 text-center">
                  {dadosFiliais.reduce((total, filial) => total + filial.concluidos, 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Alerta de Prazos de Atendimento</h2>
            <p className="text-[11px] text-slate-500">
              Considera chamados abertos; prazo calculado pela data de abertura e nível de urgência.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <div>
              <div className="text-xs font-bold text-rose-800">Vencidos</div>
              <div className="text-lg leading-5 font-bold text-rose-900">{alertasPrazo.vencidos}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
            <Clock3 className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <div className="text-xs font-bold text-amber-800">Vencem nos próximos 2 dias</div>
              <div className="text-lg leading-5 font-bold text-amber-900">{alertasPrazo.proximos}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
