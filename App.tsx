import React, { useState } from 'react';
import { PatrimonialProvider, usePatrimonial } from './context/PatrimonialContext';
import { Header } from './components/Header';
import { KpiMetrics } from './components/KpiMetrics';
import { ChamadosTable } from './components/ChamadosTable';
import { ChamadoDetailView } from './components/ChamadoDetailView';
import { ChamadoForm } from './components/ChamadoForm';
import { ControleSidebar } from './components/ControleSidebar';
import { DeleteModal, WorkflowModal } from './components/ActionModals';
import { ToastContainer } from './components/ToastContainer';
import { Chamado } from './types/patrimonial';
import { Building2, ShieldCheck, HeartHandshake } from 'lucide-react';

const MainApp: React.FC = () => {
  const {
    activeView,
    deletarChamado,
    avancarStatus,
    rejeitarChamado,
    isSaving,
  } = usePatrimonial();

  // Delete modal state
  const [deleteChamadoTarget, setDeleteChamadoTarget] = useState<Chamado | null>(null);

  // Workflow modal state
  const [workflowState, setWorkflowState] = useState<{
    isOpen: boolean;
    chamado: Chamado | null;
    action: 'aprovar' | 'rejeitar' | 'avancar';
  }>({
    isOpen: false,
    chamado: null,
    action: 'aprovar',
  });

  const handleDeleteRequest = (chamado: Chamado) => {
    setDeleteChamadoTarget(chamado);
  };

  const handleConfirmDelete = async () => {
    if (deleteChamadoTarget) {
      await deletarChamado(deleteChamadoTarget.id);
      setDeleteChamadoTarget(null);
    }
  };

  const handleOpenWorkflowModal = (
    chamado: Chamado,
    action: 'aprovar' | 'rejeitar' | 'avancar'
  ) => {
    setWorkflowState({
      isOpen: true,
      chamado,
      action,
    });
  };

  const handleConfirmWorkflow = async (observacao: string) => {
    if (!workflowState.chamado) return;
    const { id } = workflowState.chamado;

    if (workflowState.action === 'rejeitar') {
      await rejeitarChamado(id, observacao);
    } else if (workflowState.action === 'aprovar') {
      await avancarStatus(id, 'Aprovado - Em Cotação', observacao);
    } else if (workflowState.action === 'avancar') {
      if (workflowState.chamado.status === 'Aprovado - Em Cotação') {
        await avancarStatus(id, 'Em Execução', observacao);
      } else if (workflowState.chamado.status === 'Em Execução') {
        await avancarStatus(id, 'Concluído', observacao);
      }
    }

    setWorkflowState({ isOpen: false, chamado: null, action: 'aprovar' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Corporate Navigation */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeView === 'dashboard' && (
          <div className="space-y-6">
            {/* Dashboard Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/80 gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Painel de Gestão Patrimonial
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Acompanhamento de requisições de compras, infraestrutura e manutenção predial entre unidades
                </p>
              </div>
            </div>

            {/* Dashboard Layout: Main Content (Left) + Control Menu (Right) */}
            <div className="flex flex-col lg:flex-row items-start gap-6">
              {/* Left Column: KPI Metrics & Chamados Table */}
              <div className="flex-1 min-w-0 w-full space-y-6">
                {/* KPI Metrics */}
                <KpiMetrics />

                {/* Chamados Interactive Table */}
                <ChamadosTable onDeleteRequest={handleDeleteRequest} />
              </div>

              {/* Right Column: Menu de Controle Lateral */}
              <ControleSidebar />
            </div>
          </div>
        )}

        {activeView === 'create' && <ChamadoForm isEditing={false} />}

        {activeView === 'edit' && <ChamadoForm isEditing={true} />}

        {activeView === 'detail' && (
          <ChamadoDetailView onOpenApprovalModal={handleOpenWorkflowModal} />
        )}
      </main>

      {/* Global Modals */}
      <DeleteModal
        isOpen={Boolean(deleteChamadoTarget)}
        chamado={deleteChamadoTarget}
        isSaving={isSaving}
        onClose={() => setDeleteChamadoTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      <WorkflowModal
        isOpen={workflowState.isOpen}
        chamado={workflowState.chamado}
        action={workflowState.action}
        isSaving={isSaving}
        onClose={() => setWorkflowState({ isOpen: false, chamado: null, action: 'aprovar' })}
        onConfirm={handleConfirmWorkflow}
      />

      {/* Toast Feedback Alerts */}
      <ToastContainer />

      {/* Corporate Footer (Hidden during document print) */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-slate-900 flex items-center justify-center text-white">
              <Building2 className="w-3 h-3 text-sky-400" />
            </div>
            <span className="font-semibold text-slate-700">
              Bravi Participações & Gestão Patrimonial S.A.
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Ambiente Integrado v2.4</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              SLA Corporativo Conforme
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <PatrimonialProvider>
      <MainApp />
    </PatrimonialProvider>
  );
}
