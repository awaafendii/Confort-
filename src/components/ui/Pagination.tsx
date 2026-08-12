import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconButton } from './IconButton';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/** Absente de tous les écrans de liste actuels, y compris Table (audit § 5). */
export const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange, className }) => {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-1', className)}>
      <IconButton
        icon={<ChevronLeft className="h-4 w-4" />}
        aria-label="Page précédente"
        size="sm"
        variant="outline"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      />
      <span className="px-3 text-body-sm text-muted-foreground">
        Page {page} / {totalPages}
      </span>
      <IconButton
        icon={<ChevronRight className="h-4 w-4" />}
        aria-label="Page suivante"
        size="sm"
        variant="outline"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      />
    </nav>
  );
};
