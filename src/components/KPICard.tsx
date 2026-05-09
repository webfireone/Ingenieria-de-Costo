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
  trend?: {
    value: number;
    isUp: boolean;
  };
  description?: string;
  className?: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon: Icon, trend, description, className }) => {
  return (
    <div className={cn("glass-card p-6 rounded-xl space-y-4 hover:border-primary/30 transition-colors", className)}>
      <div className="flex justify-between items-start">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        {trend && (
          <div className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            trend.isUp ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
          )}>
            {trend.isUp ? "+" : "-"}{trend.value}%
          </div>
        )}
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
      </div>

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

export default KPICard;
export { cn };
