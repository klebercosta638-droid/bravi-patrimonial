import React, { useState } from 'react';
import { usePatrimonial } from '../context/PatrimonialContext';
import { StatusBadge } from './StatusBadge';
import { UrgenciaBadge } from './UrgenciaBadge';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import {
  ArrowLeft,
  Printer,
  Edit3,
  Copy,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  User,
  DollarSign,
  FileCheck,
  ShieldAlert,
  Paperclip,
  Clock,
  QrCode,
  FileText,
  AlertTriangle,
  Send,
  Building,
  CreditCard,
  Briefcase,
  Layers,
} from 'lucide-react';
import { Chamado, StatusChamado } from '../types/patrimonial';

interface ChamadoDetailViewProps {
  onOpenApprovalModal: (chamado: Chamado, action: 'aprovar' | 'rejeitar' | 'avancar') => void;
}

export const ChamadoDetailView: React.FC<ChamadoDetailViewProps> = ({ onOpenApprovalModal }) => {
  const { selectedChamado, setActiveView, selectChamado, duplicarChamado } = usePatrimonial();

  if (!selectedChamado) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <p className="text-base font-semibold text-slate-800">Nenhum chamado selecionado</p>
        <button
          onClick={() => setActiveView('dashboard')}
          className="mt-4 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium"
        >
          Voltar ao painel
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Action Header (Hidden in Print) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('dashboard')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Painel</span>
          </button>
          <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>
          <span className="text-xs font-mono font-bold text-slate-500 hidden sm:inline">
            Protocolo: {selectedChamado.id}
          </span>
        </div>

        {/* Workflow & Utility Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Print button */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Imprimir / Gerar PDF</span>
          </button>

          {/* Edit button */}
          <button
            onClick={() => selectChamado(selectedChamado, 'edit')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
            <span>Editar</span>
          </button>

          {/* Duplicate button */}
          <button
            onClick={() => duplicarChamado(selectedChamado.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-slate-600" />
            <span>Duplicar</span>
          </button>

          {/* Rejection / Solicitar Ajuste */}
          {selectedChamado.status !== 'Concluído' && selectedChamado.status !== 'Rejeitado' && (
            <button
              onClick={() => onOpenApprovalModal(selectedChamado, 'rejeitar')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Rejeitar / Ajuste</span>
            </button>
          )}

          {/* Approval / Next Stage */}
          {selectedChamado.status === 'Pendente de Aprovação' && (
            <button
              onClick={() => onOpenApprovalModal(selectedChamado, 'aprovar')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Aprovar Chamado</span>
            </button>
          )}

          {selectedChamado.status === 'Aprovado - Em Cotação' && (
            <button
              onClick={() => onOpenApprovalModal(selectedChamado, 'avancar')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Iniciar Execução</span>
            </button>
          )}

          {selectedChamado.status === 'Em Execução' && (
            <button
              onClick={() => onOpenApprovalModal(selectedChamado, 'avancar')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors"
            >
              <FileCheck className="w-4 h-4" />
              <span>Concluir e Baixar Ativo</span>
            </button>
          )}
        </div>
      </div>

      {/* DOCUMENT CONTAINER - Official Bravi Document Style */}
      <div className="print-document bg-white rounded-2xl border border-slate-300 shadow-md p-6 sm:p-10 max-w-5xl mx-auto space-y-8 font-sans">
        {/* Document Header */}
        <div className="border-b-2 border-slate-800 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            {/* Corporate Logo & Title */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm border border-slate-800">
                <Building2 className="w-8 h-8 text-sky-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                    BRAVI PATRIMONIAL
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-300 rounded">
                    Documento Oficial
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-600">
                  Departamento de Engenharia, Infraestrutura & Suprimentos Corporativos
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  CNPJ: 19.345.890/0001-44 • Inscrição Estadual: 104.992.441.110
                </p>
              </div>
            </div>

            {/* Protocol & Verification Stamp */}
            <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6 shrink-0 flex flex-col sm:items-end justify-between">
              <div className="bg-slate-50 border border-slate-300 rounded-lg p-2.5 inline-block text-right">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                  ORDEM DE REQUISIÇÃO
                </span>
                <span className="text-xl font-mono font-black text-slate-900 tracking-wider">
                  {selectedChamado.id}
                </span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5 justify-end">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Emissão: {formatDate(selectedChamado.dataAbertura)}</span>
              </div>
            </div>
          </div>

          {/* Title and Current Status Banner */}
          <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                Objeto da Requisição
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-950 mt-0.5">
                {selectedChamado.titulo}
              </h2>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-500 font-medium">Status Atual:</span>
              <StatusBadge status={selectedChamado.status} size="lg" />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BLOCO 1: DETALHES DA SOLICITAÇÃO                         */}
        {/* ======================================================== */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200">
            <div className="w-2 h-2 rounded-full bg-blue-700"></div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Detalhes da Solicitação
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50/80 border border-slate-200">
            {/* Unidade / Filial */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block uppercase">
                Unidade / Filial
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <Building className="w-4 h-4 text-blue-700 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  {selectedChamado.filial}
                </span>
              </div>
            </div>

            {/* Centro de Custo */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block uppercase">
                Centro de Custo / Área
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <Briefcase className="w-4 h-4 text-slate-600 shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-slate-800">
                  {selectedChamado.centroDeCusto}
                </span>
              </div>
            </div>

            {/* Solicitante */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block uppercase">
                Solicitante & Cargo
              </span>
              <div className="mt-1">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-600 shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    {selectedChamado.solicitanteNome}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 block">
                  {selectedChamado.solicitanteCargo} • {selectedChamado.solicitanteRamal}
                </span>
                {selectedChamado.solicitanteTelefone && (
                  <span className="text-[11px] text-slate-500 block">
                    Telefone: {selectedChamado.solicitanteTelefone}
                  </span>
                )}
              </div>
            </div>

            {/* Prazos & Urgência */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block uppercase">
                Urgência & Prazo Limite
              </span>
              <div className="flex items-center gap-2 mt-1">
                <UrgenciaBadge urgencia={selectedChamado.urgencia} size="sm" />
                <span className="text-xs text-slate-700 font-medium">
                  {formatDate(selectedChamado.previsaoConclusao)}
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-white border border-slate-200">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block uppercase">
                Categoria da Requisição
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-800 mt-1 block">
                {selectedChamado.categoria}
              </span>
            </div>
            {selectedChamado.categoria === 'Serviços Logísticos / Veículos' && (
              <>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block uppercase">
                    Placa do Veículo
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 mt-1 block">
                    {selectedChamado.placaVeiculo}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block uppercase">
                    Tipo do Veículo
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 mt-1 block">
                    {selectedChamado.tipoVeiculo}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block uppercase">
                    Condutor do Veículo
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 mt-1 block">
                    {selectedChamado.condutorVeiculo}
                  </span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ======================================================== */}
        {/* BLOCO 2: DADOS FINANCEIROS / FORNECEDOR                  */}
        {/* ======================================================== */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200">
            <div className="w-2 h-2 rounded-full bg-blue-700"></div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              2. Dados Financeiros & Fornecedor
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card Valor Total */}
            <div className="p-4 bg-slate-900 text-white rounded-xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                Valor Total da Ordem
              </span>
              <div className="text-2xl font-mono font-black text-sky-400 mt-1">
                {formatCurrency(selectedChamado.valorTotalGeral)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Soma de todos os itens e serviços discriminados
              </p>
            </div>

            {/* Card Fornecedor & Forma Pagamento */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-900">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Fornecedor & Pagamento
              </span>
              <div className="font-bold text-xs sm:text-sm text-slate-900 mt-1 truncate">
                {selectedChamado.fornecedorSugerido || 'A Definir / Cotação Aberta'}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium mt-1">
                <CreditCard className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{selectedChamado.formaPagamento}</span>
              </div>
              {selectedChamado.formaPagamento === 'Boleto' && selectedChamado.prazoFaturamento && (
                <p className="text-[11px] text-slate-500 mt-1">
                  Faturamento: {selectedChamado.prazoFaturamento}
                </p>
              )}
              {selectedChamado.formaPagamento === 'Cartão de Crédito' &&
                selectedChamado.parcelasCartao && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Parcelas: {selectedChamado.parcelasCartao}x
                  </p>
                )}
            </div>
          </div>

          {/* Justificativa da Solicitação */}
          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Justificativa Técnica e Operacional:
            </span>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-normal">
              {selectedChamado.justificativa}
            </p>
            {selectedChamado.observacoesInternas && (
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg">
                <strong className="text-slate-800">Observações Internas da Gerência:</strong>{' '}
                {selectedChamado.observacoesInternas}
              </div>
            )}
          </div>
        </section>

        {/* ======================================================== */}
        {/* BLOCO 3: QUADRO DE ITENS                                */}
        {/* ======================================================== */}
        <section className="space-y-3">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-700"></div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                3. Quadro de Itens e Especificações
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Total de itens: {selectedChamado.itens.length}
            </span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3 font-mono">Código</th>
                  <th className="py-2.5 px-3">Descrição Detalhada do Item / Serviço</th>
                  <th className="py-2.5 px-3 text-center">UN</th>
                  <th className="py-2.5 px-3 text-right">Qtd</th>
                  <th className="py-2.5 px-3 text-right">Valor Unitário</th>
                  <th className="py-2.5 px-3 text-right">Valor Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {selectedChamado.itens.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                      {item.codigo || `ITM-0${index + 1}`}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 font-medium">
                      {item.descricao}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-600 font-mono text-xs">
                      {item.unidade}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                      {item.quantidade}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      {formatCurrency(item.valorUnitario)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-950">
                      {formatCurrency(item.valorTotal || item.quantidade * item.valorUnitario)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100/90 font-bold border-t-2 border-slate-300">
                  <td colSpan={4} className="py-3 px-3 text-right text-xs uppercase tracking-wider text-slate-700">
                    Subtotal Geral dos Itens:
                  </td>
                  <td colSpan={2} className="py-3 px-3 text-right font-mono text-base text-slate-950 font-black">
                    {formatCurrency(selectedChamado.valorTotalGeral)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* ======================================================== */}
        {/* BLOCO 4: ROTEIRO DE ASSINATURAS (APROVAÇÃO FINANCEIRA)   */}
        {/* ======================================================== */}
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-700"></div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                4. Roteiro de Assinaturas & Validação Institucional
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Padrão ICP-Bravi v2.4</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {selectedChamado.roteiroAssinaturas.map((sig, idx) => {
              const isApproved = sig.status === 'Aprovado';
              const isPending = sig.status === 'Pendente';
              const isRejected = sig.status === 'Rejeitado';

              return (
                <div
                  key={sig.id || idx}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between min-h-[140px] transition-all ${
                    isApproved
                      ? 'bg-emerald-50/40 border-emerald-300'
                      : isRejected
                      ? 'bg-rose-50/40 border-rose-300'
                      : isPending
                      ? 'bg-amber-50/40 border-amber-300 shadow-xs'
                      : 'bg-slate-50 border-slate-200 opacity-75'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-600 uppercase tracking-wider">{sig.etapa}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isApproved
                            ? 'bg-emerald-100 text-emerald-800'
                            : isRejected
                            ? 'bg-rose-100 text-rose-800'
                            : isPending
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {sig.status}
                      </span>
                    </div>

                    <div className="mt-2">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {sig.nomeResponsavel}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{sig.cargo}</p>
                    </div>
                  </div>

                  {/* Signature rubber stamp simulation */}
                  <div className="mt-3 pt-2 border-t border-slate-200/80">
                    {isApproved && (
                      <div className="text-[10px] text-emerald-800">
                        <div className="font-mono font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{sig.rubricaCodigo || 'BRV-AUT-OK'}</span>
                        </div>
                        <span className="text-[9px] text-slate-500 block">
                          Assinado em {formatDateTime(sig.dataAssinatura)}
                        </span>
                      </div>
                    )}

                    {isPending && (
                      <div className="text-[10px] text-amber-700 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Aguardando parecer</span>
                      </div>
                    )}

                    {isRejected && (
                      <div className="text-[10px] text-rose-700">
                        <div className="font-bold flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Rejeitado</span>
                        </div>
                        <span className="text-[9px] text-slate-500 block truncate">
                          {sig.observacao || 'Recusado'}
                        </span>
                      </div>
                    )}

                    {sig.status === 'Aguardando' && (
                      <span className="text-[10px] text-slate-400 italic">
                        Etapa posterior
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ======================================================== */}
        {/* BLOCO 5: ANEXOS & HISTÓRICO DE AUDITORIA                */}
        {/* ======================================================== */}
        <section className="pt-2 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Anexos */}
          <div>
            <h4 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider mb-2 flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-slate-500" />
              Documentos & Comprovações Anexadas ({selectedChamado.anexos?.length || 0})
            </h4>
            {selectedChamado.anexos && selectedChamado.anexos.length > 0 ? (
              <div className="space-y-1.5">
                {selectedChamado.anexos.map((anx) => (
                  <div
                    key={anx.id}
                    className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{anx.nome}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">
                      {anx.tamanho}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic">Nenhum anexo digital vinculado.</p>
            )}
          </div>

          {/* Histórico / Trilha de Auditoria */}
          <div>
            <h4 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Trilha de Auditoria e Histórico
            </h4>
            <div className="space-y-2 border-l-2 border-slate-200 pl-3">
              {selectedChamado.historico.map((h) => (
                <div key={h.id} className="relative">
                  <div className="text-[11px] text-slate-800 font-semibold">{h.acao}</div>
                  <div className="text-[10px] text-slate-500">
                    Por {h.usuario} ({h.cargo}) • {formatDateTime(h.dataHora)}
                  </div>
                  {h.comentario && (
                    <div className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded mt-1 border border-slate-200">
                      "{h.comentario}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Document Footer Barcode & Legal Notice */}
        <div className="pt-6 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-[10px] gap-3">
          <div>
            <p className="font-mono">AUT-VERIFY-SHA256: {selectedChamado.id}-89F2A-4491-BRAVI</p>
            <p>Gerado pelo Sistema Integrado Bravi Patrimonial. Validade jurídica corporativa.</p>
          </div>
          <div className="flex items-center gap-2">
            <QrCode className="w-8 h-8 text-slate-400" />
            <span className="font-mono text-slate-500 font-semibold text-xs">
              DOC-{selectedChamado.id}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
