import React from 'react';
import { usePatrimonial } from '../context/PatrimonialContext';
import { Building2, PlusCircle, RotateCcw, ShieldCheck, Layers, FileSpreadsheet } from 'lucide-react';

export const Header: React.FC = () => {
  const { activeView, setActiveView, selectChamado, resetarDados, chamados } = usePatrimonial();

  const handleNovoChamado = () => {
    selectChamado(null);
    setActiveView('create');
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-2xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & System Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView('dashboard')}
              className="flex items-center gap-3 text-left focus:outline-hidden group"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-slate-900 tracking-tight">BRAVI</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-blue-800 border border-blue-200">
                    Patrimonial
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-normal">
                  Gestão Integrada de Chamados & Facilities
                </p>
              </div>
            </button>
          </div>

          {/* Navigation & Action Buttons */}
          <div className="flex items-center gap-3">
            <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeView === 'dashboard'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                Painel Geral
                <span className="ml-1 text-[11px] font-semibold bg-slate-200/80 px-1.5 py-0.2 rounded-full text-slate-700">
                  {chamados.length}
                </span>
              </button>

              <button
                onClick={handleNovoChamado}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeView === 'create'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                Abertura de Chamado
              </button>
            </nav>

            <button
              onClick={resetarDados}
              title="Restaurar dados de exemplo da Bravi (ORC-420)"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 text-xs hidden sm:flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden lg:inline text-slate-600">Restaurar Mocks</span>
            </button>

            <button
              onClick={handleNovoChamado}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Novo Chamado</span>
            </button>

            {/* Profile Tag */}
            <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-700">
                KC
              </div>
              <div className="text-left leading-tight">
                <p className="text-xs font-semibold text-slate-800">Kleber Costa</p>
                <p className="text-[10px] text-slate-500">Gestor Patrimonial</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
