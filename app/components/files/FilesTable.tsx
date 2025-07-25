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
} from "@tanstack/react-table";
import {
  Calendar,
  Copy,
  Download,
  ExternalLink,
  FileText,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDropdownPositioning } from "@/hooks/ui/useDropdownPositioning";
import type { FileData } from "@/lib/supabase";

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
  onTableReady?: (table: ReturnType<typeof useReactTable<FileData>>) => void;
  rowSelection: Record<string, boolean>;
  setRowSelection: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
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
  onTableReady,
  rowSelection,
  setRowSelection,
}) => {
  const dropdownPositioning = useDropdownPositioning();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns = useMemo<ColumnDef<FileData>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      {
        accessorKey: "title",
        header: "Name",
        cell: ({ row }) => {
          const file = row.original;
          return (
            <div className="flex items-center space-x-2 text-left w-full">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="font-medium truncate max-w-[200px]">
                  {file.title}
                </span>
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
        sortingFn: "alphanumeric",
      },
      {
        accessorKey: "fileSize",
        header: "Size",
        cell: ({ row }) => {
          const size = row.getValue("fileSize") as number;
          return (
            <span className="text-sm text-muted-foreground">
              {size ? formatFileSize(size) : "-"}
            </span>
          );
        },
        enableSorting: true,
        sortingFn: "basic",
      },
      {
        accessorKey: "updatedAt",
        header: "Modified",
        cell: ({ row }) => {
          const date = row.getValue("updatedAt") as string;
          const createdAt = row.original.createdAt;
          const displayDate = date || createdAt;

          return (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {displayDate ? formatDate(displayDate) : "-"}
              </span>
            </div>
          );
        },
        enableSorting: true,
        sortingFn: "datetime",
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const file = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={dropdownPositioning.align}
                side={dropdownPositioning.side}
                sideOffset={dropdownPositioning.sideOffset}
                alignOffset={dropdownPositioning.alignOffset}
                className="z-50 min-w-[140px] max-w-[200px] dropdown-table-view"
                onCloseAutoFocus={(e) => e.preventDefault()}
                avoidCollisions={true}
                collisionPadding={16}
                data-view-type="table"
              >
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpen(file);
                  }}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(file);
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onExport(file);
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(file);
                  }}
                  className="text-destructive"
                >
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
    [
      onOpen,
      onDelete,
      onDuplicate,
      onExport,
      formatDate,
      formatFileSize,
      dropdownPositioning,
    ]
  );

  const table = useReactTable({
    data: files,
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    // Use file ID as row ID to maintain consistent selection state
    getRowId: (row) => row.id || row.title,
    meta: {
      onOpen,
      onDelete,
      onDuplicate,
      onExport,
    },
  });

  useEffect(() => {
    if (onTableReady) {
      onTableReady(table);
    }
  }, [table, onTableReady]);

  const loadingSkeleton = (
    <div className="rounded-md border mt-2">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="py-4">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }, (_, index) => `loading-${index}`).map(
            (loadingId) => (
              <TableRow key={loadingId}>
                {columns.map((column) => (
                  <TableCell key={`${loadingId}-${column.id}`} className="py-3">
                    <div className="h-4 bg-muted animate-pulse rounded" />
                  </TableCell>
                ))}
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <>
      {isLoading ? (
        loadingSkeleton
      ) : (
        <div className="rounded-md border mt-2">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className="py-4"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
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
                    data-state={row.getIsSelected() && "selected"}
                    className={`hover:bg-muted/50 transition-colors cursor-pointer ${
                      row.getIsSelected()
                        ? "bg-muted/30 border-l-2 border-l-primary"
                        : ""
                    }`}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      const isCheckbox = target.closest('[role="checkbox"]');
                      const isDropdown =
                        target.closest('[role="button"]') ||
                        target.closest(".dropdown-trigger");

                      if (!isCheckbox && !isDropdown) {
                        onOpen(row.original);
                      }
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No files found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
};

export default FilesTable;
