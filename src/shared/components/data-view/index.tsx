import React, { ReactNode } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface ColumnDef<T> {
  header: string;
  cell: (item: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataViewProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  renderCard: (item: T) => ReactNode;
  isLoading?: boolean;
  emptyState?: ReactNode;
  keyExtractor: (item: T) => string | number;
  className?: string;
  tableClassName?: string;
  cardContainerClassName?: string;
}

export function DataView<T>({
  data,
  columns,
  renderCard,
  isLoading,
  emptyState,
  keyExtractor,
  className,
  tableClassName,
  cardContainerClassName,
}: DataViewProps<T>) {
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return emptyState;
  }

  return (
    <div className={cn("w-full", className)}>
      {/* DESKTOP VIEW: TABLE */}
      <div className={cn(
        "hidden lg:block w-full bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm",
        tableClassName
      )}>
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-50/60 border-b border-gray-100 hover:bg-gray-50/60">
                {columns.map((col, idx) => (
                  <TableHead 
                    key={idx} 
                    className={cn(
                      "h-11 px-5 text-xs font-semibold text-gray-700 border-none whitespace-nowrap",
                      col.headerClassName
                    )}
                  >
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow 
                  key={keyExtractor(item)} 
                  className="hover:bg-gray-50/50 transition-colors border-gray-50 group"
                >
                  {columns.map((col, idx) => (
                    <TableCell 
                      key={idx} 
                      className={cn("px-5 py-4 border-none", col.className)}
                    >
                      {col.cell(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* MOBILE/TABLET VIEW: CARDS */}
      <div className={cn(
        "lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4",
        cardContainerClassName
      )}>
        {data.map((item) => (
          <React.Fragment key={keyExtractor(item)}>
            {renderCard(item)}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
