import React from 'react';
import { Check } from 'lucide-react';
import { VEHICLE_COLORS, VEHICLE_COLOR_IDS } from '@/data/vehicleColors';
import type { VehicleColorId } from '@/types';
import { cn } from '@/lib/utils';

export interface VehicleColorPickerProps {
  value: VehicleColorId;
  onChange: (color: VehicleColorId) => void;
  className?: string;
}

export const VehicleColorPicker: React.FC<VehicleColorPickerProps> = ({ value, onChange, className }) => (
  <div className={cn('flex flex-wrap gap-3', className)}>
    {VEHICLE_COLOR_IDS.map((id) => {
      const color = VEHICLE_COLORS[id];
      const selected = value === id;
      return (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          aria-label={color.label}
          aria-pressed={selected}
          className="flex flex-col items-center gap-1.5"
        >
          <span
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full border transition-all',
              selected ? 'border-primary-700 ring-2 ring-primary-100' : 'border-border'
            )}
            style={{ backgroundColor: color.hex }}
          >
            {selected && <Check className={cn('h-4 w-4', color.hex === '#FFFFFF' ? 'text-primary-800' : 'text-white')} />}
          </span>
          <span className="text-[11px] text-muted-foreground">{color.label}</span>
        </button>
      );
    })}
  </div>
);
