import React, { useState, useMemo, useCallback } from "react";
import type { Column, SortState } from "../types";

interface DataTableProps<T extends Record<string, unknown>> {
  /** Row data — T is inferred from this */
  data: T[];
  /** Column definitions — keys must be valid keys of T */
  columns: Column<T>[];
  /** Return a stable, unique key for each row */
  getRowKey: (row: T) => string | number;
  /** Called when a row is clicked */
  onRowClick?: (row: T, index: number) => void;
  /** Accessible caption for screen readers */
  caption?: string;
  /** Show a loading skeleton */
  loading?: boolean;
  /** Message shown when data is empty */
  emptyMessage?: string;
  /** Extra class on the wrapper div */
  className?: string;
  /** Rows per page (undefined = no pagination) */
  pageSize?: number;
}

const SORT_ICONS: Record<"asc" | "desc" | "none", string> = {
  asc:  "↑",
  desc: "↓",
  none: "⇅",
};

/**
 * DataTable<T>
 *
 * A generic, client-side sortable data table.
 * Column `key` values are constrained to `keyof T`, so you can never
 * reference a column that doesn't exist on the row type.
 * `onRowClick` and `column.render` both receive the full T — no casting needed.
 *
 * @example
 * ```tsx
 * <DataTable
 *   data={users}
 *   columns={[
 *     { key: "name",  header: "Name",  sortable: true },
 *     { key: "email", header: "Email" },
 *     { key: "role",  header: "Role",
 *       render: (u) => <Badge color={u.role === "admin" ? "red" : "blue"}>{u.role}</Badge> },
 *   ]}
 *   getRowKey={(u) => u.id}
 *   onRowClick={(u) => navigate(`/users/${u.id}`)}
 * />
 * ```
 */
export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  getRowKey,
  onRowClick,
  caption,
  loading = false,
  emptyMessage = "No data to display",
  className,
  pageSize,
}: DataTableProps<T>): React.ReactElement {
  const [sort, setSort] = useState<SortState<T>>({
    column: null,
    direction: null,
  });
  const [page, setPage] = useState(1);

  // ─── Sort ───────────────────────────────────────────────────────────────────
  const handleHeaderClick = useCallback(
    (col: Column<T>) => {
      if (!col.sortable) return;
      setSort((prev) => {
        if (prev.column !== col.key) return { column: col.key, direction: "asc" };
        if (prev.direction === "asc")  return { column: col.key, direction: "desc" };
        return { column: null, direction: null };
      });
      setPage(1);
    },
    []
  );

  const sortedData = useMemo(() => {
    if (!sort.column || !sort.direction) return data;
    const col = sort.column;
    const dir = sort.direction === "asc" ? 1 : -1;
    return [...data].sort((a, b) => {
      const av = a[col];
      const bv = b[col];
      if (av == null && bv == null) return 0;
      if (av == null) return 1 * dir;
      if (bv == null) return -1 * dir;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [data, sort]);

  // ─── Pagination ─────────────────────────────────────────────────────────────
  const pagedData = useMemo(() => {
    if (!pageSize) return sortedData;
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, pageSize, page]);

  const totalPages = pageSize ? Math.ceil(data.length / pageSize) : 1;

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const sortIconFor = (col: Column<T>): string => {
    if (!col.sortable) return "";
    if (sort.column !== col.key) return SORT_ICONS.none;
    return sort.direction === "asc" ? SORT_ICONS.asc : SORT_ICONS.desc;
  };

  const ariaSortFor = (
    col: Column<T>
  ): React.AriaAttributes["aria-sort"] => {
    if (!col.sortable || sort.column !== col.key) return undefined;
    return sort.direction === "asc" ? "ascending" : "descending";
  };

  // ─── Styles (inline — no external CSS dependency) ───────────────────────────
  const th: React.CSSProperties = {
    padding: "10px 14px",
    textAlign: "left",
    fontWeight: 600,
    fontSize: 13,
    color: "#374151",
    borderBottom: "2px solid #e5e7eb",
    userSelect: "none",
    whiteSpace: "nowrap",
  };
  const td: React.CSSProperties = {
    padding: "10px 14px",
    fontSize: 14,
    color: "#111827",
    borderBottom: "1px solid #f3f4f6",
    verticalAlign: "middle",
  };

  return (
    <div className={className}>
      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div style={{ overflowX: "auto" }}>
        <table
          role="grid"
          aria-busy={loading}
          aria-rowcount={data.length}
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          {caption && (
            <caption style={{ textAlign: "left", padding: "8px 0", fontWeight: 600 }}>
              {caption}
            </caption>
          )}

          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  scope="col"
                  style={{
                    ...th,
                    width: col.width,
                    textAlign: col.align ?? "left",
                    cursor: col.sortable ? "pointer" : "default",
                  }}
                  onClick={() => handleHeaderClick(col)}
                  aria-sort={ariaSortFor(col)}
                >
                  {col.header}
                  {col.sortable && (
                    <span
                      aria-hidden="true"
                      style={{ marginLeft: 6, opacity: 0.45, fontSize: 11 }}
                    >
                      {sortIconFor(col)}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              /* Loading skeleton */
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} aria-hidden="true">
                  {columns.map((col) => (
                    <td key={String(col.key)} style={td}>
                      <div
                        style={{
                          height: 14,
                          borderRadius: 4,
                          background: "#e5e7eb",
                          animation: "pulse 1.5s infinite",
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : pagedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ ...td, textAlign: "center", color: "#9ca3af", padding: 32 }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pagedData.map((row, index) => (
                <tr
                  key={getRowKey(row)}
                  role="row"
                  aria-rowindex={(page - 1) * (pageSize ?? 0) + index + 2}
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                  onKeyDown={
                    onRowClick
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onRowClick(row, index);
                          }
                        }
                      : undefined
                  }
                  style={{
                    cursor: onRowClick ? "pointer" : "default",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={
                    onRowClick
                      ? (e) => {
                          (e.currentTarget as HTMLTableRowElement).style.background =
                            "#f9fafb";
                        }
                      : undefined
                  }
                  onMouseLeave={
                    onRowClick
                      ? (e) => {
                          (e.currentTarget as HTMLTableRowElement).style.background =
                            "";
                        }
                      : undefined
                  }
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      role="gridcell"
                      style={{ ...td, textAlign: col.align ?? "left" }}
                    >
                      {col.render
                        ? col.render(row, index)
                        : String(row[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {pageSize && totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 4px 0",
            fontSize: 13,
            color: "#6b7280",
          }}
        >
          <span>
            Showing {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, data.length)} of {data.length}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
              style={{ padding: "4px 10px", cursor: page === 1 ? "not-allowed" : "pointer" }}
            >
              ‹ Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
              style={{
                padding: "4px 10px",
                cursor: page === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
