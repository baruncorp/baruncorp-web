"use client";
import {
  PaginationState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FindInvoicePaginatedHttpControllerGetParams,
  InvoicePaginatedResponseDto,
} from "@/api/api-spec";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatInEST } from "@/lib/utils";
import useClientInvoicesQuery from "@/queries/useClientInvoicesQuery";
import {
  InvoiceStatusEnum,
  invoiceStatuses,
  transformInvoiceStatusEnumWithEmptyStringIntoNullableInvoiceStatusEnum,
} from "@/lib/constants";
import EnumHeader from "@/components/table/EnumHeader";
import SearchHeader from "@/components/table/SearchHeader";
import useOnPaginationChange from "@/hook/useOnPaginationChange";

const columnHelper =
  createColumnHelper<InvoicePaginatedResponseDto["items"][number]>();

const TABLE_NAME = "ClientInvoices";

const StatusEnum = z.enum([
  InvoiceStatusEnum.Values.Issued,
  InvoiceStatusEnum.Values.Paid,
]);

type StatusEnum = z.infer<typeof StatusEnum>;

interface Props {
  type: "All" | StatusEnum;
  organizationId: string;
}

export default function ClientInvoicesTable({ type, organizationId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [syncedParams, setSyncedParams] =
    useState<FindInvoicePaginatedHttpControllerGetParams>();

  const orgNameSearchParamName = `${TABLE_NAME}${type}OrgName`;
  const invoiceStatusSearchParamName = `${TABLE_NAME}${type}InvoiceStatus`;
  const pageIndexSearchParamName = `${TABLE_NAME}${type}PageIndex`;
  const pageSizeSearchParamName = `${TABLE_NAME}${type}PageSize`;

  const pagination: PaginationState = {
    pageIndex: searchParams.get(encodeURIComponent(pageIndexSearchParamName))
      ? Number(searchParams.get(encodeURIComponent(pageIndexSearchParamName)))
      : 0,
    pageSize: searchParams.get(encodeURIComponent(pageSizeSearchParamName))
      ? Number(searchParams.get(encodeURIComponent(pageSizeSearchParamName)))
      : 10,
  };
  const orgNameSearchParam =
    searchParams.get(encodeURIComponent(orgNameSearchParamName)) ?? "";
  const invoiceStatusSearchParamParseResult = StatusEnum.safeParse(
    searchParams.get(encodeURIComponent(invoiceStatusSearchParamName))
  );
  const invoiceStatusSearchParam = invoiceStatusSearchParamParseResult.success
    ? invoiceStatusSearchParamParseResult.data
    : type === "All"
    ? ""
    : type;

  const onPaginationChange = useOnPaginationChange({
    pageIndexSearchParamName,
    pageSizeSearchParamName,
    pagination,
  });

  const params: FindInvoicePaginatedHttpControllerGetParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      status:
        transformInvoiceStatusEnumWithEmptyStringIntoNullableInvoiceStatusEnum.parse(
          invoiceStatusSearchParam
        ),
      organizationName: orgNameSearchParam,
      clientOrganizationId: organizationId,
    }),
    [
      invoiceStatusSearchParam,
      orgNameSearchParam,
      organizationId,
      pagination.pageIndex,
      pagination.pageSize,
    ]
  );

  const { data, isLoading, isFetching } = useClientInvoicesQuery(params, true);

  useEffect(() => {
    if (!isFetching) {
      setSyncedParams(params);
    }
  }, [isFetching, params]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("clientOrganization.name", {
        header: () => (
          <SearchHeader
            buttonText="Organization"
            searchParamName={orgNameSearchParamName}
            pageIndexSearchParamName={pageIndexSearchParamName}
            isLoading={
              syncedParams != null &&
              params.organizationName !== syncedParams.organizationName
            }
          />
        ),
      }),
      columnHelper.accessor("servicePeriodDate", {
        header: "Service Period Month",
        cell: ({ getValue }) =>
          format(new Date(getValue().slice(0, 7)), "MMM yyyy"),
      }),
      columnHelper.accessor("status", {
        header: () => (
          <EnumHeader
            buttonText="Status"
            searchParamName={invoiceStatusSearchParamName}
            pageIndexSearchParamName={pageIndexSearchParamName}
            zodEnum={StatusEnum}
            isLoading={
              syncedParams != null && params.status !== syncedParams.status
            }
            defaultValue={type === "All" ? null : type}
          />
        ),
        cell: ({ getValue }) => {
          const value = getValue();
          const status = invoiceStatuses[value];

          return (
            <div className={`flex items-center`}>
              <status.Icon className={`w-4 h-4 mr-2 ${status.color}`} />
              <span className="whitespace-nowrap">{status.value}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor("invoiceDate", {
        header: "Invoice Date (EST)",
        cell: ({ getValue }) => formatInEST(getValue()),
      }),
      columnHelper.accessor("terms", {
        header: "Terms",
      }),
      columnHelper.accessor("dueDate", {
        header: "Due Date (EST)",
        cell: ({ getValue }) => formatInEST(getValue()),
      }),
      columnHelper.accessor("notesToClient", {
        header: "Notes to Client",
      }),
      columnHelper.accessor((row) => `$${row.subtotal}`, {
        header: "Subtotal",
      }),
      columnHelper.accessor((row) => `$${row.discount}`, {
        header: "Discount",
      }),
      columnHelper.accessor((row) => `$${row.total}`, {
        header: "Total",
      }),
      columnHelper.accessor("createdAt", {
        header: "Date Created (EST)",
        cell: ({ getValue }) => formatInEST(getValue()),
      }),
    ],
    [
      invoiceStatusSearchParamName,
      orgNameSearchParamName,
      pageIndexSearchParamName,
      params.organizationName,
      params.status,
      syncedParams,
      type,
    ]
  );

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: ({ id }) => id,
    pageCount: data?.totalPage ?? -1,
    onPaginationChange,
    manualPagination: true,
    state: {
      pagination,
    },
  });

  return (
    <div className="space-y-2">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24">
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => {
                    router.push(`/invoices/client/${row.id}`);
                  }}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end items-center">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 25, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-8 w-8"
              size={"icon"}
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8"
              size={"icon"}
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8"
              size={"icon"}
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8"
              size={"icon"}
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}