import React from 'react';
import { cn } from '@/lib/utils';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({ className, ...props }) => (
  <div className="w-full overflow-x-auto rounded-2xl border border-border">
    <table className={cn('w-full min-w-[640px] border-collapse text-sm', className)} {...props} />
  </div>
);

export const TableHead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = (props) => (
  <thead className="bg-surface text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground" {...props} />
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = (props) => (
  <tbody className="divide-y divide-border" {...props} />
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className, ...props }) => (
  <tr className={cn('transition-colors hover:bg-surface/60', className)} {...props} />
);

export const TableHeaderCell: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <th className={cn('whitespace-nowrap px-4 py-3 font-semibold', className)} {...props} />
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <td className={cn('px-4 py-3 align-middle text-foreground', className)} {...props} />
);
