import React from 'react';
import { Urgencia } from '../types/patrimonial';
import { Flame, AlertTriangle, Clock4, ShieldCheck } from 'lucide-react';

interface UrgenciaBadgeProps {
  urgencia: Urgencia;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const UrgenciaBadge: React.FC<UrgenciaBadgeProps> = ({
  urgencia,
  size = 'md',
  showIcon = true,
}) => {
  let badgeStyles = 'bg-slate-100 text-slate-700 border-slate-300';
  let icon = <Clock4 className="w-3.5 h-3.5" />;

  switch (urgencia) {
    case 'Baixa':
      badgeStyles = 'bg-slate-100 text-slate-700 border-slate-300';
      icon = <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />;
      break;
    case 'Média':
      badgeStyles = 'bg-amber-50 text-amber-800 border-amber-300/80';
      icon = <Clock4 className="w-3.5 h-3.5 text-amber-600" />;
      break;
    case 'Alta':
      badgeStyles = 'bg-orange-50 text-orange-800 border-orange-300/80';
      icon = <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />;
      break;
    case 'Crítica/Emergencial':
      badgeStyles = 'bg-rose-50 text-rose-800 border-rose-300/80 font-bold';
      icon = <Flame className="w-3.5 h-3.5 text-rose-600 animate-pulse" />;
      break;
    default:
      badgeStyles = 'bg-slate-100 text-slate-700 border-slate-300';
      icon = <Clock4 className="w-3.5 h-3.5" />;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs whitespace-nowrap ${badgeStyles} ${sizeClasses[size]}`}
    >
      {showIcon && icon}
      <span>{urgencia}</span>
    </span>
  );
};
