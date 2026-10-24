import React from 'react';
import { StatusChamado } from '../types/patrimonial';
import { Clock, CheckCircle2, AlertCircle, PlayCircle, XCircle, FileEdit, Ban } from 'lucide-react';

interface StatusBadgeProps {
  status: StatusChamado;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  let badgeStyles = 'bg-slate-100 text-slate-700 border-slate-300';
  let icon = <Clock className="w-3.5 h-3.5" />;

  switch (status) {
    case 'Rascunho':
      badgeStyles = 'bg-slate-100 text-slate-700 border-slate-300';
      icon = <FileEdit className="w-3.5 h-3.5" />;
      break;
    case 'Pendente de Aprovação':
      badgeStyles = 'bg-amber-50 text-amber-800 border-amber-300/80';
      icon = <Clock className="w-3.5 h-3.5 text-amber-600" />;
      break;
    case 'Aprovado - Em Cotação':
      badgeStyles = 'bg-sky-50 text-sky-800 border-sky-300/80';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />;
      break;
    case 'Em Execução':
      badgeStyles = 'bg-indigo-50 text-indigo-800 border-indigo-300/80';
      icon = <PlayCircle className="w-3.5 h-3.5 text-indigo-600" />;
      break;
    case 'Concluído':
      badgeStyles = 'bg-emerald-50 text-emerald-800 border-emerald-300/80';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      break;
    case 'Rejeitado':
      badgeStyles = 'bg-rose-50 text-rose-800 border-rose-300/80';
      icon = <XCircle className="w-3.5 h-3.5 text-rose-600" />;
      break;
    case 'Cancelado':
      badgeStyles = 'bg-zinc-100 text-zinc-600 border-zinc-300';
      icon = <Ban className="w-3.5 h-3.5 text-zinc-500" />;
      break;
    default:
      badgeStyles = 'bg-slate-100 text-slate-700 border-slate-300';
      icon = <AlertCircle className="w-3.5 h-3.5" />;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs whitespace-nowrap tracking-wide transition-all ${badgeStyles} ${sizeClasses[size]}`}
    >
      {showIcon && icon}
      <span>{status}</span>
    </span>
  );
};
