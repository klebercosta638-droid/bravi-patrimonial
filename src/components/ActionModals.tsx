import React, { useState } from 'react';
import { Chamado, StatusChamado } from '../types/patrimonial';
import { AlertTriangle, CheckCircle2, XCircle, Trash2, Send, X, Loader2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface DeleteModalProps {
  isOpen: boolean;
  chamado: Chamado | null;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  chamado,
  isSaving,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !chamado) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 text-center">Excluir Chamado?</h3>
        <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
          Tem certeza que deseja excluir o chamado{' '}
          <strong className="text-slate-900">{chamado.id}</strong> (
          {chamado.titulo})? Esta operação é irreversível e removerá o histórico de auditoria.
        </p>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            <span>Confirmar Exclusão</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface WorkflowModalProps {
  isOpen: boolean;
  chamado: Chamado | null;
  action: 'aprovar' | 'rejeitar' | 'avancar';
  isSaving: boolean;
  onClose: () => void;
  onConfirm: (observacao: string) => void;
}

export const WorkflowModal: React.FC<WorkflowModalProps> = ({
  isOpen,
  chamado,
  action,
  isSaving,
  onClose,
  onConfirm,
}) => {
  const [observacao, setObservacao] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !chamado) return null;

  const isReject = action === 'rejeitar';
  const isApprove = action === 'aprovar';

  const handleConfirm = () => {
    if (isReject && !observacao.trim()) {
      setError('Informe o motivo ou exigência de ajuste para rejeitar.');
      return;
    }
    onConfirm(observacao.trim());
    setObservacao('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
        <div className="flex items-start justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-lg ${
                isReject
                  ? 'bg-rose-100 text-rose-700'
                  : isApprove
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              {isReject ? (
                <XCircle className="w-5 h-5" />
              ) : isApprove ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isReject
                  ? 'Rejeitar / Solicitar Ajustes no Chamado'
                  : isApprove
                  ? 'Aprovação Formal de Chamado'
                  : 'Avançar Etapa do Fluxo'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Protocolo: {chamado.id} • Valor: {formatCurrency(chamado.valorTotalGeral)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            {isReject ? (
              <span>
                Ao rejeitar o chamado, a solicitação retornará com status de pendência.
                Por favor informe a justificativa detalhada para o solicitante (
                <strong>{chamado.solicitanteNome}</strong>).
              </span>
            ) : isApprove ? (
              <span>
                Você está emitindo o parecer favorável institucional para a execução desta
                ordem. Uma rubrica criptográfica de auditoria será gerada em nome do gestor.
              </span>
            ) : (
              <span>
                Confirma o avanço deste chamado para a próxima fase operacional (cotação,
                ordem de compra ou entrega final)?
              </span>
            )}
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isReject
                ? 'Motivo da Rejeição / Diretrizes de Ajuste *'
                : 'Observações Institucionais (Opcional)'}
            </label>
            <textarea
              rows={3}
              value={observacao}
              onChange={(e) => {
                setObservacao(e.target.value);
                if (error) setError('');
              }}
              placeholder={
                isReject
                  ? 'Ex: Necessário anexar 3 cotações de fornecedores cadastrados conforme política de compras...'
                  : 'Ex: Parecer favorável emitido em conformidade com o orçamento vigente.'
              }
              className={`w-full px-3.5 py-2 text-xs bg-white border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              }`}
            />
            {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSaving}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-lg shadow-sm transition-colors ${
              isReject
                ? 'bg-rose-600 hover:bg-rose-700'
                : isApprove
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            <span>
              {isReject ? 'Confirmar Rejeição' : isApprove ? 'Aprovar e Rubricar' : 'Avançar Etapa'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
