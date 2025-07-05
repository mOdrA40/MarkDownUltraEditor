/**
 * @fileoverview High-performance FilesTable using TanStack Table
 * @author Axel Modra
 */

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  Calendar,
  Copy,
  Download,
  ExternalLink,
  FileText,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { FileData } from '@/lib/supabase';

/**
 * Props interface for FilesTable
 */
interface FilesTableProps {
  files: FileData[];
  onOpen: (file: FileData) => void;
  onDelete: (file: FileData) => void;
  onDuplicate: (file: FileData) => void;
  onExport: (file: FileData) => void;
  formatDate: (date: string) => string;
  formatFileSize: (bytes: number) => string;
  isLoading?: boolean;
}

/**
 * High-performance FilesTable component with TanStack Table
 * Features:
 * - Sorting, filtering, row selection
 * - Virtualization ready
 * - Optimized re-renders
 * - Responsive design
 */
export const FilesTable: React.FC<FilesTableProps> = ({
  files,
  onOpen,
  onDelete,
  onDuplicate,
  onExport,
  formatDate,
  formatFileSize,
  isLoading = false,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  // Memoized columns definition for performance
  const columns = useMemo<ColumnDef<FileData>[]>(
    () => [
      // Selection column
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all files"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select file"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },

      // File name column
      {
        accessorKey: 'title',
        header: 'Name',
        cell: ({ row }) => {
          const file = row.original;
          return (
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="font-medium truncate max-w-[200px]">{file.title}</span>
                {file.tags && file.tags.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {file.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {file.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{file.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        },
        enableSorting: true,
        sortingFn: 'alphanumeric',
      },

      // File size column
      {
        accessorKey: 'fileSize',
        header: 'Size',
        cell: ({ row }) => {
          const size = row.getValue('fileSize') as number;
          return (
            <span className="text-sm text-muted-foreground">
              {size ? formatFileSize(size) : '-'}
            </span>
          );
        },
        enableSorting: true,
        sortingFn: 'basic',
      },

      // Last modified column
      {
        accessorKey: 'updatedAt',
        header: 'Modified',
        cell: ({ row }) => {
          const date = row.getValue('updatedAt') as string;
          const createdAt = row.original.createdAt;
          const displayDate = date || createdAt;

          return (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{displayDate ? formatDate(displayDate) : '-'}</span>
            </div>
          );
        },
        enableSorting: true,
        sortingFn: 'datetime',
      },

      // Actions column
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const file = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onOpen(file)}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(file)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport(file)}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(file)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableSorting: false,
        enableHiding: false,
        size: 60,
      },
    ],
    [onOpen, onDelete, onDuplicate, onExport, formatDate, formatFileSize]
  );

  // Initialize table with optimized configuration
  const table = useReactTable({
    data: files,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    // Performance optimizations
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableSorting: true,
    enableColumnFilters: true,
    // Disable features we don't need for better performance
    enableGlobalFilter: false,
    enableColumnResizing: false,
  });

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Loading skeleton rows don't have meaningful IDs
              <TableRow key={`loading-row-${index}`}>
                {columns.map((_, colIndex) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: Loading skeleton cells don't have meaningful IDs
                  <TableCell key={`loading-cell-${index}-${colIndex}`}>
                    <div className="h-4 bg-muted animate-pulse rounded" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} style={{ width: header.getSize() }}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onOpen(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No files found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
