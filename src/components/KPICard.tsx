import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; isUp: boolean };
  description?: string;
  className?: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon: Icon, trend, description, className }) => {
  return (
    <div className={cn(
      "card-3d group relative",
      className
    )}>
      <div className="card-3d-inner glass-card p-5 rounded-2xl space-y-4 h-full relative overflow-hidden">
        {/* Hover gradient overlay */}
        <div className="absolute -inset-full top-0 left-0 w-full h-full bg-gradient-to-tr from-primary/5 via-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />

        <div className="flex justify-between items-start relative z-10">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/15 to-violet-500/10 border border-primary/10 group-hover:border-primary/20 transition-all duration-300">
            <Icon className="w-5 h-5 text-primary group-hover:text-primary transition-colors" />
          </div>
          {trend && (
            <div className={cn(
              "text-xs font-bold px-2.5 py-1 rounded-full border transition-all duration-300 group-hover:scale-105",
              trend.isUp
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-500/15"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20 group-hover:bg-rose-500/15"
            )}>
              <span className={trend.isUp ? "text-gradient-emerald" : "text-gradient-rose"}>
                {trend.isUp ? "+" : "-"}{trend.value}%
              </span>
            </div>
          )}
        </div>

        <div className="relative z-10">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-2xl font-heading font-extrabold tracking-tight text-white group-hover:text-gradient transition-all duration-300">
            <span className="stat-value">{value}</span>
          </h3>
        </div>

        {description && (
          <p className="text-xs text-muted-foreground/80 relative z-10 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-primary/50" />
            {description}
          </p>
        )}

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-primary/0 via-primary/20 to-violet-500/0 opacity-0 group-hover:opacity-100 transition-all duration-500" />
      </div>
    </div>
  );
};

export default KPICard;
export { cn };
