import React, { useRef } from 'react';
import { cn } from '@/lib/utils';

export interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const OtpInput: React.FC<OtpInputProps> = ({ length = 6, value, onChange, className }) => {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const setDigit = (index: number, digit: string) => {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join(''));
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    setDigit(index, digit);
    if (digit && index < length - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted.padEnd(length, '').slice(0, length).trimEnd());
    inputsRef.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className={cn('flex justify-between gap-2', className)} onPaste={handlePaste}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          value={digit}
          aria-label={`Chiffre ${index + 1}`}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="h-14 w-12 flex-1 rounded-xl border border-input bg-background text-center text-xl font-bold text-foreground outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        />
      ))}
    </div>
  );
};
