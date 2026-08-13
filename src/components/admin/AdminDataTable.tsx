import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Checkbox,
  EmptyState,
  ErrorState,
  Pagination,
  Skeleton,
  SkeletonGroup,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/components/ui';

export interface AdminDataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  /** Rend la colonne triable — reçoit la valeur comparable extraite de la ligne. */
  sortValue?: (row: T) => string | number;
  headerClassName?: string;
  cellClassName?: string;
}

export interface AdminDataTableProps<T> {
  columns: AdminDataTableColumn<T>[];
  /** Lignes déjà filtrées par l'appelant (recherche/chips) — le tableau gère tri, pagination et états. */
  rows: T[];
  rowKey: (row: T) => string;
  pageSize?: number;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  bulkActions?: (selectedIds: Set<string>) => React.ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
}

/**
 * Coquille de tableau générique pour l'espace admin — tri/pagination/sélection/états
 * gérés une seule fois ici plutôt que réimplémentés sur chacun des écrans Utilisateurs/
 * Chauffeurs/Courses/Paiements/Support (audit § "Grilles de statistiques", dette dupliquée).
 * La recherche et les filtres restent composés par la page appelante via SearchInput/
 * FilterChips — ce composant ne connaît que les lignes déjà filtrées.
 */
export function AdminDataTable<T>({
  columns,
  rows,
  rowKey,
  pageSize = 8,
  loading = false,
  error,
  onRetry,
  emptyIcon,
  emptyTitle = 'Aucun résultat',
  emptyDescription,
  selectable = false,
  selectedIds,
  onSelectionChange,
  bulkActions,
  onRowClick,
  className,
}: AdminDataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    setPage(1);
  }, [rows.length]);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((c) => c.key === sort.key);
    if (!column?.sortValue) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = column.sortValue!(a);
      const bv = column.sortValue!(b);
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sort.direction === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [rows, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (prev?.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
  };

  const allOnPageSelected = selectable && pageRows.length > 0 && pageRows.every((r) => selectedIds?.has(rowKey(r)));

  const toggleSelectAll = () => {
    if (!onSelectionChange || !selectedIds) return;
    const next = new Set(selectedIds);
    if (allOnPageSelected) pageRows.forEach((r) => next.delete(rowKey(r)));
    else pageRows.forEach((r) => next.add(rowKey(r)));
    onSelectionChange(next);
  };

  const toggleSelectRow = (id: string) => {
    if (!onSelectionChange || !selectedIds) return;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  if (error) {
    return <ErrorState description={error} onRetry={onRetry} className={className} />;
  }

  if (loading) {
    return (
      <SkeletonGroup className={cn('space-y-2', className)}>
        {Array.from({ length: pageSize }, (_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </SkeletonGroup>
    );
  }

  if (rows.length === 0) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} className={className} />;
  }

  return (
    <div className={className}>
      {selectable && selectedIds && selectedIds.size > 0 && bulkActions && (
        <div className="mb-3 flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-2.5">
          <p className="text-body-sm font-medium text-foreground">
            {selectedIds.size} sélectionné{selectedIds.size > 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">{bulkActions(selectedIds)}</div>
        </div>
      )}

      <Table>
        <TableHead>
          <TableRow>
            {selectable && (
              <TableHeaderCell className="w-10">
                <Checkbox aria-label="Tout sélectionner" checked={allOnPageSelected} onChange={toggleSelectAll} />
              </TableHeaderCell>
            )}
            {columns.map((column) => (
              <TableHeaderCell key={column.key} className={column.headerClassName}>
                {column.sortValue ? (
                  <button type="button" onClick={() => toggleSort(column.key)} className="flex items-center gap-1 hover:text-foreground">
                    {column.header}
                    {sort?.key === column.key ? (
                      sort.direction === 'asc' ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-40" />
                    )}
                  </button>
                ) : (
                  column.header
                )}
              </TableHeaderCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {pageRows.map((row) => {
            const id = rowKey(row);
            return (
              <TableRow key={id} className={onRowClick ? 'cursor-pointer' : undefined} onClick={onRowClick ? () => onRowClick(row) : undefined}>
                {selectable && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox aria-label="Sélectionner la ligne" checked={selectedIds?.has(id) ?? false} onChange={() => toggleSelectRow(id)} />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.cellClassName}>
                    {column.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-4" />}
    </div>
  );
}
