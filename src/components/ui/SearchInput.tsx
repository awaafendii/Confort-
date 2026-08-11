import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onClear, className, placeholder = 'Où allez-vous ?', ...props }, ref) => {
    return (
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'h-12 w-full rounded-xl border border-input bg-background pl-11 pr-10 text-[15px] text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-100',
            className
          )}
          {...props}
        />
        {value && (
          <button
            type="button"
            onClick={() => (onClear ? onClear() : onChange(''))}
            aria-label="Effacer la recherche"
            className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-surface hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';
