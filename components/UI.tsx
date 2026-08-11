import React from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'gold' | 'midnight' | 'danger' | 'outline' | 'ghost' }> = ({ 
  children, 
  variant = 'gold', 
  className = '', 
  ...props 
}) => {
  const baseStyle = "px-5 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform active:scale-95";
  const variants = {
    gold: "bg-gradient-to-r from-amber-600 to-amber-400 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 border border-amber-400/20",
    midnight: "bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 shadow-lg",
    danger: "bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white",
    outline: "border border-slate-600 text-slate-300 hover:border-amber-400 hover:text-amber-400 bg-transparent",
    ghost: "text-slate-400 hover:text-white hover:bg-white/5"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; noPadding?: boolean }> = ({ children, className = '', noPadding = false }) => (
  <div className={`glass-panel rounded-2xl ${noPadding ? '' : 'p-6'} ${className}`}>
    {children}
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string; icon?: React.ReactNode }> = ({ label, icon, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">{label}</label>}
    <div className="relative group">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors">
          {icon}
        </div>
      )}
      <input 
        className={`w-full bg-slate-900/50 border border-slate-700 text-slate-100 rounded-xl ${icon ? 'pl-10' : 'px-4'} py-3 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all placeholder-slate-600 ${className}`}
        {...props} 
      />
    </div>
  </div>
);

// Fix: Add className prop to Badge to support custom styling in App.tsx
export const Badge: React.FC<{ children: React.ReactNode; color?: 'gold' | 'green' | 'red' | 'blue' | 'slate'; className?: string }> = ({ children, color = 'blue', className = '' }) => {
    const colorClasses: Record<string, string> = {
        gold: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        red: 'bg-red-500/10 text-red-400 border-red-500/20',
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        slate: 'bg-slate-700/50 text-slate-300 border-slate-600',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colorClasses[color]} ${className}`}>
            {children}
        </span>
    );
}

export const StatCard: React.FC<{ label: string; value: string; trend?: string; icon?: React.ReactNode }> = ({ label, value, trend, icon }) => (
  <Card className="flex items-center justify-between group hover:border-amber-500/30 transition-colors">
    <div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
      <h3 className="text-2xl md:text-3xl font-display font-bold text-white">{value}</h3>
      {trend && <p className="text-emerald-400 text-xs mt-1 font-medium">{trend}</p>}
    </div>
    {icon && (
      <div className="p-3 bg-slate-800 rounded-xl text-slate-400 group-hover:text-amber-400 group-hover:bg-amber-500/10 transition-all">
        {icon}
      </div>
    )}
  </Card>
);