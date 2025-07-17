import type { useReactTable } from '@tanstack/react-table';
import type React from 'react';
import { useEffect, useState } from 'react';
import type { FileData } from '@/lib/supabase';
import { FilesTable } from './FilesTable';

/**
 * Client-side only wrapper for FilesTable to prevent SSR hydration issues
 * This component ensures the table only renders after hydration is complete
 */
interface ClientOnlyFilesTableProps {
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
  setRowSelection: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

/**
 * Loading placeholder that matches the table structure
 */
const TableLoadingPlaceholder: React.FC = () => (
  <div className="w-full">
    <div className="rounded-md border">
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {[1, 2, 3].map((id) => (
              <tr
                key={`loading-row-${id}`}
                className="border-b transition-colors hover:bg-muted/50"
              >
                <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="p-4 align-middle">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="p-4 align-middle">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="p-4 align-middle">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="p-4 align-middle">
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export const ClientOnlyFilesTable: React.FC<ClientOnlyFilesTableProps> = (props) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set client flag after component mounts (hydration complete)
    setIsClient(true);
  }, []);

  // During SSR and initial hydration, show loading placeholder
  if (!isClient) {
    return <TableLoadingPlaceholder />;
  }

  // After hydration, render the actual table
  return <FilesTable {...props} />;
};

export default ClientOnlyFilesTable;
