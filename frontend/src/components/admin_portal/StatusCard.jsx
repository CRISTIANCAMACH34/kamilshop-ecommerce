import React from 'react';
import { AlertTriangle, ArrowRight, Check, Info } from 'lucide-react';

/**
 * COMPONENTES DE STATUS Y ALERTAS — BUSINESS PORTAL
 * Primitivas desacopladas reutilizables para tarjetas de KPI y alertas operacionales.
 */

const toneClasses = {
  blue: {
    bg: 'bg-slate-100',
    text: 'text-slate-900',
    border: 'border-slate-200',
    icon: 'text-slate-800',
  },
  green: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: 'text-emerald-600',
  },
  orange: {
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-200',
    icon: 'text-slate-700',
  },
  red: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-100',
    icon: 'text-rose-500',
  },
  slate: {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-100',
    icon: 'text-slate-500',
  },
};

export function StatusAlert({
  label,
  value,
  tone = 'slate',
  icon,
  action,
  onClick,
  helper,
}) {
  const config = toneClasses[tone] || toneClasses.slate;
  const displayValue = typeof value === 'number' && value === 0 ? '0' : value;
  const isActionable = Boolean(action && onClick);

  const getDefaultIcon = () => {
    switch (tone) {
      case 'green':
        return <Check size={18} />;
      case 'orange':
      case 'red':
        return <AlertTriangle size={18} />;
      default:
        return <Info size={18} />;
    }
  };

  const cardClassName = `
    relative flex w-full flex-col gap-2 rounded-2xl border p-4 text-left transition-all duration-200
    ${config.bg} ${config.border}
    ${isActionable ? 'cursor-pointer hover:shadow-md hover:scale-[1.01]' : ''}
  `;
  const CardTag = isActionable ? 'button' : 'div';

  return (
    <CardTag
      {...(isActionable ? { type: 'button' } : {})}
      className={cardClassName}
      onClick={isActionable ? onClick : undefined}
    >
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold uppercase tracking-wider ${config.text} opacity-70`}>
          {label}
        </span>
        <span className={config.icon}>{icon || getDefaultIcon()}</span>
      </div>

      <div className="flex items-end justify-between gap-2">
        <span className={`text-2xl font-black tabular-nums ${config.text}`}>{displayValue}</span>
        {action && (
          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${config.text}`}>
            {action}
            {isActionable ? <ArrowRight size={14} className={`${config.icon} opacity-60`} /> : null}
          </span>
        )}
      </div>

      {helper && (
        <p className={`text-xs ${config.text} opacity-60`}>{helper}</p>
      )}
    </CardTag>
  );
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  onClick,
}) {
  const isPositiveTrend = trend && trend.value > 0;
  const isNegativeTrend = trend && trend.value < 0;

  let trendClassName = 'bg-slate-50 text-slate-600';
  if (isPositiveTrend) {
    trendClassName = 'bg-emerald-50 text-emerald-700';
  } else if (isNegativeTrend) {
    trendClassName = 'bg-rose-50 text-rose-700';
  }

  const cardClassName = `
    flex w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-200
    ${onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-md hover:scale-[1.01]' : ''}
  `;
  const CardTag = onClick ? 'button' : 'div';

  return (
    <CardTag
      {...(onClick ? { type: 'button' } : {})}
      className={cardClassName}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        {icon && (
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-800">
            {icon}
          </div>
        )}
        {trend && (
          <span
            className={`rounded-lg px-2 py-1 text-xs font-bold ${trendClassName}`}
          >
            {isPositiveTrend ? '+' : ''}
            {trend.value}%{trend.label ? ` ${trend.label}` : ''}
          </span>
        )}
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</p>
        <p className="mt-1 text-3xl font-black tabular-nums text-slate-900">{value}</p>
        {subtitle && <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>}
      </div>
    </CardTag>
  );
}

export function StatusBadge({ label, tone = 'blue' }) {
  const config = toneClasses[tone] || toneClasses.blue;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-black ${config.bg} ${config.text} border ${config.border}`}>
      {label}
    </span>
  );
}
